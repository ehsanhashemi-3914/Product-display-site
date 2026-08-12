import { FileQuestion } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { LinkButton } from "@/components/ui/LinkButton";
import { SiteFooter } from "@/components/products/SiteFooter";
import { SiteHeader } from "@/components/products/SiteHeader";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-2xl flex-1 items-center px-4 py-16 sm:px-6">
        <EmptyState
          className="w-full"
          icon={FileQuestion}
          title="صفحهٔ موردنظر پیدا نشد"
          description="نشانی واردشده معتبر نیست یا این صفحه حذف شده است."
          action={<LinkButton href="/">بازگشت به صفحهٔ اصلی</LinkButton>}
        />
      </main>
      <SiteFooter />
    </>
  );
}
