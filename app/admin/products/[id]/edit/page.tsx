import type { Metadata } from "next";
import { EditProductView } from "@/components/admin/EditProductView";

export const metadata: Metadata = {
  title: "ویرایش محصول",
};

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EditProductView id={id} />;
}
