/**
 * Client-side image handling for the admin panel.
 *
 * Images are uploaded to the server (and stored in the database) rather than kept in the
 * browser. That is what makes a product photo visible to customers instead of only to the
 * person who added it — and it keeps the browser's small storage quota out of the picture
 * entirely, which is what used to make catalogues disappear.
 */

export const MAX_IMAGE_DIMENSION = 1400;
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const ACCEPTED_IMAGE_TYPES =
  "image/png,image/jpeg,image/webp,image/gif,image/svg+xml";

export class ImageProcessingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ImageProcessingError";
  }
}

/** Uploads a file and returns the URL to store on the product. */
export async function uploadImage(file: File): Promise<string> {
  const body = new FormData();
  body.append("file", file);

  const response = await fetch("/api/upload", {
    method: "POST",
    credentials: "same-origin",
    body,
  });

  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    // Fall through to the generic message.
  }

  if (!response.ok) {
    throw new ImageProcessingError(
      (payload as { error?: string } | null)?.error ?? "بارگذاری تصویر ناموفق بود.",
    );
  }
  return (payload as { url: string }).url;
}

/**
 * Shrinks oversized photos before upload. Phone cameras produce 4–8 MB files; a catalogue
 * image never needs more than ~1400px, and smaller uploads mean a faster site.
 */
export async function downscaleImage(
  file: File,
  maxDimension = MAX_IMAGE_DIMENSION,
): Promise<File> {
  if (!file.type.startsWith("image/")) {
    throw new ImageProcessingError("فقط فایل تصویری قابل انتخاب است.");
  }
  // Vectors and animations lose meaning when rasterised.
  if (file.type === "image/svg+xml" || file.type === "image/gif") return file;

  try {
    const image = await loadImage(await readAsDataUrl(file));
    const scale = Math.min(
      1,
      maxDimension / Math.max(image.naturalWidth, image.naturalHeight),
    );
    if (scale === 1 && file.size <= 600_000) return file;

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(image.naturalWidth * scale);
    canvas.height = Math.round(image.naturalHeight * scale);

    const context = canvas.getContext("2d");
    if (!context) return file;
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    const blob = await canvasToBlob(canvas, "image/jpeg", 0.85);
    if (!blob || blob.size >= file.size) return file;

    return new File([blob], replaceExtension(file.name, "jpg"), {
      type: "image/jpeg",
    });
  } catch {
    // Never block an upload over an optimisation.
    return file;
  }
}

export function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new ImageProcessingError("خواندن فایل ناموفق بود."));
    reader.readAsDataURL(file);
  });
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new ImageProcessingError("تصویر قابل خواندن نیست."));
    image.src = src;
  });
}

export function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality?: number,
): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

export function replaceExtension(name: string, extension: string): string {
  return `${name.replace(/\.[^.]+$/, "")}.${extension}`;
}
