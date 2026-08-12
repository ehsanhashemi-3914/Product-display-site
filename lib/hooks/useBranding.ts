"use client";

import { useSyncExternalStore } from "react";
import {
  getBrandingServerSnapshot,
  getBrandingSnapshot,
  subscribeToBranding,
  type BrandingSnapshot,
} from "@/lib/branding/branding-store";

export function useBranding(): BrandingSnapshot {
  return useSyncExternalStore(
    subscribeToBranding,
    getBrandingSnapshot,
    getBrandingServerSnapshot,
  );
}
