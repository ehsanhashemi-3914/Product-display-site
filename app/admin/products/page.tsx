import type { Metadata } from "next";
import { Plus } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ProductListView } from "@/components/admin/ProductListView";
import { LinkButton } from "@/components/ui/LinkButton";

export const metadata: Metadata = {
  title: "محصولات",
};

export default function AdminProductsPage() {
  return (
    <>
      <AdminPageHeader
        title="محصولات"
        description="افزودن، ویرایش، حذف و تغییر ترتیب نمایش محصولات"
        actions={
          <LinkButton href="/admin/products/new">
            <Plus aria-hidden="true" className="size-4" />
            افزودن محصول
          </LinkButton>
        }
      />
      <ProductListView />
    </>
  );
}
