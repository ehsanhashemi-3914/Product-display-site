"use client";

import { useRef, useState } from "react";
import { ImageUp, Trash2 } from "lucide-react";
import { clearLogo, saveLogo } from "@/lib/branding/branding-store";
import { useBranding } from "@/lib/hooks/useBranding";
import { ACCEPTED_LOGO_TYPES, prepareLogoFile } from "@/lib/storage/prepare-logo";
import { uploadImage } from "@/lib/storage/image-storage";
import { toErrorMessage } from "@/lib/products/store";
import { SITE } from "@/lib/config/site";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { BrandLogo } from "@/components/products/BrandLogo";

export function BrandingSettings() {
  const { branding, source } = useBranding();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);

  const loading = source === "seed";

  async function handleFile(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // Trims the empty margin and squares the artwork so it fills its badge.
      const prepared = await prepareLogoFile(file);
      const url = await uploadImage(prepared);
      await saveLogo(url);
      toast("لوگو ذخیره شد و برای همهٔ بازدیدکنندگان اعمال شد.", "success");
    } catch (error) {
      toast(toErrorMessage(error), "error");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleRemove() {
    try {
      await clearLogo();
      toast("لوگو حذف شد.", "success");
    } catch (error) {
      toast(toErrorMessage(error), "error");
    } finally {
      setConfirmRemove(false);
    }
  }

  // Sections are returned bare so the settings page controls page-level spacing.
  return (
    <>
      <section className="rounded-xl border border-line bg-surface p-5 shadow-card">
        <h2 className="text-sm font-semibold text-ink">لوگوی فروشگاه</h2>
        <p className="mt-1 text-sm leading-7 text-ink-muted">
          فایل لوگو را انتخاب کنید. حاشیهٔ خالی دور طرح به‌صورت خودکار بریده می‌شود تا
          لوگو در هدر سایت بزرگ و خوانا دیده شود.
        </p>

        <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-center">
          {loading ? (
            <Skeleton className="size-28 rounded-xl" />
          ) : (
            <BrandLogo className="size-28 rounded-xl border border-line" />
          )}

          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap gap-2">
              <Button
                loading={uploading}
                onClick={() => fileInputRef.current?.click()}
              >
                {!uploading && <ImageUp aria-hidden="true" className="size-4" />}
                {branding.logo ? "تغییر لوگو" : "انتخاب فایل لوگو"}
              </Button>

              {branding.logo && (
                <Button variant="secondary" onClick={() => setConfirmRemove(true)}>
                  <Trash2 aria-hidden="true" className="size-4" />
                  حذف لوگو
                </Button>
              )}
            </div>

            <p className="text-xs leading-6 text-ink-subtle">
              فرمت‌های PNG، JPG، WebP و SVG — حداکثر ۸ مگابایت.
              {!branding.logo && !loading && (
                <>
                  {" "}
                  در حال حاضر از نشان پیش‌فرض استفاده می‌شود.
                </>
              )}
            </p>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_LOGO_TYPES}
          className="sr-only"
          onChange={(event) => void handleFile(event.target.files)}
        />
      </section>

      <section className="rounded-xl border border-line bg-surface p-5 shadow-card">
        <h2 className="text-sm font-semibold text-ink">پیش‌نمایش در هدر سایت</h2>
        <div className="mt-4 flex items-center gap-3.5 rounded-lg border border-line bg-canvas p-4">
          <BrandLogo className="size-12" />
          <div className="min-w-0">
            <p className="truncate text-lg leading-8 font-bold text-ink">{SITE.name}</p>
            <p className="truncate text-xs leading-5 text-ink-muted">{SITE.producer}</p>
          </div>
        </div>
        <p className="mt-3 text-xs leading-6 text-ink-subtle">
          لوگو روی یک کادر تیره نمایش داده می‌شود، چون طرح‌های طلایی روی زمینهٔ روشن به‌سختی
          دیده می‌شوند.
        </p>
      </section>

      {confirmRemove && (
        <Dialog
          open
          onClose={() => setConfirmRemove(false)}
          title="حذف لوگو"
          size="sm"
          footer={
            <>
              <Button variant="secondary" onClick={() => setConfirmRemove(false)}>
                انصراف
              </Button>
              <Button variant="danger" onClick={() => void handleRemove()}>
                حذف لوگو
              </Button>
            </>
          }
        >
          <p className="text-sm leading-7 text-ink">
            لوگوی فعلی حذف می‌شود و سایت دوباره از نشان پیش‌فرض استفاده می‌کند. هر زمان
            می‌توانید دوباره فایل جدیدی انتخاب کنید.
          </p>
        </Dialog>
      )}
    </>
  );
}
