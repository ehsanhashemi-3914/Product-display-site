import { CircleCheck, CircleSlash, Clock3 } from "lucide-react";
import type { ProductStatus } from "@/types/product";
import { STATUS_LABELS } from "@/lib/products/seed";
import { Badge, type BadgeTone } from "@/components/ui/Badge";

const STATUS_TONE: Record<ProductStatus, BadgeTone> = {
  available: "success",
  out_of_stock: "danger",
  preorder: "info",
};

const STATUS_ICON = {
  available: CircleCheck,
  out_of_stock: CircleSlash,
  preorder: Clock3,
} as const;

export function StatusPill({ status }: { status: ProductStatus }) {
  const Icon = STATUS_ICON[status];
  return (
    <Badge tone={STATUS_TONE[status]}>
      <Icon aria-hidden="true" className="size-3.5" />
      {STATUS_LABELS[status]}
    </Badge>
  );
}
