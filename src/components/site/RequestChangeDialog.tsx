import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Ban, MapPin, Pencil, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { createChangeRequest } from "@/lib/order-requests.functions";
import { AddressForm, type AddressFormValue } from "@/components/site/AddressForm";

type Kind = "cancel" | "edit_address" | "edit_items" | "other";

const META: Record<Kind, { label: string; icon: typeof Ban; helper: string }> = {
  cancel: { label: "Cancel order", icon: Ban, helper: "Tell us why you'd like to cancel." },
  edit_address: { label: "Change shipping address", icon: MapPin, helper: "Provide the new delivery address." },
  edit_items: { label: "Change items or quantities", icon: Pencil, helper: "Describe the change in detail." },
  other: { label: "Something else", icon: MessageSquare, helper: "We'll read this and reply." },
};

export function RequestChangeDialog({
  open,
  orderId,
  onClose,
  onCreated,
  initialKind = "cancel",
}: {
  open: boolean;
  orderId: string;
  onClose: () => void;
  onCreated?: () => void;
  initialKind?: Kind;
}) {
  const create = useServerFn(createChangeRequest);
  const [kind, setKind] = useState<Kind>(initialKind);
  const [message, setMessage] = useState("");
  const [address, setAddress] = useState<AddressFormValue | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    try {
      if (kind === "edit_address") {
        if (!address) {
          toast.error("Please fill the new address.");
          return;
        }
        await create({
          data: {
            kind: "edit_address",
            orderId,
            message: message.trim() || undefined,
            address: {
              line1: address.line1,
              line2: address.line2 || null,
              city: address.city,
              state: address.state,
              pincode: address.pincode,
              contact_name: address.contactName,
              contact_phone: address.contactPhone,
            },
          },
        });
      } else if (kind === "cancel") {
        await create({ data: { kind: "cancel", orderId, message: message.trim() || undefined } });
      } else {
        if (message.trim().length < 2) {
          toast.error("Please add a short note.");
          return;
        }
        await create({ data: { kind, orderId, message: message.trim() } });
      }
      toast.success("Request submitted");
      onCreated?.();
      reset();
      onClose();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not submit");
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    setKind(initialKind);
    setMessage("");
    setAddress(null);
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-ink/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => !busy && onClose()}
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl bg-card border border-border rounded-3xl p-8 my-8"
          >
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-display text-2xl">Request a change</h2>
              <button
                onClick={() => !busy && onClose()}
                className="p-1.5 hover:bg-white/5 rounded-full"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Our studio reviews and applies the change before the press run starts.
            </p>

            <div className="grid grid-cols-2 gap-2 mb-6">
              {(Object.keys(META) as Kind[]).map((k) => {
                const M = META[k];
                const active = kind === k;
                return (
                  <button
                    key={k}
                    onClick={() => setKind(k)}
                    type="button"
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm text-left transition-colors ${
                      active
                        ? "border-gold/60 bg-gold/10 text-foreground"
                        : "border-border text-muted-foreground hover:border-gold/30 hover:text-foreground"
                    }`}
                  >
                    <M.icon className="w-4 h-4 text-gold" />
                    {M.label}
                  </button>
                );
              })}
            </div>

            <p className="text-xs text-muted-foreground mb-3">{META[kind].helper}</p>

            {kind === "edit_address" ? (
              <div className="space-y-5">
                <AddressForm
                  initial={address ?? undefined}
                  submitLabel="Use this address"
                  onSubmit={(v) => setAddress(v)}
                />
                {address && (
                  <div className="text-xs text-emerald-300">
                    ✓ New address ready. Add a note below if needed and submit.
                  </div>
                )}
                <label className="block">
                  <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    Note (optional)
                  </span>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value.slice(0, 500))}
                    rows={2}
                    className="mt-1 w-full bg-transparent border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold/50"
                  />
                </label>
              </div>
            ) : (
              <label className="block">
                <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  {kind === "cancel" ? "Reason (optional)" : "Details"}
                </span>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value.slice(0, 1000))}
                  rows={4}
                  placeholder={
                    kind === "cancel"
                      ? "Tell us why — helps us improve."
                      : "Describe the change clearly."
                  }
                  className="mt-1 w-full bg-transparent border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold/50"
                />
                <span className="text-[10px] text-muted-foreground mt-1 inline-block">
                  {message.length}/{kind === "cancel" ? 500 : 1000}
                </span>
              </label>
            )}

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => !busy && onClose()}
                className="px-4 py-2 text-sm text-muted-foreground"
              >
                Close
              </button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                disabled={busy}
                onClick={submit}
                className="px-5 py-2.5 rounded-full bg-gold text-ink text-sm font-medium disabled:opacity-50"
              >
                {busy ? "Submitting…" : "Submit request"}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
