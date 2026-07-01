import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, PRIVACY } from "@/lib/legal-content";

export const Route = createFileRoute("/privacy")({
  head: () => ({ meta: [{ title: "Privacy Policy — Metier" }, { property: "og:url", content: "/privacy" }], links: [{ rel: "canonical", href: "/privacy" }] }),
  component: () => <LegalPage title="Privacy Policy" sections={PRIVACY} />,
});
