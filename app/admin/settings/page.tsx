import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { BackupSettings } from "@/components/admin/BackupSettings";
import { BrandingSettings } from "@/components/admin/BrandingSettings";

export const metadata: Metadata = {
  title: "تنظیمات",
};

export default function AdminSettingsPage() {
  return (
    <>
      <AdminPageHeader
        title="تنظیمات"
        description="پشتیبان‌گیری از محصولات و تنظیم لوگوی فروشگاه"
      />
      <div className="max-w-2xl space-y-5">
        <BackupSettings />
        <BrandingSettings />
      </div>
    </>
  );
}
