"use client";

import { useRef, useState } from "react";
import { Download, TriangleAlert, Upload } from "lucide-react";
import type { Product } from "@/types/product";
import { useProducts } from "@/lib/hooks/useProducts";
import { useBranding } from "@/lib/hooks/useBranding";
import { saveLogo } from "@/lib/branding/branding-store";
import { createBackup, downloadBackup, parseBackup } from "@/lib/products/backup";
import { productService } from "@/lib/products/product-service";
import { toErrorMessage } from "@/lib/products/store";
import { formatDate, toPersianDigits } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { useToast } from "@/components/ui/Toast";

interface PendingRestore {
  products: Product[];
  logo: string | null;
  exportedAt: string;
}

export function BackupSettings() {
  const { products, source } = useProducts();
  const { branding } = useBranding();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<PendingRestore | null>(null);
  const [restoring, setRestoring] = useState(false);

  const ready = source === "store";

  function handleExport() {
    try {
      const file = createBackup(products, branding.logo);
      const filename = downloadBackup(file);
      toast(`فایل پشتیبان «${filename}» دانلود شد.`, "success");
    } catch (error) {
      toast(toErrorMessage(error), "error");
    }
  }

  async function handleFile(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;

    try {
      const result = parseBackup(await file.text());
      if (!result.ok) {
        toast(result.error, "error");
        return;
      }
      setPending({
        products: result.file.products,
        logo: result.file.branding.logo,
        exportedAt: result.file.exportedAt,
      });
    } catch (error) {
      toast(toErrorMessage(error), "error");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function confirmRestore() {
    if (!pending) return;
    setRestoring(true);
    try {
      const restored = await productService.restore(pending.products);
      if (pending.logo?.startsWith("/api/images/")) await saveLogo(pending.logo);
      toast(`${toPersianDigits(restored.length)} محصول بازیابی شد.`, "success");
      setPending(null);
    } catch (error) {
      toast(toErrorMessage(error), "error");
    } finally {
      setRestoring(false);
    }
  }

  return (
    <section className="rounded-xl border border-line bg-surface p-5 shadow-card">
      <h2 className="text-sm font-semibold text-ink">پشتیبان‌گیری و بازیابی</h2>
      <p className="mt-1 text-sm leading-7 text-ink-muted">
        محصولات فقط در همین مرورگر ذخیره می‌شوند. اگر حافظهٔ مرورگر پاک شود، با مرورگر یا
        دستگاه دیگری کار کنید، یا در پنجرهٔ ناشناس باشید، از بین می‌روند. فایل پشتیبان تنها
        چیزی است که از همهٔ این‌ها جان سالم به در می‌برد.
      </p>

      <div className="mt-4 flex items-start gap-3 rounded-lg border border-gold-200 bg-gold-50 px-4 py-3">
        <TriangleAlert
          aria-hidden="true"
          className="mt-0.5 size-4.5 shrink-0 text-gold-700"
        />
        <p className="text-xs leading-6 text-gold-700">
          بعد از هر بار که محصولات را تغییر دادید، یک فایل پشتیبان بگیرید و جایی بیرون از
          مرورگر نگه دارید.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <Button onClick={handleExport} disabled={!ready}>
          <Download aria-hidden="true" className="size-4" />
          دریافت فایل پشتیبان
          {ready && ` (${toPersianDigits(products.length)} محصول)`}
        </Button>

        <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
          <Upload aria-hidden="true" className="size-4" />
          بازیابی از فایل پشتیبان
        </Button>

        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          className="sr-only"
          onChange={(event) => void handleFile(event.target.files)}
        />
      </div>

      {pending && (
        <Dialog
          open
          onClose={restoring ? () => undefined : () => setPending(null)}
          title="بازیابی از فایل پشتیبان"
          size="sm"
          footer={
            <>
              <Button
                variant="secondary"
                onClick={() => setPending(null)}
                disabled={restoring}
              >
                انصراف
              </Button>
              <Button variant="danger" onClick={confirmRestore} loading={restoring}>
                جایگزینی محصولات
              </Button>
            </>
          }
        >
          <p className="text-sm leading-8 text-ink">
            این فایل شامل{" "}
            <span className="font-semibold">
              {toPersianDigits(pending.products.length)} محصول
            </span>{" "}
            است و در تاریخ {formatDate(pending.exportedAt)} گرفته شده.
          </p>
          <p className="mt-2 text-sm leading-8 text-ink-muted">
            با تأیید، فهرست فعلی ({toPersianDigits(products.length)} محصول){" "}
            <span className="font-semibold text-ink">به‌طور کامل جایگزین می‌شود</span>. اگر
            از فهرست فعلی پشتیبان ندارید، اول آن را دانلود کنید.
          </p>
        </Dialog>
      )}
    </section>
  );
}
