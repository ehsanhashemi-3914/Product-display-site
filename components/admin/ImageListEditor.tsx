"use client";

import { useRef, useState } from "react";
import { ArrowDown, ArrowUp, Link2, Trash2, Upload } from "lucide-react";
import type { ProductImage } from "@/types/product";
import { createId } from "@/lib/products/local-repository";
import {
  ACCEPTED_IMAGE_TYPES,
  downscaleImage,
  uploadImage,
} from "@/lib/storage/image-storage";
import { toErrorMessage } from "@/lib/products/store";
import { toPersianDigits } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { ProductPhoto } from "@/components/products/ProductPhoto";

export interface ImageListEditorProps {
  images: ProductImage[];
  onChange: (images: ProductImage[]) => void;
  error?: string;
  idPrefix: string;
}

export function ImageListEditor({
  images,
  onChange,
  error,
  idPrefix,
}: ImageListEditorProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  function updateAt(index: number, patch: Partial<ProductImage>) {
    onChange(images.map((image, i) => (i === index ? { ...image, ...patch } : image)));
  }

  function removeAt(index: number) {
    onChange(images.filter((_, i) => i !== index));
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= images.length) return;
    const next = [...images];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  function addUrlRow() {
    onChange([...images, { id: createId("img"), url: "", alt: "" }]);
  }

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setUploading(true);
    try {
      const uploaded: ProductImage[] = [];
      for (const file of Array.from(fileList)) {
        // Shrink first: phone photos are several megabytes and gain nothing from it.
        const url = await uploadImage(await downscaleImage(file));
        uploaded.push({
          id: createId("img"),
          url,
          alt: file.name.replace(/\.[^.]+$/, ""),
        });
      }
      onChange([...images, ...uploaded]);
      toast(`${toPersianDigits(uploaded.length)} تصویر افزوده شد.`, "success");
    } catch (uploadError) {
      toast(toErrorMessage(uploadError), "error");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  const errorId = `${idPrefix}-error`;

  return (
    <fieldset className="rounded-xl border border-line bg-surface p-4 sm:p-5">
      <legend className="px-1 text-sm font-semibold text-ink">تصاویر محصول</legend>
      <p className="mt-1 text-xs leading-6 text-ink-subtle">
        اولین تصویر به‌عنوان تصویر اصلی (کاور) در کارت محصول نمایش داده می‌شود. می‌توانید
        آدرس اینترنتی تصویر را وارد کنید یا فایلی از دستگاه خود انتخاب کنید.
      </p>

      {images.length > 0 && (
        <ul className="mt-4 space-y-3">
          {images.map((image, index) => (
            <li
              key={image.id}
              className="flex flex-col gap-3 rounded-lg border border-line bg-sand-50/60 p-3 sm:flex-row"
            >
              <div className="relative size-24 shrink-0 overflow-hidden rounded-lg border border-line bg-sand-100">
                <ProductPhoto image={image.url ? image : undefined} fallbackAlt="پیش‌نمایش تصویر" />
                {index === 0 && (
                  <span className="absolute inset-x-0 bottom-0 bg-brand-700/90 py-0.5 text-center text-[0.65rem] font-medium text-white">
                    کاور
                  </span>
                )}
              </div>

              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <div>
                  <label
                    htmlFor={`${idPrefix}-url-${index}`}
                    className="mb-1 block text-xs font-medium text-ink-muted"
                  >
                    آدرس تصویر
                  </label>
                  <Input
                    id={`${idPrefix}-url-${index}`}
                    dir="ltr"
                    value={
                      image.url.startsWith("/api/images/") ? "فایل بارگذاری‌شده" : image.url
                    }
                    readOnly={image.url.startsWith("/api/images/")}
                    onChange={(event) => updateAt(index, { url: event.target.value })}
                    placeholder="https://example.com/image.jpg"
                    className="h-9 text-xs"
                  />
                </div>
                <div>
                  <label
                    htmlFor={`${idPrefix}-alt-${index}`}
                    className="mb-1 block text-xs font-medium text-ink-muted"
                  >
                    متن جایگزین (توضیح تصویر برای دسترس‌پذیری)
                  </label>
                  <Input
                    id={`${idPrefix}-alt-${index}`}
                    value={image.alt}
                    onChange={(event) => updateAt(index, { alt: event.target.value })}
                    placeholder="مثلاً: مهر تربت کربلا با قالب گرد"
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              <div className="flex shrink-0 flex-row gap-1 sm:flex-col">
                <IconButton
                  label="انتقال تصویر به بالا"
                  disabled={index === 0}
                  onClick={() => move(index, -1)}
                >
                  <ArrowUp aria-hidden="true" className="size-4" />
                </IconButton>
                <IconButton
                  label="انتقال تصویر به پایین"
                  disabled={index === images.length - 1}
                  onClick={() => move(index, 1)}
                >
                  <ArrowDown aria-hidden="true" className="size-4" />
                </IconButton>
                <IconButton
                  label="حذف تصویر"
                  tone="danger"
                  onClick={() => removeAt(index)}
                >
                  <Trash2 aria-hidden="true" className="size-4" />
                </IconButton>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="secondary" size="sm" onClick={addUrlRow}>
          <Link2 aria-hidden="true" className="size-4" />
          افزودن با آدرس اینترنتی
        </Button>
        <Button
          variant="secondary"
          size="sm"
          loading={uploading}
          onClick={() => fileInputRef.current?.click()}
        >
          {!uploading && <Upload aria-hidden="true" className="size-4" />}
          انتخاب فایل از دستگاه
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_IMAGE_TYPES}
          multiple
          className="sr-only"
          onChange={(event) => void handleFiles(event.target.files)}
        />
      </div>

      {error && (
        <p id={errorId} className="mt-3 text-xs leading-5 font-medium text-rose-600">
          {error}
        </p>
      )}
    </fieldset>
  );
}
