import type {
  CategoryId,
  Product,
  ProductImage,
  ProductInput,
  ProductSpec,
  ProductStatus,
} from "@/types/product";
import { CATEGORY_IDS, PRODUCT_STATUSES } from "@/types/product";
import { SEED_PRODUCTS } from "@/lib/products/seed";
import { query } from "./client";

/**
 * Server-side product storage. This is the real source of truth once a database is
 * configured — the browser only ever talks to it through /api/products.
 */

const CREATE_TABLE = `
  create table if not exists products (
    id               text primary key,
    name             text        not null,
    description      text        not null default '',
    price            bigint      not null default 0,
    discount_percent integer,
    images           jsonb       not null default '[]'::jsonb,
    category         text        not null,
    status           text        not null default 'available',
    badge            text,
    specs            jsonb       not null default '[]'::jsonb,
    sort_order       integer     not null default 0,
    created_at       timestamptz not null default now(),
    updated_at       timestamptz not null default now()
  );
`;

// "order" is reserved in SQL, hence sort_order.
const CREATE_INDEX = `
  create index if not exists products_sort_order_idx on products (sort_order, created_at);
`;

let schemaReady: Promise<void> | null = null;

/** Runs once per process; safe to call before every query. */
export function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = (async () => {
      await query(CREATE_TABLE);
      await query(CREATE_INDEX);
      await seedIfEmpty();
    })().catch((error) => {
      // Let the next request retry rather than caching a failure forever.
      schemaReady = null;
      throw error;
    });
  }
  return schemaReady;
}

/** A brand-new deployment starts with the sample catalogue rather than an empty shop. */
async function seedIfEmpty(): Promise<void> {
  const rows = await query<{ count: string }>("select count(*)::text as count from products");
  if (Number(rows[0]?.count ?? "0") > 0) return;

  for (const product of SEED_PRODUCTS) {
    await insertProduct(product);
  }
}

interface ProductRow {
  id: string;
  name: string;
  description: string;
  price: string;
  discount_percent: number | null;
  images: unknown;
  category: string;
  status: string;
  badge: string | null;
  specs: unknown;
  sort_order: number;
  created_at: Date;
  updated_at: Date;
}

function toProduct(row: ProductRow): Product {
  const discount = row.discount_percent ?? 0;
  const badge = row.badge?.trim() ?? "";
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: Number(row.price),
    ...(discount > 0 ? { discountPercent: discount } : {}),
    images: Array.isArray(row.images) ? (row.images as ProductImage[]) : [],
    category: CATEGORY_IDS.includes(row.category as CategoryId)
      ? (row.category as CategoryId)
      : CATEGORY_IDS[0],
    status: PRODUCT_STATUSES.includes(row.status as ProductStatus)
      ? (row.status as ProductStatus)
      : "available",
    ...(badge ? { badge } : {}),
    specs: Array.isArray(row.specs) ? (row.specs as ProductSpec[]) : [],
    order: row.sort_order,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

const SELECT_ALL = `
  select id, name, description, price, discount_percent, images, category, status,
         badge, specs, sort_order, created_at, updated_at
    from products
`;

export async function listProducts(): Promise<Product[]> {
  await ensureSchema();
  const rows = await query<ProductRow>(
    `${SELECT_ALL} order by sort_order asc, created_at asc`,
  );
  return rows.map(toProduct);
}

export async function getProduct(id: string): Promise<Product | null> {
  await ensureSchema();
  const rows = await query<ProductRow>(`${SELECT_ALL} where id = $1`, [id]);
  return rows[0] ? toProduct(rows[0]) : null;
}

async function insertProduct(product: Product): Promise<Product> {
  const rows = await query<ProductRow>(
    `insert into products
       (id, name, description, price, discount_percent, images, category, status,
        badge, specs, sort_order, created_at, updated_at)
     values ($1,$2,$3,$4,$5,$6::jsonb,$7,$8,$9,$10::jsonb,$11,$12,$13)
     returning id, name, description, price, discount_percent, images, category, status,
               badge, specs, sort_order, created_at, updated_at`,
    [
      product.id,
      product.name,
      product.description,
      product.price,
      product.discountPercent ?? null,
      JSON.stringify(product.images),
      product.category,
      product.status,
      product.badge ?? null,
      JSON.stringify(product.specs),
      product.order,
      product.createdAt,
      product.updatedAt,
    ],
  );
  return toProduct(rows[0]);
}

export async function createProduct(input: ProductInput): Promise<Product> {
  await ensureSchema();
  const now = new Date().toISOString();
  // New products go to the front, matching the admin panel's behaviour.
  await query("update products set sort_order = sort_order + 1");
  return insertProduct({
    ...input,
    id: `p-${crypto.randomUUID()}`,
    order: 0,
    createdAt: now,
    updatedAt: now,
  });
}

export async function updateProduct(
  id: string,
  input: ProductInput,
): Promise<Product | null> {
  await ensureSchema();
  const rows = await query<ProductRow>(
    `update products set
        name = $2, description = $3, price = $4, discount_percent = $5,
        images = $6::jsonb, category = $7, status = $8, badge = $9,
        specs = $10::jsonb, updated_at = now()
      where id = $1
      returning id, name, description, price, discount_percent, images, category, status,
                badge, specs, sort_order, created_at, updated_at`,
    [
      id,
      input.name,
      input.description,
      input.price,
      input.discountPercent ?? null,
      JSON.stringify(input.images),
      input.category,
      input.status,
      input.badge ?? null,
      JSON.stringify(input.specs),
    ],
  );
  return rows[0] ? toProduct(rows[0]) : null;
}

export async function deleteProduct(id: string): Promise<boolean> {
  await ensureSchema();
  const rows = await query<{ id: string }>(
    "delete from products where id = $1 returning id",
    [id],
  );
  return rows.length > 0;
}

export async function reorderProducts(orderedIds: string[]): Promise<Product[]> {
  await ensureSchema();
  // One statement rather than a loop: ordering stays consistent even under concurrent edits.
  await query(
    `update products as p
        set sort_order = v.position
       from (select * from unnest($1::text[]) with ordinality as t(id, position)) as v
      where p.id = v.id`,
    [orderedIds],
  );
  return listProducts();
}

/** Wholesale replacement, used by backup restore. */
export async function replaceAllProducts(products: Product[]): Promise<Product[]> {
  await ensureSchema();
  await query("delete from products");
  for (const [index, product] of products.entries()) {
    await insertProduct({ ...product, order: index });
  }
  return listProducts();
}

export async function resetProductsToSeed(): Promise<Product[]> {
  await ensureSchema();
  await query("delete from products");
  for (const product of SEED_PRODUCTS) await insertProduct(product);
  return listProducts();
}
