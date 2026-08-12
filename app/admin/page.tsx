import { Plus } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DashboardContent } from "@/components/admin/DashboardContent";
import { LinkButton } from "@/components/ui/LinkButton";

export default function AdminDashboardPage() {
  return (
    <>
      <AdminPageHeader
        title="داشبورد"
        description="نمای کلی محصولات فروشگاه"
        actions={
          <LinkButton href="/admin/products/new">
            <Plus aria-hidden="true" className="size-4" />
            افزودن محصول
          </LinkButton>
        }
      />
      <DashboardContent />
    </>
  );
}
