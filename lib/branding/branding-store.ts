/**
 * Brand settings, stored on the server.
 *
 * The logo lives in the database alongside the products, so every visitor sees it — not
 * just the browser it was uploaded from.
 */

export interface Branding {
  /** URL of the uploaded logo, or null to use the built-in mark. */
  logo: string | null;
}

export interface BrandingSnapshot {
  branding: Branding;
  /** "seed" until the browser has heard back from the server. */
  source: "seed" | "store";
}

const EMPTY: Branding = { logo: null };

const SERVER_SNAPSHOT: BrandingSnapshot = Object.freeze({
  branding: EMPTY,
  source: "seed",
});

let snapshot: BrandingSnapshot = SERVER_SNAPSHOT;
const listeners = new Set<() => void>();
let started = false;

export function getBrandingSnapshot(): BrandingSnapshot {
  return snapshot;
}

export function getBrandingServerSnapshot(): BrandingSnapshot {
  return SERVER_SNAPSHOT;
}

export function subscribeToBranding(listener: () => void): () => void {
  listeners.add(listener);
  start();
  return () => {
    listeners.delete(listener);
  };
}

export async function saveLogo(url: string): Promise<void> {
  await putLogo(url);
}

export async function clearLogo(): Promise<void> {
  await putLogo(null);
}

async function putLogo(logo: string | null): Promise<void> {
  const response = await fetch("/api/settings/logo", {
    method: "PUT",
    credentials: "same-origin",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ logo }),
  });

  if (!response.ok) {
    let message = "ذخیرهٔ لوگو ناموفق بود.";
    try {
      message = ((await response.json()) as { error?: string }).error ?? message;
    } catch {
      // Keep the generic message.
    }
    throw new Error(message);
  }
  setSnapshot({ branding: { logo }, source: "store" });
}

async function refresh(): Promise<void> {
  try {
    const response = await fetch("/api/settings/logo", { cache: "no-store" });
    const data = (await response.json()) as { logo?: string | null };
    setSnapshot({
      branding: { logo: typeof data.logo === "string" && data.logo ? data.logo : null },
      source: "store",
    });
  } catch {
    setSnapshot({ branding: EMPTY, source: "store" });
  }
}

function setSnapshot(next: BrandingSnapshot): void {
  snapshot = next;
  for (const listener of listeners) listener();
}

function start(): void {
  if (started || typeof window === "undefined") return;
  started = true;
  void refresh();
}
