"use client";

import { Plus, Trash2 } from "lucide-react";
import type { ProductSpec } from "@/types/product";
import { createId } from "@/lib/products/local-repository";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { Input } from "@/components/ui/Input";

export interface SpecListEditorProps {
  specs: ProductSpec[];
  onChange: (specs: ProductSpec[]) => void;
  error?: string;
  idPrefix: string;
}

/** Optional key/value rows shown in the product quick-view under «اطلاعات تکمیلی». */
export function SpecListEditor({ specs, onChange, error, idPrefix }: SpecListEditorProps) {
  function updateAt(index: number, patch: Partial<ProductSpec>) {
    onChange(specs.map((spec, i) => (i === index ? { ...spec, ...patch } : spec)));
  }

  return (
    <fieldset className="rounded-xl border border-line bg-surface p-4 sm:p-5">
      <legend className="px-1 text-sm font-semibold text-ink">اطلاعات تکمیلی</legend>
      <p className="mt-1 text-xs leading-6 text-ink-subtle">
        ویژگی‌هایی مانند جنس، ابعاد، وزن یا نحوهٔ بسته‌بندی. اختیاری است.
      </p>

      {specs.length > 0 && (
        <ul className="mt-4 space-y-2">
          {specs.map((spec, index) => (
            <li key={spec.id} className="flex items-end gap-2">
              <div className="flex-1">
                <label
                  htmlFor={`${idPrefix}-label-${index}`}
                  className="mb-1 block text-xs font-medium text-ink-muted"
                >
                  عنوان
                </label>
                <Input
                  id={`${idPrefix}-label-${index}`}
                  value={spec.label}
                  onChange={(event) => updateAt(index, { label: event.target.value })}
                  placeholder="مثلاً: جنس"
                  className="h-10 text-sm"
                />
              </div>
              <div className="flex-1">
                <label
                  htmlFor={`${idPrefix}-value-${index}`}
                  className="mb-1 block text-xs font-medium text-ink-muted"
                >
                  مقدار
                </label>
                <Input
                  id={`${idPrefix}-value-${index}`}
                  value={spec.value}
                  onChange={(event) => updateAt(index, { value: event.target.value })}
                  placeholder="مثلاً: تربت کربلا"
                  className="h-10 text-sm"
                />
              </div>
              <IconButton
                label={`حذف ویژگی ${index + 1}`}
                tone="danger"
                className="mb-0.5"
                onClick={() => onChange(specs.filter((_, i) => i !== index))}
              >
                <Trash2 aria-hidden="true" className="size-4" />
              </IconButton>
            </li>
          ))}
        </ul>
      )}

      <Button
        variant="secondary"
        size="sm"
        className="mt-4"
        onClick={() => onChange([...specs, { id: createId("spec"), label: "", value: "" }])}
      >
        <Plus aria-hidden="true" className="size-4" />
        افزودن ویژگی
      </Button>

      {error && (
        <p className="mt-3 text-xs leading-5 font-medium text-rose-600">{error}</p>
      )}
    </fieldset>
  );
}
