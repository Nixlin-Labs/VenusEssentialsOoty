import Link from "next/link";
import { footerLinks } from "@/lib/data";
import { useSettingsStore } from "@/lib/settingsStore";

function InstagramIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="18" cy="6" r="1" fill="currentColor" />
    </svg>
  );
}

function PinterestIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12c0 4.24 2.58 7.87 6.26 9.4-.09-.79-.17-2 .03-2.86.19-.82 1.22-5.52 1.22-5.52s-.31-.62-.31-1.54c0-1.44.84-2.52 1.88-2.52.89 0 1.32.67 1.32 1.47 0 .89-.57 2.23-.86 3.47-.24 1.04.52 1.89 1.54 1.89 1.85 0 3.27-1.95 3.27-4.76 0-2.49-1.79-4.23-4.34-4.23-2.95 0-4.69 2.21-4.69 4.5 0 .89.34 1.85.77 2.37.08.1.09.19.07.29-.07.3-.23.94-.26 1.07-.04.17-.14.21-.32.13-1.2-.56-1.95-2.32-1.95-3.73 0-3.03 2.2-5.82 6.35-5.82 3.33 0 5.92 2.37 5.92 5.54 0 3.31-2.09 5.97-4.99 5.97-.97 0-1.89-.51-2.2-1.11l-.6 2.28c-.22.85-.81 1.92-1.21 2.57.91.28 1.87.43 2.87.43 5.52 0 10-4.48 10-10S17.52 2 12 2z" />
    </svg>
  );
}

function YoutubeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M21.8 8s-.2-1.4-.8-2c-.8-.8-1.6-.8-2-.9C16.8 5 12 5 12 5s-4.8 0-7 .1c-.4.1-1.3.1-2 .9-.6.6-.8 2-.8 2S2 9.6 2 11.2v1.5C2 14.4 2.2 16 2.2 16s.2 1.4.8 2c.8.8 1.8.8 2.3.9C6.8 19 12 19 12 19s4.8 0 7-.2c.4-.1 1.3-.1 2-.9.6-.6.8-2 .8-2s.2-1.6.2-3.2v-1.5C22 9.6 21.8 8 21.8 8zM10 15V9l5.5 3-5.5 3z" />
    </svg>
  );
}

