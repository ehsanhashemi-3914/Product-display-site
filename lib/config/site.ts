import { formatPhone } from "@/lib/format";

/**
 * Single source of truth for brand + contact details.
 * Nothing else in the codebase hardcodes a phone number or handle.
 */

export interface TrustItem {
  /** lucide-react icon name, resolved in components/products/TrustStrip.tsx */
  readonly icon: "award" | "package" | "truck";
  readonly label: string;
  readonly value: string;
}

export const SITE = {
  name: "مهر نماز احسان",
  producer: "تولیدی سید جواد هاشمی",
  tagline: "تولید و عرضهٔ مستقیم مهر نماز",
  description:
    "مهر نماز احسان، تولیدی سید جواد هاشمی، با بیش از ۲۰ سال سابقه در تولید مهر نماز و فروش بیش از یک میلیارد مهر. ارسال به سراسر کشور و کشورهای همسایه.",
  keywords: [
    "مهر نماز",
    "مهر تربت کربلا",
    "خرید مهر نماز",
    "تولیدی مهر نماز",
    "مهر نماز عمده",
    "مهر نماز احسان",
  ],
  /** TODO: replace with the real production domain before deploying. */
  url: "https://mohr-ehsan.ir",

  /**
   * Optional file-based logo, kept null on purpose.
   *
   * The normal way to set a logo is the admin panel (تنظیمات برند), which stores it in
   * the browser. Pointing this at e.g. "/brand/logo.png" is only for baking artwork into
   * the build instead — leaving it null avoids a guaranteed 404 on every page render.
   */
  logo: null as string | null,

  trust: [
    { icon: "award", label: "سابقهٔ تولید", value: "بیش از ۲۰ سال" },
    { icon: "package", label: "فروش تجمعی", value: "بیش از ۱ میلیارد مهر نماز" },
    { icon: "truck", label: "ارسال", value: "سراسر کشور و کشورهای همسایه" },
  ] satisfies readonly TrustItem[],

  contact: {
    /** Local format, digits only. The first one is treated as the primary line. */
    phones: ["09159123914", "09930813843"],
    /**
     * wa.me resolves phone numbers, not @usernames, so the WhatsApp button is built
     * from this number. Change it here if WhatsApp is on the other line.
     */
    whatsappPhone: "09159123914",
    telegram: "mohreehsan",
    instagram: "mohre_namaz_ehsan",
  },
} as const;

/** 09159123914 → +989159123914 (E.164, what tel: and wa.me expect). */
function toInternational(localPhone: string): string {
  return `98${localPhone.replace(/\D/g, "").replace(/^0/, "")}`;
}

export interface ContactChannel {
  readonly id: "phone" | "whatsapp" | "telegram" | "instagram";
  readonly label: string;
  /** Rendered value — already Persian-digit formatted where it is a number. */
  readonly value: string;
  readonly href: string;
  /** Off-site links need target/rel; tel: links must not have them. */
  readonly external: boolean;
  /** LTR handles and numbers must not be re-ordered by the RTL layout. */
  readonly ltr: boolean;
}

export const CONTACT_CHANNELS: readonly ContactChannel[] = [
  ...SITE.contact.phones.map(
    (phone, index): ContactChannel => ({
      id: "phone",
      label: index === 0 ? "تلفن تماس" : "تلفن دوم",
      value: formatPhone(phone),
      href: `tel:+${toInternational(phone)}`,
      external: false,
      ltr: true,
    }),
  ),
  {
    id: "whatsapp",
    label: "واتساپ",
    value: formatPhone(SITE.contact.whatsappPhone),
    href: `https://wa.me/${toInternational(SITE.contact.whatsappPhone)}`,
    external: true,
    ltr: true,
  },
  {
    id: "telegram",
    label: "تلگرام",
    value: `@${SITE.contact.telegram}`,
    href: `https://t.me/${SITE.contact.telegram}`,
    external: true,
    ltr: true,
  },
  {
    id: "instagram",
    label: "اینستاگرام",
    value: `@${SITE.contact.instagram}`,
    href: `https://instagram.com/${SITE.contact.instagram}`,
    external: true,
    ltr: true,
  },
];
