"use client";

import { useState } from "react";
import { useBranding } from "@/lib/hooks/useBranding";
import { SITE } from "@/lib/config/site";
import { cn } from "@/lib/format";
import { BrandMark } from "./BrandMark";

export interface BrandLogoProps {
  className?: string;
  /**
   * Gold line-work drawn for a black plate needs a dark backdrop to read on the light
   * page. Ignored when the uploaded artwork is transparent-free anyway.
   */
  onDarkBadge?: boolean;
}

/**
 * The brand logo, in priority order:
 *   1. the logo uploaded from the admin panel (تنظیمات برند)
 *   2. `public/brand/logo.png`, if a file was dropped in manually
 *   3. the built-in mark, so nothing ever renders as a broken image
 *
 * Decorative on purpose: every place it appears is immediately followed by the shop name
 * as real text, so announcing it again would only add noise for screen-reader users.
 */
export function BrandLogo({ className, onDarkBadge = true }: BrandLogoProps) {
  const { branding } = useBranding();
  const [fileFailed, setFileFailed] = useState(false);

  const source = branding.logo ?? (fileFailed ? null : SITE.logo);

  if (!source) return <BrandMark className={className} />;

  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-xl",
        onDarkBadge && "bg-[#050505]",
        className,
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- needs an onError fallback */}
      <img
        key={source}
        src={source}
        alt=""
        aria-hidden="true"
        ref={(node) => {
          // The <img> is server-rendered, so a 404 can resolve before React hydrates and
          // attaches onError — the event then never fires and a broken icon sticks.
          // Re-read the element's own state the moment React first sees it. A failed
          // load is the only case reporting zero: even a dimensionless SVG reports 300.
          if (node?.complete && node.naturalWidth === 0) setFileFailed(true);
        }}
        onError={() => setFileFailed(true)}
        className="size-full object-contain"
      />
    </span>
  );
}
