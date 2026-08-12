import { query } from "./client";

/**
 * Images live in Postgres.
 *
 * Deliberately not a separate object-storage service: it would mean another account to
 * create, another set of keys to configure, and another thing that can be misconfigured.
 * A prayer-stone catalogue is a few dozen downscaled photos — well within a free Postgres
 * tier — and this way the whole site needs exactly one thing set up: a database.
 *
 * Files are addressed by a random id and served with immutable caching, so a browser or
 * CDN fetches each image only once.
 */

const CREATE_TABLE = `
  create table if not exists images (
    id         text primary key,
    mime       text        not null,
    bytes      bytea       not null,
    created_at timestamptz not null default now()
  );
`;

const CREATE_SETTINGS = `
  create table if not exists settings (
    key   text primary key,
    value text
  );
`;

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export const ALLOWED_IMAGE_MIME = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/svg+xml",
]);

let ready: Promise<void> | null = null;

export function ensureMediaSchema(): Promise<void> {
  if (!ready) {
    ready = (async () => {
      await query(CREATE_TABLE);
      await query(CREATE_SETTINGS);
    })().catch((error) => {
      ready = null;
      throw error;
    });
  }
  return ready;
}

export interface StoredImage {
  mime: string;
  bytes: Buffer;
}

export async function saveImage(mime: string, bytes: Buffer): Promise<string> {
  await ensureMediaSchema();
  const id = `im-${crypto.randomUUID()}`;
  await query("insert into images (id, mime, bytes) values ($1, $2, $3)", [
    id,
    mime,
    bytes,
  ]);
  return id;
}

export async function getImage(id: string): Promise<StoredImage | null> {
  await ensureMediaSchema();
  const rows = await query<StoredImage>(
    "select mime, bytes from images where id = $1",
    [id],
  );
  return rows[0] ?? null;
}

export async function getSetting(key: string): Promise<string | null> {
  await ensureMediaSchema();
  const rows = await query<{ value: string | null }>(
    "select value from settings where key = $1",
    [key],
  );
  return rows[0]?.value ?? null;
}

export async function setSetting(key: string, value: string | null): Promise<void> {
  await ensureMediaSchema();
  await query(
    `insert into settings (key, value) values ($1, $2)
     on conflict (key) do update set value = excluded.value`,
    [key, value],
  );
}

export const LOGO_SETTING_KEY = "logo_url";
