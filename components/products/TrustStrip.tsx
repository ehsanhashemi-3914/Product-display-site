import { Award, Package, Truck, type LucideIcon } from "lucide-react";
import { SITE, type TrustItem } from "@/lib/config/site";

const ICONS: Record<TrustItem["icon"], LucideIcon> = {
  award: Award,
  package: Package,
  truck: Truck,
};

/** Compact credentials row under the header — deliberately a strip, not a hero. */
export function TrustStrip() {
  return (
    <div className="border-t border-line bg-sand-50">
      <ul className="mx-auto grid max-w-6xl gap-x-6 gap-y-3 px-4 py-3 sm:grid-cols-3 sm:px-6 lg:px-8">
        {SITE.trust.map((item) => {
          const Icon = ICONS[item.icon];
          return (
            <li key={item.label} className="flex items-center gap-2.5">
              <Icon aria-hidden="true" className="size-4 shrink-0 text-brand-600" />
              <span className="text-sm leading-6 text-ink-muted">
                <span className="text-ink-subtle">{item.label}:</span>{" "}
                <span className="font-medium text-ink">{item.value}</span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
