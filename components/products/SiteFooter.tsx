import { Camera, MessageCircle, Phone, Send, type LucideIcon } from "lucide-react";
import { CONTACT_CHANNELS, SITE, type ContactChannel } from "@/lib/config/site";
import { BrandLogo } from "./BrandLogo";

// lucide v1 removed brand marks (Instagram/WhatsApp/Telegram) for trademark reasons.
// Generic icons stand in — each row is labelled in text, so nothing is ambiguous.
const CHANNEL_ICONS: Record<ContactChannel["id"], LucideIcon> = {
  phone: Phone,
  whatsapp: MessageCircle,
  telegram: Send,
  instagram: Camera,
};

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-line bg-surface">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-2 lg:px-8">
        <section>
          <div className="flex items-center gap-3">
            <BrandLogo className="size-11" />
            <div>
              <h2 className="text-base font-bold text-ink">{SITE.name}</h2>
              <p className="text-xs text-ink-muted">{SITE.producer}</p>
            </div>
          </div>
          <p className="mt-4 max-w-md text-sm leading-7 text-ink-muted">
            {SITE.description}
          </p>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-ink">راه‌های ارتباطی</h2>
          <ul className="mt-4 space-y-1">
            {CONTACT_CHANNELS.map((channel) => {
              const Icon = CHANNEL_ICONS[channel.id];
              return (
                <li key={`${channel.id}-${channel.value}`}>
                  <a
                    href={channel.href}
                    {...(channel.external
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                    className="focus-ring -mx-2 flex items-center gap-3 rounded-lg px-2 py-2 text-sm text-ink-muted transition-colors hover:bg-sand-50 hover:text-brand-700"
                  >
                    <Icon
                      aria-hidden="true"
                      className="size-4 shrink-0 text-brand-600"
                    />
                    <span className="text-ink-subtle">{channel.label}:</span>
                    <span
                      dir={channel.ltr ? "ltr" : undefined}
                      className="font-medium text-ink"
                    >
                      {channel.value}
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      {/*
        No link to /admin here on purpose: this page is what customers receive, and the
        management panel should not advertise itself. The owner reaches it by typing the
        /admin address directly.
      */}
      <div className="border-t border-line">
        <div className="mx-auto max-w-6xl px-4 py-4 text-xs text-ink-subtle sm:px-6 lg:px-8">
          <p>© {SITE.name} — تمامی حقوق محفوظ است.</p>
        </div>
      </div>
    </footer>
  );
}
