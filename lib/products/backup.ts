import type { Product } from "@/types/product";

/**
 * Backup file format.
 *
 * The catalogue lives in one browser's localStorage, which means it can be lost to a
 * cleared profile, a private window, a different device, or a full storage quota — with
 * no trace. A downloadable file is the only thing that survives all of those, so it is
 * treated as a first-class feature rather than an extra.
 */

export const BACKUP_APP_ID = "mehr-ehsan";
export const BACKUP_VERSION = 1;

export interface BackupFile {
  app: string;
  version: number;
  exportedAt: string;
  products: Product[];
  branding: { logo: string | null };
}

export function createBackup(
  products: readonly Product[],
  logo: string | null,
): BackupFile {
  return {
    app: BACKUP_APP_ID,
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    products: products.map((product) => ({ ...product })),
    branding: { logo },
  };
}

export type BackupParseResult =
  | { ok: true; file: BackupFile }
  | { ok: false; error: string };

export function parseBackup(text: string): BackupParseResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { ok: false, error: "این فایل یک فایل پشتیبان معتبر نیست." };
  }

  if (typeof parsed !== "object" || parsed === null) {
    return { ok: false, error: "محتوای فایل پشتیبان قابل خواندن نیست." };
  }

  const value = parsed as Partial<BackupFile>;
  if (value.app !== BACKUP_APP_ID) {
    return { ok: false, error: "این فایل پشتیبان مربوط به این سایت نیست." };
  }
  if (!Array.isArray(value.products)) {
    return { ok: false, error: "فهرست محصولات در فایل پشتیبان پیدا نشد." };
  }

  const logo =
    typeof value.branding?.logo === "string" && value.branding.logo
      ? value.branding.logo
      : null;

  return {
    ok: true,
    file: {
      app: BACKUP_APP_ID,
      version: typeof value.version === "number" ? value.version : BACKUP_VERSION,
      exportedAt:
        typeof value.exportedAt === "string" ? value.exportedAt : new Date(0).toISOString(),
      // Field-level repair happens in the repository, which already sanitises
      // anything it is handed.
      products: value.products as Product[],
      branding: { logo },
    },
  };
}

/** Triggers a browser download without leaving the page. */
export function downloadBackup(file: BackupFile): string {
  const stamp = file.exportedAt.slice(0, 10);
  const filename = `mehr-ehsan-backup-${stamp}.json`;
  const blob = new Blob([JSON.stringify(file, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Revoking immediately can cancel the download in some browsers.
  setTimeout(() => URL.revokeObjectURL(url), 10_000);

  return filename;
}
