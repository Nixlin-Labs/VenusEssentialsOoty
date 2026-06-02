import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface px-5 text-center">
      <h1 className="font-display text-4xl text-charcoal">Page not found</h1>
      <p className="mt-4 font-body text-on-surface-variant">
        This path has wandered off the Nilgiri trails.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-full bg-primary-container px-8 py-3 font-body text-sm text-white hover:bg-secondary"
      >
        Return Home
      </Link>
    </div>
  );
}
