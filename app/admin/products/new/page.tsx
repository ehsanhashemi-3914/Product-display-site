import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ProductForm } from "@/components/admin/ProductForm";

export const metadata: Metadata = {
  title: "افزودن محصول",
};

export default function NewProductPage() {
  return (
    <>
      <AdminPageHeader
        title="افزودن محصول"
        description="محصول جدید بلافاصله پس از ذخیره در صفحهٔ فروشگاه نمایش داده می‌شود."
      />
      <ProductForm mode="create" />
    </>
  );
}
