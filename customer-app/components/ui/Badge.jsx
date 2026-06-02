export default function Badge({ children, className = '' }) {
  return (
    <span
      className={`inline-block rounded-full bg-badge-bg px-3 py-1 font-body text-[11px] font-medium uppercase tracking-wider text-sand ${className}`}
    >
      {children}
    </span>
  );
}
