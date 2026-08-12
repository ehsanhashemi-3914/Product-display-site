import { cn, effectivePrice, formatNumber, formatToman, toPersianDigits } from "@/lib/format";

export interface PriceTagProps {
  price: number;
  discountPercent?: number;
  size?: "md" | "lg";
  className?: string;
}

/** Renders the قیمت pill from the reference drawing, with optional discount. */
export function PriceTag({ price, discountPercent, size = "md", className }: PriceTagProps) {
  const hasDiscount = Boolean(discountPercent && discountPercent > 0);
  const finalPrice = effectivePrice(price, discountPercent);

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <span
        className={cn(
          "inline-flex items-baseline gap-1 rounded-full bg-brand-50 px-3 py-1.5 font-bold text-brand-800",
          size === "lg" ? "text-lg" : "text-base",
        )}
      >
        {formatNumber(finalPrice)}
        <span className="text-xs font-medium text-brand-600">تومان</span>
      </span>

      {hasDiscount && (
        <>
          <span className="text-xs font-medium text-ink-subtle line-through">
            {formatToman(price)}
          </span>
          <span className="inline-flex items-center rounded-full bg-rose-50 px-2 py-0.5 text-xs font-bold text-rose-700">
            {toPersianDigits(discountPercent ?? 0)}٪ تخفیف
          </span>
        </>
      )}
    </div>
  );
}
