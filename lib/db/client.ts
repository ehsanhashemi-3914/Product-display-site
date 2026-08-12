import { Pool } from "pg";

/**
 * Postgres connection pool.
 *
 * Server-only — never import this from a client component.
 *
 * Deliberately provider-agnostic: anything that speaks Postgres over a connection string
 * works (Liara, ArvanCloud, Neon, Supabase, a VPS, a local instance). That keeps hosting
 * a deployment decision rather than something baked into the code.
 */

declare global {
  // Next.js reloads modules on every edit in dev; without a global the pool would leak
  // a new set of connections on each change until Postgres refuses more.
  var __mehrEhsanPool: Pool | undefined;
}

export class DatabaseNotConfiguredError extends Error {
  constructor() {
    super(
      "متغیر DATABASE_URL تنظیم نشده است. فایل .env.local را بسازید (نمونه در .env.example).",
    );
    this.name = "DatabaseNotConfiguredError";
  }
}

/** Vercel's Postgres integrations set POSTGRES_URL; other hosts use DATABASE_URL. */
export function getConnectionString(): string | undefined {
  return process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
}

function createPool(): Pool {
  const connectionString = getConnectionString();
  if (!connectionString) throw new DatabaseNotConfiguredError();

  // Managed Postgres almost always terminates TLS with a chain Node doesn't ship a root
  // for. Opt into strict verification with DATABASE_SSL_STRICT=true when the provider
  // supplies a verifiable certificate.
  const wantsSsl =
    /[?&]sslmode=(require|verify-ca|verify-full)/i.test(connectionString) ||
    process.env.DATABASE_SSL === "true";
  const strict = process.env.DATABASE_SSL_STRICT === "true";

  const pool = new Pool({
    connectionString,
    ssl: wantsSsl ? { rejectUnauthorized: strict } : undefined,
    // Serverless platforms run many short-lived instances, so a small pool per instance
    // avoids exhausting the database's connection limit. The local dev database accepts
    // a single connection, hence the override.
    max: Number(process.env.DATABASE_POOL_MAX ?? 3),
    // Release connections well before a managed database's own idle timeout, so the pool
    // hands out fewer sockets that the server has already closed.
    idleTimeoutMillis: 5_000,
    connectionTimeoutMillis: 10_000,
  });

  // Managed databases drop idle connections, and an unhandled 'error' event on a pooled
  // client is fatal to the whole Node process. Log it instead — `pg` discards the broken
  // client and the next query transparently opens a fresh one.
  pool.on("error", (error) => {
    console.error("[db] idle client error", error.message);
  });

  return pool;
}

export function getPool(): Pool {
  if (!globalThis.__mehrEhsanPool) {
    globalThis.__mehrEhsanPool = createPool();
  }
  return globalThis.__mehrEhsanPool;
}

/**
 * Connection-level failures, as opposed to genuine SQL errors. A pooled socket the
 * database closed while idle surfaces as one of these on the next query.
 */
function isConnectionError(error: unknown): boolean {
  const code = (error as { code?: string } | null)?.code;
  if (code && ["ECONNRESET", "EPIPE", "ETIMEDOUT", "ECONNREFUSED"].includes(code)) {
    return true;
  }
  const message = error instanceof Error ? error.message : "";
  return /connection terminated|server closed the connection|socket hang up/i.test(message);
}

/**
 * `T` is intentionally unconstrained: row interfaces have no index signature.
 *
 * Retries once on a dropped connection. Without this, the first request after a quiet
 * period fails for the visitor even though nothing is actually wrong — the pool simply
 * handed out a socket the database had already closed.
 */
export async function query<T>(text: string, params: unknown[] = []): Promise<T[]> {
  try {
    const result = await getPool().query(text, params);
    return result.rows as T[];
  } catch (error) {
    if (!isConnectionError(error)) throw error;
    const result = await getPool().query(text, params);
    return result.rows as T[];
  }
}

export function isDatabaseConfigured(): boolean {
  return Boolean(getConnectionString());
}
