import { motion } from "framer-motion";

/**
 * Hand-drawn SVG product visuals. Replaces stock photography
 * with editorial illustrations in gold-on-noir.
 */
export function ProductMark({ kind, className = "" }: { kind: string; className?: string }) {
  const props = {
    fill: "none",
    strokeWidth: 0.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  return (
    <motion.svg
      viewBox="0 0 100 100"
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2, ease: "easeOut" }}
    >
      <defs>
        <linearGradient id={`g-${kind}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="oklch(0.82 0.13 85)" />
          <stop offset="100%" stopColor="oklch(0.92 0.08 92)" />
        </linearGradient>
      </defs>
      <g stroke={`url(#g-${kind})`} {...props}>
        {kind === "card" && (
          <>
            <rect x="20" y="35" width="60" height="32" rx="2" />
            <rect x="24" y="30" width="60" height="32" rx="2" opacity="0.5" />
            <line x1="28" y1="46" x2="58" y2="46" />
            <line x1="28" y1="52" x2="48" y2="52" />
            <circle cx="68" cy="50" r="3" />
          </>
        )}
        {kind === "press" && (
          <>
            <rect x="22" y="30" width="56" height="40" rx="1" />
            <line x1="22" y1="40" x2="78" y2="40" />
            <text x="50" y="58" textAnchor="middle" fontSize="10" fill={`url(#g-${kind})`} fontFamily="serif" fontStyle="italic">æ</text>
          </>
        )}
        {kind === "letter" && (
          <>
            <rect x="28" y="20" width="44" height="60" rx="1" />
            <line x1="34" y1="32" x2="66" y2="32" />
            <line x1="34" y1="40" x2="60" y2="40" />
            <line x1="34" y1="46" x2="62" y2="46" />
            <line x1="34" y1="52" x2="56" y2="52" />
          </>
        )}
        {kind === "envelope" && (
          <>
            <rect x="18" y="32" width="64" height="40" rx="1" />
            <path d="M18 32 L50 56 L82 32" />
          </>
        )}
        {kind === "brochure" && (
          <>
            <rect x="18" y="28" width="32" height="46" rx="1" />
            <rect x="50" y="28" width="32" height="46" rx="1" />
            <line x1="24" y1="38" x2="44" y2="38" />
            <line x1="24" y1="44" x2="40" y2="44" />
            <line x1="56" y1="38" x2="76" y2="38" />
          </>
        )}
        {kind === "poster" && (
          <>
            <rect x="28" y="18" width="44" height="64" rx="1" />
            <circle cx="50" cy="42" r="10" />
            <line x1="34" y1="62" x2="66" y2="62" />
            <line x1="34" y1="68" x2="58" y2="68" />
          </>
        )}
        {kind === "box" && (
          <>
            <path d="M22 38 L50 28 L78 38 L78 70 L50 80 L22 70 Z" />
            <path d="M22 38 L50 48 L78 38" />
            <line x1="50" y1="48" x2="50" y2="80" />
          </>
        )}
        {kind === "book" && (
          <>
            <rect x="24" y="20" width="52" height="62" rx="1" />
            <line x1="32" y1="20" x2="32" y2="82" />
            <line x1="42" y1="34" x2="68" y2="34" />
            <line x1="42" y1="42" x2="64" y2="42" />
            <line x1="42" y1="50" x2="66" y2="50" />
          </>
        )}
      </g>
    </motion.svg>
  );
}
