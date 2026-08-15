import type { Category, Product, ProductStatus } from "@/types/product";

export const CATEGORIES: readonly Category[] = [
  { id: "torbat", name: "مهر تربت کربلا" },
  { id: "stone", name: "مهر سنگی" },
  { id: "travel", name: "مهر جیبی و سفری" },
  { id: "decorative", name: "مهر تزئینی" },
  { id: "bulk", name: "بسته عمده" },
  { id: "accessories", name: "جانماز و تسبیح" },
] as const;

export const STATUS_LABELS: Record<ProductStatus, string> = {
  available: "موجود",
  out_of_stock: "ناموجود",
  preorder: "پیش‌سفارش",
};

export function categoryName(id: string): string {
  return CATEGORIES.find((category) => category.id === id)?.name ?? "دسته‌بندی‌نشده";
}

/**
 * Default catalogue used when the browser has no stored data yet, and as the
 * server-render snapshot so crawlers and first paint see real content.
 *
 * Values are hardcoded (no Date.now(), no random ids) so the server and client
 * produce byte-identical markup.
 */
export const SEED_PRODUCTS: readonly Product[] = [
  {
    id: "seed-torbat-moattar",
    name: "مهر تربت کربلای معطر — درجه یک",
    description:
      "مهر نماز از تربت اصل کربلای معلی، با خاک الک‌شده و پرس هیدرولیک. سطح کاملاً صاف، بدون ترک و با عطر ملایم و ماندگار. مناسب استفادهٔ روزانه و هدیه.",
    price: 45000,
    images: [
      { id: "img-1a", url: "/products/torbat-round.svg", alt: "مهر تربت کربلای معطر، قالب گرد" },
      { id: "img-1b", url: "/products/torbat-square.svg", alt: "نمای مهر تربت در قالب چهارگوش" },
      { id: "img-1c", url: "/products/decorative-gold.svg", alt: "بستهٔ هدیهٔ مهر تربت کربلا" },
    ],
    category: "torbat",
    status: "available",
    badge: "پرفروش",
    specs: [
      { id: "spec-1a", label: "جنس", value: "تربت اصل کربلای معلی" },
      { id: "spec-1b", label: "قطر", value: "۵ سانتی‌متر" },
      { id: "spec-1c", label: "وزن", value: "۳۵ گرم" },
      { id: "spec-1d", label: "بسته‌بندی", value: "جعبهٔ مقوایی تک‌عددی" },
    ],
    order: 0,
    createdAt: "2025-02-11T09:00:00.000Z",
    updatedAt: "2025-05-03T09:00:00.000Z",
  },
  {
    id: "seed-torbat-classic",
    name: "مهر تربت کربلا — قالب گرد کلاسیک",
    description:
      "پرفروش‌ترین مدل ما در چهل سال گذشته. قالب گرد ساده با ضخامت استاندارد، مقاوم در برابر شکستگی و مناسب مساجد و هیئت‌ها.",
    price: 32000,
    images: [
      { id: "img-2a", url: "/products/torbat-round.svg", alt: "مهر تربت کربلا با قالب گرد کلاسیک" },
    ],
    category: "torbat",
    status: "available",
    specs: [
      { id: "spec-2a", label: "جنس", value: "تربت کربلا" },
      { id: "spec-2b", label: "قطر", value: "۴٫۵ سانتی‌متر" },
      { id: "spec-2c", label: "حداقل سفارش", value: "۱ عدد" },
    ],
    order: 1,
    createdAt: "2025-01-20T09:00:00.000Z",
    updatedAt: "2025-04-18T09:00:00.000Z",
  },
  {
    id: "seed-stone-octagon",
    name: "مهر سنگی هشت‌ضلعی — سنگ طبیعی",
    description:
      "برش‌خورده از سنگ طبیعی و پولیش‌شده با دست. رنگ سبز-خاکستری با رگه‌های طبیعی که در هر قطعه متفاوت است. عمر بسیار طولانی و مقاوم در برابر رطوبت.",
    price: 68000,
    discountPercent: 15,
    images: [
      { id: "img-3a", url: "/products/stone-octagon.svg", alt: "مهر سنگی هشت‌ضلعی از سنگ طبیعی" },
      { id: "img-3b", url: "/products/torbat-square.svg", alt: "نمای جانبی مهر سنگی هشت‌ضلعی" },
    ],
    category: "stone",
    status: "available",
    specs: [
      { id: "spec-3a", label: "جنس", value: "سنگ طبیعی پولیش‌شده" },
      { id: "spec-3b", label: "ابعاد", value: "۵ × ۵ سانتی‌متر" },
      { id: "spec-3c", label: "وزن", value: "۷۰ گرم" },
    ],
    order: 2,
    createdAt: "2025-03-05T09:00:00.000Z",
    updatedAt: "2025-06-12T09:00:00.000Z",
  },
  {
    id: "seed-travel-set",
    name: "ست سفری مهر و جانماز با کیف",
    description:
      "ست کامل سفر شامل مهر کوچک، تسبیح و جانماز تاشو در کیف پارچه‌ای ضدآب. جمع‌وجور و سبک، مناسب کوله‌پشتی و ساک دستی.",
    price: 145000,
    images: [
      { id: "img-4a", url: "/products/travel-set.svg", alt: "ست سفری مهر نماز همراه با کیف" },
    ],
    category: "travel",
    status: "preorder",
    badge: "جدید",
    specs: [
      { id: "spec-4a", label: "محتویات", value: "مهر، تسبیح، جانماز تاشو، کیف" },
      { id: "spec-4b", label: "ابعاد کیف", value: "۱۵ × ۱۰ سانتی‌متر" },
      { id: "spec-4c", label: "زمان آماده‌سازی", value: "۳ تا ۵ روز کاری" },
    ],
    order: 3,
    createdAt: "2025-06-01T09:00:00.000Z",
    updatedAt: "2025-07-22T09:00:00.000Z",
  },
  {
    id: "seed-pocket-pack",
    name: "مهر جیبی کوچک — بستهٔ ۵ عددی",
    description:
      "مهر کم‌ضخامت و سبک در بستهٔ پنج‌تایی، مناسب جیب، کیف و داشبورد خودرو. هر عدد در کاور نایلونی جداگانه بسته‌بندی می‌شود.",
    price: 58000,
    images: [
      { id: "img-5a", url: "/products/torbat-square.svg", alt: "مهر جیبی کوچک در بستهٔ پنج‌عددی" },
    ],
    category: "travel",
    status: "available",
    specs: [
      { id: "spec-5a", label: "تعداد در بسته", value: "۵ عدد" },
      { id: "spec-5b", label: "ابعاد هر مهر", value: "۳ × ۳ سانتی‌متر" },
    ],
    order: 4,
    createdAt: "2025-04-02T09:00:00.000Z",
    updatedAt: "2025-04-02T09:00:00.000Z",
  },
  {
    id: "seed-decorative-gold",
    name: "مهر تزئینی با حاشیهٔ طلایی",
    description:
      "مهر نماز با قاب فلزی آبکاری‌شده و حکاکی حاشیه، در جعبهٔ مخمل. انتخابی مناسب برای هدیهٔ عروسی، سالگرد و مراسم مذهبی.",
    price: 120000,
    images: [
      { id: "img-6a", url: "/products/decorative-gold.svg", alt: "مهر تزئینی با حاشیهٔ طلایی در جعبهٔ هدیه" },
    ],
    category: "decorative",
    status: "available",
    badge: "ویژهٔ هدیه",
    specs: [
      { id: "spec-6a", label: "قاب", value: "فلز آبکاری طلایی" },
      { id: "spec-6b", label: "بسته‌بندی", value: "جعبهٔ مخمل" },
      { id: "spec-6c", label: "قطر", value: "۶ سانتی‌متر" },
    ],
    order: 5,
    createdAt: "2025-05-14T09:00:00.000Z",
    updatedAt: "2025-07-01T09:00:00.000Z",
  },
  {
    id: "seed-bulk-carton",
    name: "کارتن عمدهٔ مهر نماز — ۵۰۰ عددی",
    description:
      "بستهٔ عمده مخصوص مساجد، حسینیه‌ها، هیئت‌ها و فروشگاه‌ها. ارسال با باربری به سراسر کشور و صادرات به کشورهای همسایه. امکان چاپ نام مجموعه روی بسته‌بندی.",
    price: 4500000,
    discountPercent: 10,
    images: [
      { id: "img-7a", url: "/products/bulk-carton.svg", alt: "کارتن عمدهٔ مهر نماز پانصد عددی" },
      { id: "img-7b", url: "/products/torbat-round.svg", alt: "نمونهٔ مهر داخل کارتن عمده" },
    ],
    category: "bulk",
    status: "available",
    specs: [
      { id: "spec-7a", label: "تعداد در کارتن", value: "۵۰۰ عدد" },
      { id: "spec-7b", label: "وزن کارتن", value: "حدود ۱۹ کیلوگرم" },
      { id: "spec-7c", label: "نحوهٔ ارسال", value: "باربری، سراسر کشور" },
      { id: "spec-7d", label: "چاپ سفارشی", value: "امکان‌پذیر" },
    ],
    order: 6,
    createdAt: "2025-02-25T09:00:00.000Z",
    updatedAt: "2025-07-30T09:00:00.000Z",
  },
  {
    id: "seed-tasbih",
    name: "تسبیح شاه‌مقصود ۳۳ دانه",
    description:
      "تسبیح دست‌ساز با دانه‌های تراش‌خورده و نخ ابریشمی مقاوم. وزن متعادل و لمس مطبوع. همراه با کیسهٔ پارچه‌ای نگهداری.",
    price: 95000,
    images: [
      { id: "img-8a", url: "/products/tasbih.svg", alt: "تسبیح شاه‌مقصود سی‌وسه دانه" },
    ],
    category: "accessories",
    status: "out_of_stock",
    specs: [
      { id: "spec-8a", label: "تعداد دانه", value: "۳۳ عدد" },
      { id: "spec-8b", label: "قطر دانه", value: "۸ میلی‌متر" },
    ],
    order: 7,
    createdAt: "2025-03-19T09:00:00.000Z",
    updatedAt: "2025-06-28T09:00:00.000Z",
  },
];
