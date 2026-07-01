import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, TERMS } from "@/lib/legal-content";

export const Route = createFileRoute("/terms")({
  head: () => ({ meta: [{ title: "Terms & Conditions — Metier" }, { property: "og:url", content: "/terms" }], links: [{ rel: "canonical", href: "/terms" }] }),
  component: () => <LegalPage title="Terms & Conditions" sections={TERMS} />,
});
