import { SITE } from "@/lib/config/site";
import { BrandLogo } from "./BrandLogo";
import { TrustStrip } from "./TrustStrip";

export function SiteHeader() {
  return (
    <header className="border-b border-line bg-surface">
      <div className="mx-auto flex max-w-6xl items-center gap-3.5 px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
        <BrandLogo className="size-12 shrink-0 sm:size-14" />
        <div className="min-w-0">
          <h1 className="truncate text-lg leading-8 font-bold tracking-tight text-ink sm:text-2xl">
            {SITE.name}
          </h1>
          <p className="truncate text-xs leading-5 text-ink-muted sm:text-sm">
            {SITE.producer}
          </p>
        </div>
      </div>
      <TrustStrip />
    </header>
  );
}
