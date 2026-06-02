export default function OrderSummary({
  items,
  subtotal,
  shipping,
  shippingNote,
  total,
}) {
  return (
    <div className="rounded-xl bg-surface-container p-6">
      <ul className="space-y-4">
        {items.map((item) => (
          <li key={item.name} className="flex gap-4">
            <div className="relative shrink-0">
              <img
                src={item.image}
                alt={item.name}
                className="h-14 w-14 rounded-md object-cover"
              />
              {item.quantity > 1 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#727973] text-[10px] text-white">
                  {item.quantity}
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-body text-sm font-medium text-charcoal">{item.name}</p>
              <p className="font-body text-xs text-[#727973]">{item.variant}</p>
            </div>
            <p className="shrink-0 font-body text-sm font-medium text-charcoal">
              {item.price}
            </p>
          </li>
        ))}
      </ul>

      <div className="my-6 border-t border-[#e4e2dd]" />

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Discount code"
          className="flex-1 rounded-md border border-[#e4e2dd] bg-white px-4 py-2 font-body text-sm outline-none focus:border-primary-container"
        />
        <button
          type="button"
          className="rounded-md bg-[#e4e2dd] px-4 py-2 font-body text-sm text-charcoal hover:bg-surface-high"
        >
          Apply
        </button>
      </div>

      <div className="my-6 border-t border-[#e4e2dd]" />

      <div className="space-y-2 font-body text-sm">
        <div className="flex justify-between text-on-surface-variant">
          <span>Subtotal</span>
          <span>{subtotal}</span>
        </div>
        <div className="flex justify-between text-on-surface-variant">
          <span>Shipping</span>
          <span className={shippingNote ? 'text-[#727973]' : ''}>
            {shipping || shippingNote}
          </span>
        </div>
      </div>

      <div className="my-6 border-t border-[#e4e2dd]" />

      <div className="flex items-center justify-between">
        <span className="font-body text-base text-charcoal">Total</span>
        <span className="font-display text-[28px] text-charcoal">{total}</span>
      </div>
    </div>
  );
}
