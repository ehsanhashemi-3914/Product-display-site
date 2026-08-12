"use client";

import { useSyncExternalStore } from "react";
import {
  getAdminSessionServerSnapshot,
  getAdminSessionSnapshot,
  subscribeToAdminSession,
  type AdminSessionStatus,
} from "@/lib/auth/admin-session";

export function useAdminSession(): AdminSessionStatus {
  return useSyncExternalStore(
    subscribeToAdminSession,
    getAdminSessionSnapshot,
    getAdminSessionServerSnapshot,
  );
}
