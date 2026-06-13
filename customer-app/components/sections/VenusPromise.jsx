'use client';

const promiseItems = [
  {
    icon: 'volunteer_activism',
    title: 'Handmade with Care',
    description: 'Artisanal production in small, mindful batches.',
  },
  {
    icon: 'spa',
    title: '100% Natural',
    description: 'Pure, untainted ingredients straight from nature.',
  },
  {
    icon: 'eco',
    title: 'Eco-Friendly',
    description: 'Sustainable packaging for a healthier planet.',
  },
  {
    icon: 'landscape',
    title: 'Nilgiri Fresh',
    description: 'Sourced directly from the pristine Ooty highlands.',
  },
];

export default function VenusPromise() {
  return (
    <section className="section-spacing bg-surface-container-low">
      <div className="mx-auto max-w-container-max px-margin-mobile md:px-margin-desktop text-center">

        {/* Section heading */}
        <div className="mb-10">
          <p className="font-body text-xs font-semibold uppercase tracking-[0.25em] text-sand mb-3">
            Our Values
          </p>
          <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary">
            The Venus Promise
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-gutter">
          {promiseItems.map((item) => (
            <div
              key={item.title}
              className="flex flex-col items-center px-4"
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-stack-md text-primary shrink-0">
                <span className="material-symbols-outlined text-3xl" data-icon={item.icon}>
                  {item.icon}
                </span>
              </div>
              <h3 className="font-display text-xl text-primary mb-2">
                {item.title}
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
