"use client";

import { useId, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import type { Product } from "@/types/product";
import { PRODUCT_STATUSES } from "@/types/product";
import { CATEGORIES, STATUS_LABELS } from "@/lib/products/seed";
import { productService } from "@/lib/products/product-service";
import { toErrorMessage } from "@/lib/products/store";
import {
  BADGE_MAX,
  DESCRIPTION_MAX,
  emptyDraft,
  NAME_MAX,
  toDraft,
  validateDraft,
  type ProductDraft,
  type ValidationErrors,
} from "@/lib/products/validation";
import { effectivePrice, formatToman, toEnglishDigits, toPersianDigits } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { LinkButton } from "@/components/ui/LinkButton";
import { useToast } from "@/components/ui/Toast";
import { ImageListEditor } from "./ImageListEditor";
import { ProductPreviewPanel } from "./ProductPreviewPanel";
import { SpecListEditor } from "./SpecListEditor";

export interface ProductFormProps {
  mode: "create" | "edit";
  product?: Product;
}

/** Stable reference so an untouched form doesn't re-render every field each keystroke. */
const NO_ERRORS: ValidationErrors = {};

/** One form for both create and edit — the only difference is which service call runs. */
export function ProductForm({ mode, product }: ProductFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const formId = useId();

  const [draft, setDraft] = useState<ProductDraft>(() =>
    product ? toDraft(product) : emptyDraft(),
  );
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  const validation = useMemo(() => validateDraft(draft), [draft]);
  // Errors are derived, not stored: the form stays quiet until the first submit
  // attempt, then updates live as each field is fixed.
  const errors: ValidationErrors =
    submitted && !validation.ok ? validation.errors : NO_ERRORS;

  function setField<K extends keyof ProductDraft>(key: K, value: ProductDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);

    if (!validation.ok) {
      toast("لطفاً خطاهای فرم را برطرف کنید.", "error");
      // The error markup renders in the same commit as `submitted`, so defer the
      // focus move until that commit has landed.
      setTimeout(() => {
        document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
      }, 0);
      return;
    }

    setSaving(true);
    try {
      if (mode === "edit" && product) {
        await productService.update(product.id, validation.value);
        toast(`تغییرات «${validation.value.name}» ذخیره شد.`, "success");
      } else {
        await productService.create(validation.value);
        toast(`محصول «${validation.value.name}» افزوده شد.`, "success");
      }
      router.push("/admin/products");
    } catch (error) {
      toast(toErrorMessage(error), "error");
      setSaving(false);
    }
  }

  const priceNumber = Number(toEnglishDigits(draft.price).replace(/[\s,٬]/g, ""));
  const discountNumber = Number(toEnglishDigits(draft.discountPercent) || 0);
  const priceHint =
    Number.isFinite(priceNumber) && priceNumber > 0
      ? discountNumber > 0
        ? `قیمت پس از تخفیف: ${formatToman(effectivePrice(priceNumber, discountNumber))}`
        : formatToman(priceNumber)
      : "مبلغ را به تومان و بدون جداکننده وارد کنید.";

  return (
    <form onSubmit={handleSubmit} noValidate className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="space-y-5">
        <div className="space-y-5 rounded-xl border border-line bg-surface p-4 sm:p-5">
          <Field
            id={`${formId}-name`}
            label="نام محصول"
            required
            error={errors.name}
            hint={`${toPersianDigits(draft.name.trim().length)} از ${toPersianDigits(NAME_MAX)} نویسه`}
          >
            {(fieldProps) => (
              <Input
                {...fieldProps}
                value={draft.name}
                onChange={(event) => setField("name", event.target.value)}
                placeholder="مثلاً: مهر تربت کربلای معطر"
                maxLength={NAME_MAX + 20}
              />
            )}
          </Field>

          <Field
            id={`${formId}-description`}
            label="توضیحات"
            required
            error={errors.description}
            hint={`${toPersianDigits(draft.description.trim().length)} از ${toPersianDigits(DESCRIPTION_MAX)} نویسه`}
          >
            {(fieldProps) => (
              <Textarea
                {...fieldProps}
                rows={5}
                value={draft.description}
                onChange={(event) => setField("description", event.target.value)}
                placeholder="جنس، کاربرد و ویژگی‌های شاخص محصول را بنویسید."
              />
            )}
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              id={`${formId}-price`}
              label="قیمت (تومان)"
              required
              error={errors.price}
              hint={priceHint}
            >
              {(fieldProps) => (
                <Input
                  {...fieldProps}
                  inputMode="numeric"
                  value={draft.price}
                  onChange={(event) => setField("price", event.target.value)}
                  placeholder="45000"
                />
              )}
            </Field>

            <Field
              id={`${formId}-discount`}
              label="درصد تخفیف"
              error={errors.discountPercent}
              hint="اختیاری — عددی بین ۰ تا ۱۰۰"
            >
              {(fieldProps) => (
                <Input
                  {...fieldProps}
                  inputMode="numeric"
                  value={draft.discountPercent}
                  onChange={(event) => setField("discountPercent", event.target.value)}
                  placeholder="0"
                />
              )}
            </Field>

            <Field id={`${formId}-category`} label="دسته‌بندی" required error={errors.category}>
              {(fieldProps) => (
                <Select
                  {...fieldProps}
                  value={draft.category}
                  onChange={(event) => setField("category", event.target.value)}
                >
                  {CATEGORIES.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </Select>
              )}
            </Field>

            <Field id={`${formId}-status`} label="وضعیت موجودی" required error={errors.status}>
              {(fieldProps) => (
                <Select
                  {...fieldProps}
                  value={draft.status}
                  onChange={(event) => setField("status", event.target.value)}
                >
                  {PRODUCT_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {STATUS_LABELS[status]}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
          </div>

          <Field
            id={`${formId}-badge`}
            label="برچسب"
            error={errors.badge}
            hint={`اختیاری — مثلاً «پرفروش» یا «جدید». حداکثر ${toPersianDigits(BADGE_MAX)} نویسه.`}
          >
            {(fieldProps) => (
              <Input
                {...fieldProps}
                value={draft.badge}
                onChange={(event) => setField("badge", event.target.value)}
                placeholder="پرفروش"
                maxLength={BADGE_MAX + 10}
              />
            )}
          </Field>
        </div>

        <ImageListEditor
          idPrefix={`${formId}-images`}
          images={draft.images}
          onChange={(images) => setField("images", images)}
          error={errors.images}
        />

        <SpecListEditor
          idPrefix={`${formId}-specs`}
          specs={draft.specs}
          onChange={(specs) => setField("specs", specs)}
          error={errors.specs}
        />

        <div className="flex flex-wrap items-center gap-2">
          <Button type="submit" loading={saving}>
            {!saving && <Save aria-hidden="true" className="size-4" />}
            {mode === "edit" ? "ذخیرهٔ تغییرات" : "افزودن محصول"}
          </Button>
          <LinkButton href="/admin/products" variant="secondary">
            انصراف
          </LinkButton>
        </div>
      </div>

      <ProductPreviewPanel draft={draft} base={product} />
    </form>
  );
}
