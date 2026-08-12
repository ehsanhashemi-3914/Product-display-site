"use client";

import { useState } from "react";
import { TriangleAlert } from "lucide-react";
import type { Product } from "@/types/product";
import { productService } from "@/lib/products/product-service";
import { toErrorMessage } from "@/lib/products/store";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { useToast } from "@/components/ui/Toast";

export interface DeleteProductDialogProps {
  product: Product;
  onClose: () => void;
}

export function DeleteProductDialog({ product, onClose }: DeleteProductDialogProps) {
  const { toast } = useToast();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      await productService.remove(product.id);
      toast(`محصول «${product.name}» حذف شد.`, "success");
      onClose();
    } catch (error) {
      toast(toErrorMessage(error), "error");
      setDeleting(false);
    }
  }

  return (
    <Dialog
      open
      onClose={deleting ? () => undefined : onClose}
      title="حذف محصول"
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={deleting}>
            انصراف
          </Button>
          <Button variant="danger" onClick={handleDelete} loading={deleting}>
            حذف محصول
          </Button>
        </>
      }
    >
      <div className="flex gap-3.5">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-600">
          <TriangleAlert aria-hidden="true" className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="text-sm leading-7 text-ink">
            محصول «<span className="font-semibold">{product.name}</span>» برای همیشه حذف
            می‌شود و از صفحهٔ فروشگاه برداشته خواهد شد.
          </p>
          <p className="mt-2 text-sm leading-7 text-ink-muted">این عمل قابل بازگشت نیست.</p>
        </div>
      </div>
    </Dialog>
  );
}
