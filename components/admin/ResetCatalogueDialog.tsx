"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { productService } from "@/lib/products/product-service";
import { toErrorMessage } from "@/lib/products/store";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { useToast } from "@/components/ui/Toast";

export function ResetCatalogueDialog({ onClose }: { onClose: () => void }) {
  const { toast } = useToast();
  const [resetting, setResetting] = useState(false);

  async function handleReset() {
    setResetting(true);
    try {
      await productService.resetToSeed();
      toast("فهرست محصولات به حالت اولیه بازگردانده شد.", "success");
      onClose();
    } catch (error) {
      toast(toErrorMessage(error), "error");
      setResetting(false);
    }
  }

  return (
    <Dialog
      open
      onClose={resetting ? () => undefined : onClose}
      title="بازنشانی به داده‌های اولیه"
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={resetting}>
            انصراف
          </Button>
          <Button variant="danger" onClick={handleReset} loading={resetting}>
            بازنشانی
          </Button>
        </>
      }
    >
      <div className="flex gap-3.5">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-sand-100 text-ink-muted">
          <RotateCcw aria-hidden="true" className="size-5" />
        </span>
        <p className="text-sm leading-7 text-ink">
          همهٔ محصولاتی که در این مرورگر افزوده یا ویرایش کرده‌اید حذف می‌شوند و فهرست
          نمونهٔ اولیه جایگزین آن‌ها می‌شود.
        </p>
      </div>
    </Dialog>
  );
}
