import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, REFUND } from "@/lib/legal-content";

export const Route = createFileRoute("/refund")({
  head: () => ({ meta: [{ title: "Refund Policy — Metier" }, { property: "og:url", content: "/refund" }], links: [{ rel: "canonical", href: "/refund" }] }),
  component: () => <LegalPage title="Refund Policy" sections={REFUND} />,
});