export default function Footer({ variant = "default" }) {
  const { settings } = useSettingsStore();
  
  if (variant === "minimal") {
    return (
      <footer className="py-10 border-t border-outline-variant bg-surface-container">
        <div className="container-main">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-lg font-display text-charcoal">
                Venus Ooty Essentials
              </p>
              <p className="mt-1 text-sm font-body text-on-surface-variant">
                Artisanal wellness from the Nilgiris.
              </p>
            </div>
            <div className="flex flex-wrap gap-5 font-body text-[13px] text-on-surface-variant">
              <Link href="/privacy" className="hover:text-charcoal">
                Privacy Policy
              </Link>
              <Link href="/shipping-returns" className="hover:text-charcoal">
                Shipping & Returns
              </Link>
              <Link href="/contact" className="hover:text-charcoal">
                Wholesale
              </Link>
              <Link href="/contact" className="font-medium text-charcoal">
                Contact Us
              </Link>
              <Link href="/our-story" className="hover:text-charcoal">
                Sustainability
              </Link>
            </div>
          </div>
          <p className="mt-6 text-center font-body text-[13px] text-outline">
            © {new Date().getFullYear()} Venus Ooty Essentials. Artisanal
            Wellness from the Nilgiris.
          </p>
        </div>
      </footer>
    );
  }

  return (
    <footer className="border-t border-outline-variant bg-surface">
      {/* Upper footer */}
      <div className="py-16 container-main">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <p className="text-xl font-display text-charcoal">
              Venus Ooty Essentials
            </p>
            <p className="mt-3 max-w-[220px] font-body text-sm leading-relaxed text-on-surface-variant">
              Handcrafted botanical wellness from the misty Nilgiri highlands.
              Pure essentials, bottled with care.
            </p>
            <div className="flex gap-3 mt-5 text-on-surface-variant">
              {settings?.instagram_url && (
                <a
                  href={settings.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="transition-colors hover:text-charcoal"
                >
                  <InstagramIcon />
                </a>
              )}
              {settings?.facebook_url && (
                <a
                  href={settings.facebook_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="transition-colors hover:text-charcoal"
                >
                  <PinterestIcon />
                </a>
              )}
              {settings?.youtube_url && (
                <a
                  href={settings.youtube_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                  className="transition-colors hover:text-charcoal"
                >
                  <YoutubeIcon />
                </a>
              )}
              {/* {(!settings?.instagram_url && !settings?.facebook_url && !settings?.youtube_url) && (
                <>
                  <a href="#" aria-label="Instagram" className="transition-colors hover:text-charcoal">
                    <InstagramIcon />
                  </a>
                  <a href="#" aria-label="Pinterest" className="transition-colors hover:text-charcoal">
                    <PinterestIcon />
                  </a>
                  <a href="#" aria-label="YouTube" className="transition-colors hover:text-charcoal">
                    <YoutubeIcon />
                  </a>
                </>
              )} */}
            </div>
          </div>

          {/* Explore column */}
          <div>
            <p className="mb-4 font-body text-[11px] font-semibold uppercase tracking-widest text-outline">
              Explore
            </p>
            <ul className="space-y-3">
              {footerLinks.explore.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm transition-colors font-body text-on-surface-variant hover:text-charcoal"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal column */}
          <div>
            <p className="mb-4 font-body text-[11px] font-semibold uppercase tracking-widest text-outline">
              Legal
            </p>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm transition-colors font-body text-on-surface-variant hover:text-charcoal"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact / Get in Touch column */}
          <div>
            <p className="mb-4 font-body text-[11px] font-semibold uppercase tracking-widest text-outline">
              Get in Touch
            </p>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm font-body text-on-surface-variant">
                <span
                  className="material-symbols-outlined mt-0.5 text-secondary"
                  style={{ fontSize: "16px" }}
                >
                  location_on
                </span>
                <span className="whitespace-pre-wrap">
                  {settings?.company_address ||
                    "14 Botanical Garden Road,\nOoty, Tamil Nadu 643001"}
                </span>
              </li>
              <li>
                <a
                  href={`mailto:${settings?.company_email || "hello@venusooty.com"}`}
                  className="flex items-center gap-2 text-sm transition-colors font-body text-on-surface-variant hover:text-charcoal"
                >
                  <span
                    className="material-symbols-outlined text-secondary"
                    style={{ fontSize: "16px" }}
                  >
                    mail
                  </span>
                  {settings?.company_email || "hello@venusooty.com"}
                </a>
              </li>
              <li>
                <a
                  href={`https://wa.me/${(settings?.whatsapp_number || settings?.company_phone || "919876543210").replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm transition-colors font-body text-on-surface-variant hover:text-charcoal"
                >
                  <span
                    className="material-symbols-outlined text-secondary"
                    style={{ fontSize: "16px" }}
                  >
                    chat
                  </span>
                  <span className="whitespace-pre-wrap">
                    {settings?.whatsapp_number || settings?.company_phone || "+91 98765 43210"}
                  </span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Lower footer bar */}
      <div className="border-t border-outline-variant bg-surface-container-low">
        <div className="flex flex-col items-center justify-between gap-3 py-5 text-center container-main sm:flex-row">
          <p className="font-body text-[13px] text-outline">
            © {new Date().getFullYear()} Venus Ooty Essentials. All rights
            reserved.
          </p>
          <p className="font-body text-[13px] text-outline">
            Design & Developed by Nixlin Labs
          </p>
        </div>
      </div>
    </footer>
  );
}
