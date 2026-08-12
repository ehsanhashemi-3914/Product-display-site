"use client";

import { useState } from "react";
import { ImageOff } from "lucide-react";
import type { ProductImage } from "@/types/product";
import { cn } from "@/lib/format";

export interface ProductPhotoProps {
  image?: ProductImage;
  /** Used when the image has no alt of its own, and as the label for the fallback. */
  fallbackAlt: string;
  className?: string;
  loading?: "lazy" | "eager";
}

/**
 * Plain <img> rather than next/image on purpose: product images are arbitrary URLs typed
 * by the admin (or client-generated `data:` URLs), which next/image rejects unless every
 * host is pre-registered in `images.remotePatterns` — impossible for user-entered URLs.
 *
 * Renders a graceful placeholder when the image is missing or fails to load.
 */
export function ProductPhoto({
  image,
  fallbackAlt,
  className,
  loading = "lazy",
}: ProductPhotoProps) {
  // Storing *which* URL failed (rather than a boolean + a reset effect) means a new
  // src is retried automatically, with no state synchronisation to get wrong.
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const failed = image ? failedUrl === image.url : false;

  if (!image || failed) {
    return (
      <div
        role="img"
        aria-label={`${fallbackAlt} — تصویری در دسترس نیست`}
        className={cn(
          "flex size-full flex-col items-center justify-center gap-2 bg-sand-100 text-ink-subtle",
          className,
        )}
      >
        <ImageOff aria-hidden="true" className="size-7" />
        <span className="text-xs">بدون تصویر</span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- see component doc comment
    <img
      src={image.url}
      alt={image.alt || fallbackAlt}
      loading={loading}
      decoding="async"
      ref={(node) => {
        // Above-the-fold cards render eagerly on the server, so a broken URL can fail
        // before React attaches onError. Catch that case on first sight of the element.
        if (node?.complete && node.naturalWidth === 0) setFailedUrl(image.url);
      }}
      onError={() => setFailedUrl(image.url)}
      className={cn("size-full object-cover", className)}
    />
  );
}
