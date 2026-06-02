import Link from 'next/link';

export default function Breadcrumb({ items, className = '' }) {
  return (
    <nav
      className={`font-body text-[13px] text-[#727973] ${className}`}
      aria-label="Breadcrumb"
    >
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-1">
            {index > 0 && <span className="mx-1">›</span>}
            {item.href ? (
              <Link href={item.href} className="hover:text-primary-container">
                {item.label}
              </Link>
            ) : (
              <span className={item.active ? 'text-charcoal' : ''}>
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
