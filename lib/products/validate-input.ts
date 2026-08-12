import {
  CATEGORY_IDS,
  PRODUCT_STATUSES,
  type CategoryId,
  type ProductImage,
  type ProductInput,
  type ProductSpec,
  type ProductStatus,
} from "@/types/product";
import { BADGE_MAX, DESCRIPTION_MAX, NAME_MAX } from "./validation";

/**
 * Validates a product payload arriving over HTTP.
 *
 * The admin form already validates before submitting, but the API must re-check
 * everything: a request can be crafted by hand, and the browser is not a trust boundary.
 */

export type ParseResult =
  | { ok: true; value: ProductInput }
  | { ok: false; error: string };

export function parseProductInput(raw: unknown): ParseResult {
  if (typeof raw !== "object" || raw === null) {
    return { ok: false, error: "داده‌های ارسالی معتبر نیست." };
  }
  const value = raw as Record<string, unknown>;

  const name = asString(value.name).trim();
  if (!name) return { ok: false, error: "نام محصول الزامی است." };
  if (name.length > NAME_MAX) {
    return { ok: false, error: `نام محصول حداکثر ${NAME_MAX} نویسه باشد.` };
  }

  const description = asString(value.description).trim();
  if (!description) return { ok: false, error: "توضیحات محصول الزامی است." };
  if (description.length > DESCRIPTION_MAX) {
    return { ok: false, error: `توضیحات حداکثر ${DESCRIPTION_MAX} نویسه باشد.` };
  }

  const price = Math.round(Number(value.price));
  if (!Number.isSafeInteger(price) || price < 0) {
    return { ok: false, error: "قیمت باید یک عدد صحیح و مثبت باشد." };
  }

  const rawDiscount = value.discountPercent;
  let discountPercent: number | undefined;
  if (rawDiscount !== undefined && rawDiscount !== null && rawDiscount !== "") {
    const parsed = Math.round(Number(rawDiscount));
    if (!Number.isFinite(parsed) || parsed < 0 || parsed > 100) {
      return { ok: false, error: "درصد تخفیف باید بین ۰ تا ۱۰۰ باشد." };
    }
    discountPercent = parsed > 0 ? parsed : undefined;
  }

  if (!CATEGORY_IDS.includes(value.category as CategoryId)) {
    return { ok: false, error: "دسته‌بندی انتخاب‌شده معتبر نیست." };
  }
  if (!PRODUCT_STATUSES.includes(value.status as ProductStatus)) {
    return { ok: false, error: "وضعیت انتخاب‌شده معتبر نیست." };
  }

  const badge = asString(value.badge).trim();
  if (badge.length > BADGE_MAX) {
    return { ok: false, error: `برچسب حداکثر ${BADGE_MAX} نویسه باشد.` };
  }

  const images = parseImages(value.images);
  if (images.length === 0) {
    return { ok: false, error: "حداقل یک تصویر برای محصول لازم است." };
  }

  return {
    ok: true,
    value: {
      name,
      description,
      price,
      discountPercent,
      images,
      category: value.category as CategoryId,
      status: value.status as ProductStatus,
      badge: badge || undefined,
      specs: parseSpecs(value.specs),
    },
  };
}

function parseImages(raw: unknown): ProductImage[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null)
    .map((item) => ({
      id: asString(item.id) || `img-${crypto.randomUUID()}`,
      url: asString(item.url).trim(),
      alt: asString(item.alt).trim(),
    }))
    .filter((image) => isAllowedImageUrl(image.url));
}

function parseSpecs(raw: unknown): ProductSpec[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null)
    .map((item) => ({
      id: asString(item.id) || `spec-${crypto.randomUUID()}`,
      label: asString(item.label).trim(),
      value: asString(item.value).trim(),
    }))
    .filter((spec) => spec.label && spec.value);
}

/**
 * `data:` URLs are rejected on purpose: images now live in object storage, and accepting
 * inline blobs would let a single request write megabytes into the database.
 */
function isAllowedImageUrl(url: string): boolean {
  if (!url) return false;
  if (url.startsWith("/")) return true;
  return /^https?:\/\/.+/i.test(url);
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}
