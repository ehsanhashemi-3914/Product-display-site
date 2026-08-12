import {
  CATEGORY_IDS,
  PRODUCT_STATUSES,
  type CategoryId,
  type Product,
  type ProductImage,
  type ProductInput,
  type ProductSpec,
  type ProductStatus,
} from "@/types/product";
import { toEnglishDigits } from "@/lib/format";
import { createId } from "./local-repository";

/** Form-shaped product: numeric fields stay strings until they validate. */
export interface ProductDraft {
  name: string;
  description: string;
  price: string;
  discountPercent: string;
  category: string;
  status: string;
  badge: string;
  images: ProductImage[];
  specs: ProductSpec[];
}

export type ValidationErrors = Partial<Record<keyof ProductDraft, string>>;

export type ValidationResult =
  | { ok: true; value: ProductInput }
  | { ok: false; errors: ValidationErrors };

export const NAME_MAX = 80;
export const DESCRIPTION_MAX = 600;
export const BADGE_MAX = 20;

export function emptyDraft(): ProductDraft {
  return {
    name: "",
    description: "",
    price: "",
    discountPercent: "",
    category: CATEGORY_IDS[0],
    status: "available",
    badge: "",
    images: [],
    specs: [],
  };
}

export function toDraft(product: Product): ProductDraft {
  return {
    name: product.name,
    description: product.description,
    price: String(product.price),
    discountPercent: product.discountPercent ? String(product.discountPercent) : "",
    category: product.category,
    status: product.status,
    badge: product.badge ?? "",
    images: product.images.map((image) => ({ ...image })),
    specs: product.specs.map((spec) => ({ ...spec })),
  };
}

/**
 * Builds a preview-safe product from a possibly-invalid draft, so the admin
 * preview panel can render while the form is still being filled in.
 */
export function draftToPreview(draft: ProductDraft, base?: Product): Product {
  const now = new Date(0).toISOString();
  return {
    id: base?.id ?? "preview",
    name: draft.name.trim() || "نام محصول",
    description: draft.description.trim() || "توضیحات محصول در اینجا نمایش داده می‌شود.",
    price: parseIntegerOrZero(draft.price),
    discountPercent: parseIntegerOrZero(draft.discountPercent) || undefined,
    images: draft.images.filter((image) => image.url.trim()),
    category: isCategory(draft.category) ? draft.category : CATEGORY_IDS[0],
    status: isStatus(draft.status) ? draft.status : "available",
    badge: draft.badge.trim() || undefined,
    specs: draft.specs.filter((spec) => spec.label.trim() && spec.value.trim()),
    order: base?.order ?? 0,
    createdAt: base?.createdAt ?? now,
    updatedAt: base?.updatedAt ?? now,
  };
}

export function validateDraft(draft: ProductDraft): ValidationResult {
  const errors: ValidationErrors = {};

  const name = draft.name.trim();
  if (!name) errors.name = "نام محصول الزامی است.";
  else if (name.length > NAME_MAX) errors.name = `نام محصول حداکثر ${NAME_MAX} نویسه باشد.`;

  const description = draft.description.trim();
  if (!description) errors.description = "توضیحات محصول الزامی است.";
  else if (description.length > DESCRIPTION_MAX)
    errors.description = `توضیحات حداکثر ${DESCRIPTION_MAX} نویسه باشد.`;

  const priceRaw = toEnglishDigits(draft.price).replace(/[\s,٬]/g, "");
  let price = 0;
  if (!priceRaw) {
    errors.price = "قیمت الزامی است.";
  } else if (!/^\d+$/.test(priceRaw)) {
    errors.price = "قیمت باید یک عدد صحیح و بدون علامت باشد.";
  } else {
    price = Number(priceRaw);
    if (!Number.isSafeInteger(price)) errors.price = "مقدار قیمت خارج از محدودهٔ مجاز است.";
  }

  const discountRaw = toEnglishDigits(draft.discountPercent).trim();
  let discountPercent = 0;
  if (discountRaw) {
    if (!/^\d+$/.test(discountRaw)) {
      errors.discountPercent = "درصد تخفیف باید عدد باشد.";
    } else {
      discountPercent = Number(discountRaw);
      if (discountPercent > 100) errors.discountPercent = "درصد تخفیف باید بین ۰ تا ۱۰۰ باشد.";
    }
  }

  if (!isCategory(draft.category)) errors.category = "یک دسته‌بندی معتبر انتخاب کنید.";
  if (!isStatus(draft.status)) errors.status = "وضعیت انتخاب‌شده معتبر نیست.";

  const badge = draft.badge.trim();
  if (badge.length > BADGE_MAX) errors.badge = `برچسب حداکثر ${BADGE_MAX} نویسه باشد.`;

  const images = draft.images.filter((image) => image.url.trim());
  if (images.length === 0) {
    errors.images = "حداقل یک تصویر برای محصول لازم است.";
  } else if (images.some((image) => !isValidImageUrl(image.url))) {
    errors.images = "آدرس تصویر باید با http://، https:// یا / شروع شود.";
  } else if (images.some((image) => !image.alt.trim())) {
    errors.images = "برای هر تصویر یک متن جایگزین بنویسید (برای دسترس‌پذیری لازم است).";
  }

  const specs = draft.specs.filter((spec) => spec.label.trim() || spec.value.trim());
  if (specs.some((spec) => !spec.label.trim() || !spec.value.trim())) {
    errors.specs = "هر ویژگی باید هم عنوان و هم مقدار داشته باشد.";
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    value: {
      name,
      description,
      price,
      // Always present, `undefined` when unset. Omitting the key instead would make
      // "clear the discount" indistinguishable from "leave it alone" once the value
      // is spread over the existing product during an update.
      discountPercent: discountPercent > 0 ? discountPercent : undefined,
      images: images.map((image) => ({
        id: image.id || createId("img"),
        url: image.url.trim(),
        alt: image.alt.trim(),
      })),
      category: draft.category as CategoryId,
      status: draft.status as ProductStatus,
      badge: badge || undefined,
      specs: specs.map((spec) => ({
        id: spec.id || createId("spec"),
        label: spec.label.trim(),
        value: spec.value.trim(),
      })),
    },
  };
}

function isValidImageUrl(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith("/")) return true;
  if (/^data:image\//i.test(trimmed)) return true;
  return /^https?:\/\/.+/i.test(trimmed);
}

function isCategory(value: string): value is CategoryId {
  return CATEGORY_IDS.includes(value as CategoryId);
}

function isStatus(value: string): value is ProductStatus {
  return PRODUCT_STATUSES.includes(value as ProductStatus);
}

function parseIntegerOrZero(value: string): number {
  const parsed = Number(toEnglishDigits(value).replace(/[\s,٬]/g, ""));
  return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed) : 0;
}
