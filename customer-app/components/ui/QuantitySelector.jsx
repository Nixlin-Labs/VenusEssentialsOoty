'use client';

export default function QuantitySelector({
  quantity,
  onDecrease,
  onIncrease,
  size = 'md',
}) {
  const sizeClasses =
    size === 'sm'
      ? 'h-7 text-sm'
      : 'h-10 text-base';

  return (
    <div
      className={`inline-flex items-center rounded-md border border-outline-variant ${sizeClasses}`}
    >
      <button
        type="button"
        onClick={onDecrease}
        className="flex h-full w-8 items-center justify-center text-on-surface-variant transition-colors hover:bg-surface-container"
        aria-label="Decrease quantity"
      >
        −
      </button>
      <span className="flex min-w-[2rem] items-center justify-center border-x border-outline-variant px-2 font-body">
        {quantity}
      </span>
      <button
        type="button"
        onClick={onIncrease}
        className="flex h-full w-8 items-center justify-center text-on-surface-variant transition-colors hover:bg-surface-container"
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}
