import { Link } from "@tanstack/react-router";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";

type Section = { h: string; p: string };

export function LegalPage({ title, sections }: { title: string; sections: Section[] }) {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <Breadcrumbs items={[{ label: title }]} />
      <h1 className="font-display text-4xl md:text-5xl font-bold text-burgundy">{title}</h1>
      <p className="text-ink/50 text-sm mt-2">Last updated {new Date().getFullYear()}</p>
      <div className="mt-10 space-y-8">
        {sections.map((s) => (
          <section key={s.h}>
            <h2 className="font-display text-xl font-bold text-burgundy mb-2">{s.h}</h2>
            <p className="text-ink/70 leading-relaxed">{s.p}</p>
          </section>
        ))}
      </div>
      <div className="mt-12 text-sm text-ink/50">
        Questions? <Link to="/contact" className="text-burgundy underline underline-offset-4">Contact us</Link>.
      </div>
    </div>
  );
}

export const PRIVACY: Section[] = [
  { h: "Information we collect", p: "We collect only what's needed to fulfill your order — contact information, shipping address, and payment details processed by our secure provider." },
  { h: "How we use it", p: "To produce and dispatch your order, respond to inquiries, and — with your consent — send occasional atelier updates." },
  { h: "Third parties", p: "We share information only with production and shipping partners essential to fulfilling your order." },
  { h: "Your rights", p: "You can request access, correction, or deletion of your data at any time by emailing studio@metierprint.com." },
];

export const TERMS: Section[] = [
  { h: "Ordering", p: "By placing an order you confirm that all files and artwork are yours to reproduce or that you have secured the necessary rights." },
  { h: "Turnaround", p: "Stated turnarounds begin once your file has been approved by our production team. Rush options are available for most items." },
  { h: "Colour", p: "Because of variations in monitor calibration, printed colour may differ slightly from screen preview. Request a physical proof for exact matching." },
  { h: "Liability", p: "Our liability is limited to the value of the order in the event of a production error caused by us." },
];

export const REFUND: Section[] = [
  { h: "Reprints", p: "If we've missed the spec, we'll reprint at no charge and cover shipping." },
  { h: "Refunds", p: "Refunds are available where a reprint is not practical. Because every order is bespoke, we can't accept returns for a change of mind." },
  { h: "Damage in transit", p: "Notify us within 48 hours of delivery with photos — we'll arrange a replacement immediately." },
  { h: "Cancellations", p: "Orders can be cancelled at no cost before production begins. Once printing has started, cancellation fees may apply." },
];
