#!/usr/bin/env node
/**
 * A real Postgres for local development, with nothing to install.
 *
 *   npm run db:local
 *
 * PGlite is Postgres compiled to WebAssembly; this exposes it on a TCP port so the
 * ordinary `pg` driver connects to it exactly as it would to a hosted database. That
 * keeps a single code path — production never sees anything different.
 *
 * Data lives in ./.pglite (gitignored). Not for production use.
 */

import { PGlite } from "@electric-sql/pglite";
import { PGLiteSocketServer } from "@electric-sql/pglite-socket";

const PORT = Number(process.env.LOCAL_DB_PORT ?? 5433);
const HOST = "127.0.0.1";

const db = await PGlite.create("./.pglite");
const server = new PGLiteSocketServer({ db, port: PORT, host: HOST });

await server.start();

console.log(`
  پستگرس محلی آمادهٔ استفاده است.

  در فایل .env.local این مقدار را بگذارید:
  DATABASE_URL=postgres://postgres@${HOST}:${PORT}/postgres

  برای توقف: Ctrl+C
`);

const shutdown = async () => {
  await server.stop();
  await db.close();
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
