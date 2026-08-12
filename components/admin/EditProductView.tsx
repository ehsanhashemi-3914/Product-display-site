"use client";

import { PackageX } from "lucide-react";
import { useProduct } from "@/lib/hooks/useProducts";
import { formatDate } from "@/lib/format";
import { EmptyState } from "@/components/ui/EmptyState";
import { LinkButton } from "@/components/ui/LinkButton";
import { Skeleton } from "@/components/ui/Skeleton";
import { AdminPageHeader } from "./AdminPageHeader";
import { ProductForm } from "./ProductForm";

export function EditProductView({ id }: { id: string }) {
  const { product, snapshot } = useProduct(id);

  // The stored catalogue only exists in the browser, so wait for it before deciding
  // that a product is missing — otherwise every edit page would flash "not found".
  if (snapshot.source === "seed") {
    return (
      <>
        <AdminPageHeader title="ویرایش محصول" />
        <div className="space-y-4">
          <Skeleton className="h-11 w-full max-w-xl" />
          <Skeleton className="h-32 w-full max-w-xl" />
          <Skeleton className="h-11 w-64" />
        </div>
      </>
    );
  }

  if (!product) {
    return (
      <>
        <AdminPageHeader title="ویرایش محصول" />
        <EmptyState
          icon={PackageX}
          title="این محصول پیدا نشد"
          description="ممکن است حذف شده باشد یا نشانی صفحه درست نباشد."
          action={<LinkButton href="/admin/products">بازگشت به فهرست محصولات</LinkButton>}
        />
      </>
    );
  }

  return (
    <>
      <AdminPageHeader
        title="ویرایش محصول"
        description={`آخرین به‌روزرسانی: ${formatDate(product.updatedAt)}`}
      />
      <ProductForm mode="edit" product={product} />
    </>
  );
}
