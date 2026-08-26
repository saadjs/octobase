/** A hearth with a merge graph under its roof. The node carries the one brand accent. */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2.2}
      viewBox="0 0 32 32"
    >
      <path d="M4.5 14.5 16 5l11.5 9.5V26a1.5 1.5 0 0 1-1.5 1.5H6A1.5 1.5 0 0 1 4.5 26z" />
      <path d="M11 25.5v-5L16 16" strokeWidth={2} />
      <path d="M21 25.5v-5L16 16" strokeWidth={2} />
      <circle cx="16" cy="14" fill="var(--brand-accent)" r="2.7" stroke="none" />
    </svg>
  );
}
