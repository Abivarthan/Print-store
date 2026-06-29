import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const AnalyzeInput = z.object({
  artworkId: z.string().uuid(),
  targetWidthIn: z.number().positive().max(60),
  targetHeightIn: z.number().positive().max(60),
  bleedIn: z.number().min(0).max(1).default(0.125),
});

type PrepressNote = { level: "ok" | "warn" | "fail"; label: string; detail?: string };

function readUInt32BE(b: Uint8Array, off: number) {
  return (b[off] << 24) | (b[off + 1] << 16) | (b[off + 2] << 8) | b[off + 3];
}

function parsePngSize(b: Uint8Array): { w: number; h: number } | null {
  // PNG signature
  const sig = [137, 80, 78, 71, 13, 10, 26, 10];
  for (let i = 0; i < 8; i++) if (b[i] !== sig[i]) return null;
  // IHDR begins at byte 16 (after 8 sig + 4 length + 4 type)
  const w = readUInt32BE(b, 16);
  const h = readUInt32BE(b, 20);
  return { w, h };
}

function parseJpegSize(b: Uint8Array): { w: number; h: number } | null {
  if (b[0] !== 0xff || b[1] !== 0xd8) return null;
  let i = 2;
  while (i < b.length - 8) {
    if (b[i] !== 0xff) {
      i++;
      continue;
    }
    const marker = b[i + 1];
    // SOF markers (skip DHT/DAC/non-SOF)
    if (
      (marker >= 0xc0 && marker <= 0xc3) ||
      (marker >= 0xc5 && marker <= 0xc7) ||
      (marker >= 0xc9 && marker <= 0xcb) ||
      (marker >= 0xcd && marker <= 0xcf)
    ) {
      const h = (b[i + 5] << 8) | b[i + 6];
      const w = (b[i + 7] << 8) | b[i + 8];
      return { w, h };
    }
    const segLen = (b[i + 2] << 8) | b[i + 3];
    if (segLen < 2) return null;
    i += 2 + segLen;
  }
  return null;
}

function detectColorProfile(b: Uint8Array): string {
  const head = new TextDecoder("latin1").decode(b.subarray(0, Math.min(b.length, 65536)));
  if (head.includes("Adobe RGB")) return "Adobe RGB";
  if (head.includes("ProPhoto")) return "ProPhoto";
  if (head.includes("CMYK")) return "CMYK";
  if (head.includes("sRGB") || head.includes("iCCP")) return "sRGB";
  return "sRGB (assumed)";
}

export const analyzeArtwork = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => AnalyzeInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: row, error: rowErr } = await supabase
      .from("artworks")
      .select("id, storage_path, content_type, file_size")
      .eq("id", data.artworkId)
      .single();
    if (rowErr || !row) throw new Error("Artwork not found");

    await supabase.from("artworks").update({ status: "analyzing" }).eq("id", row.id);

    const notes: PrepressNote[] = [];
    let width: number | null = null;
    let height: number | null = null;
    let dpi: number | null = null;
    let bleedOk = false;
    let colorProfile = "sRGB (assumed)";

    try {
      const { data: file, error: dlErr } = await supabase.storage.from("artworks").download(row.storage_path);
      if (dlErr || !file) throw new Error("Could not read file from storage");
      const buf = new Uint8Array(await file.arrayBuffer());

      const ct = row.content_type.toLowerCase();
      if (ct.includes("png")) {
        const dim = parsePngSize(buf);
        if (dim) {
          width = dim.w;
          height = dim.h;
        }
      } else if (ct.includes("jpeg") || ct.includes("jpg")) {
        const dim = parseJpegSize(buf);
        if (dim) {
          width = dim.w;
          height = dim.h;
        }
      } else if (ct.includes("pdf")) {
        notes.push({
          level: "warn",
          label: "PDF detected",
          detail: "Vector files are accepted, but our prepress team will manually verify fonts, bleed, and color separations.",
        });
      } else {
        notes.push({
          level: "warn",
          label: "Format requires manual review",
          detail: `${row.content_type} can't be auto-checked. Our team will review within 24h.`,
        });
      }

      colorProfile = detectColorProfile(buf);

      if (width && height) {
        const totalW = data.targetWidthIn + 2 * data.bleedIn;
        const totalH = data.targetHeightIn + 2 * data.bleedIn;
        const dpiW = width / totalW;
        const dpiH = height / totalH;
        dpi = Math.round(Math.min(dpiW, dpiH));

        if (dpi >= 300) {
          notes.push({ level: "ok", label: `Resolution ${dpi} DPI`, detail: "Press-ready at this size." });
        } else if (dpi >= 220) {
          notes.push({
            level: "warn",
            label: `Resolution ${dpi} DPI`,
            detail: "Acceptable for soft surfaces, slight softness possible on fine type.",
          });
        } else {
          notes.push({
            level: "fail",
            label: `Resolution ${dpi} DPI — too low`,
            detail: `Need ≥ 300 DPI for ${data.targetWidthIn}″ × ${data.targetHeightIn}″. Upload a higher-resolution file.`,
          });
        }

        // Bleed check: file must include the bleed area
        const expectedW = Math.round(300 * totalW);
        const expectedH = Math.round(300 * totalH);
        bleedOk = width >= expectedW * 0.95 && height >= expectedH * 0.95;
        if (bleedOk) {
          notes.push({ level: "ok", label: "Bleed included", detail: `${data.bleedIn}″ bleed on each side.` });
        } else {
          notes.push({
            level: "warn",
            label: "Bleed may be missing",
            detail: `Add ${data.bleedIn}″ bleed on each side to avoid white edges after trim.`,
          });
        }
      }

      if (row.file_size > 25 * 1024 * 1024) {
        notes.push({ level: "warn", label: "Large file", detail: "Upload OK, but consider flattening layers." });
      }

      notes.push({ level: "ok", label: `Color profile: ${colorProfile}` });

      const hasFail = notes.some((n) => n.level === "fail");
      const hasWarn = notes.some((n) => n.level === "warn");
      const status = hasFail ? "review_needed" : hasWarn ? "review_needed" : "ready";

      await supabase
        .from("artworks")
        .update({
          status,
          width_px: width,
          height_px: height,
          dpi_estimate: dpi,
          color_profile: colorProfile,
          bleed_ok: bleedOk,
          prepress_notes: notes,
        })
        .eq("id", row.id);

      return { ok: true as const, status, width, height, dpi, colorProfile, bleedOk, notes };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      await supabase
        .from("artworks")
        .update({ status: "failed", prepress_notes: [{ level: "fail", label: "Analysis failed", detail: message }] })
        .eq("id", row.id);
      return { ok: false as const, error: message, notes: [] as PrepressNote[] };
    }
  });

const SignInput = z.object({ artworkId: z.string().uuid() });

export const getArtworkSignedUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => SignInput.parse(d))
  .handler(async ({ data, context }) => {
    const { data: row } = await context.supabase
      .from("artworks")
      .select("storage_path, content_type")
      .eq("id", data.artworkId)
      .single();
    if (!row) throw new Error("Not found");
    const { data: signed, error } = await context.supabase.storage
      .from("artworks")
      .createSignedUrl(row.storage_path, 60 * 10);
    if (error || !signed) throw new Error(error?.message ?? "Could not sign URL");
    return { url: signed.signedUrl, contentType: row.content_type };
  });
