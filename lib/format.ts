/**
 * Deterministic formatters.
 *
 * These deliberately avoid `Intl.NumberFormat` / `toLocaleString`: those depend on the
 * host ICU build, so the Node server and the browser can disagree on separators or digit
 * shaping and produce a React hydration mismatch. Everything here is pure string work
 * and yields byte-identical output on both sides.
 */

const PERSIAN_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"] as const;

export function toPersianDigits(value: string | number): string {
  return String(value).replace(/\d/g, (d) => PERSIAN_DIGITS[Number(d)]);
}

export function toEnglishDigits(value: string): string {
  return value
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
}

/** 1250000 → "۱٬۲۵۰٬۰۰۰" (Persian thousands separator U+066C). */
export function formatNumber(value: number): string {
  const safe = Number.isFinite(value) ? Math.trunc(value) : 0;
  const sign = safe < 0 ? "-" : "";
  const grouped = String(Math.abs(safe)).replace(
    /\B(?=(\d{3})+(?!\d))/g,
    "٬",
  );
  return sign + toPersianDigits(grouped);
}

/** 1250000 → "۱٬۲۵۰٬۰۰۰ تومان" */
export function formatToman(value: number): string {
  return `${formatNumber(value)} تومان`;
}

/** Applies `discountPercent` and rounds to the nearest ۱۰۰ تومان. */
export function effectivePrice(price: number, discountPercent?: number): number {
  if (!discountPercent || discountPercent <= 0) return price;
  const clamped = Math.min(100, discountPercent);
  const discounted = price * (1 - clamped / 100);
  return Math.max(0, Math.round(discounted / 100) * 100);
}

const PERSIAN_MONTHS = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
] as const;

/**
 * Gregorian → Jalali (Persian) calendar. Self-contained so it produces the same
 * result on the server and in the browser regardless of ICU availability.
 */
function toJalali(gy: number, gm: number, gd: number) {
  const gDaysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let jy = gy <= 1600 ? 0 : 979;
  const shiftedGy = gy <= 1600 ? gy - 621 : gy - 1600;
  const gy2 = gm > 2 ? shiftedGy + 1 : shiftedGy;

  let days =
    365 * shiftedGy +
    Math.floor((gy2 + 3) / 4) -
    Math.floor((gy2 + 99) / 100) +
    Math.floor((gy2 + 399) / 400) -
    80 +
    gd;
  for (let i = 0; i < gm - 1; i += 1) days += gDaysInMonth[i];

  jy += 33 * Math.floor(days / 12053);
  days %= 12053;
  jy += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) {
    jy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }

  const jm = days < 186 ? 1 + Math.floor(days / 31) : 7 + Math.floor((days - 186) / 30);
  const jd = 1 + (days < 186 ? days % 31 : (days - 186) % 30);
  return { jy, jm, jd };
}

/** ISO timestamp → "۱۸ مرداد ۱۴۰۴". Returns an em dash for unparseable input. */
export function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  const { jy, jm, jd } = toJalali(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
  );
  return `${toPersianDigits(jd)} ${PERSIAN_MONTHS[jm - 1]} ${toPersianDigits(jy)}`;
}

/** "09159123914" → "۰۹۱۵-۹۱۲-۳۹۱۴". Non-11-digit input is returned digit-shaped only. */
export function formatPhone(raw: string): string {
  const digits = toEnglishDigits(raw).replace(/\D/g, "");
  if (digits.length !== 11) return toPersianDigits(digits || raw);
  return toPersianDigits(
    `${digits.slice(0, 4)}-${digits.slice(4, 7)}-${digits.slice(7)}`,
  );
}

/** Tiny className joiner — avoids pulling in clsx for a three-line helper. */
export function cn(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(" ");
}
