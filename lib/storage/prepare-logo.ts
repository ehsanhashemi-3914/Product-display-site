import {
  canvasToBlob,
  ImageProcessingError,
  loadImage,
  readAsDataUrl,
  replaceExtension,
} from "./image-storage";

/**
 * Prepares a logo for upload: trims the empty margin around the artwork and pads the
 * result back to a square, so a wide export doesn't float as a speck inside its badge.
 * Encoded as PNG so transparency survives and thin gold line-work avoids JPEG ringing.
 *
 * SVG passes through untouched — it is already resolution-independent.
 */

export const MAX_LOGO_SIZE = 512;
export const MAX_LOGO_BYTES = 5 * 1024 * 1024;
export const ACCEPTED_LOGO_TYPES = "image/png,image/jpeg,image/webp,image/svg+xml";

/** A pixel counts as artwork when it is visible and not part of a near-black plate. */
const ALPHA_THRESHOLD = 16;
const LUMA_THRESHOLD = 32;
const PADDING_RATIO = 0.06;

export async function prepareLogoFile(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) {
    throw new ImageProcessingError("فقط فایل تصویری قابل انتخاب است.");
  }
  if (file.size > MAX_LOGO_BYTES) {
    throw new ImageProcessingError("حجم فایل نباید بیشتر از ۵ مگابایت باشد.");
  }
  if (file.type === "image/svg+xml") return file;

  const image = await loadImage(await readAsDataUrl(file));
  const source = document.createElement("canvas");
  source.width = image.naturalWidth;
  source.height = image.naturalHeight;

  const sourceContext = source.getContext("2d", { willReadFrequently: true });
  if (!sourceContext) throw new ImageProcessingError("پردازش تصویر ممکن نشد.");
  sourceContext.drawImage(image, 0, 0);

  const { data } = sourceContext.getImageData(0, 0, source.width, source.height);
  const box = findContentBox(data, source.width, source.height);
  if (!box) throw new ImageProcessingError("تصویر خالی به نظر می‌رسد.");

  const padding = Math.round(Math.max(box.width, box.height) * PADDING_RATIO);
  const side = Math.max(box.width, box.height) + padding * 2;
  const scale = Math.min(1, MAX_LOGO_SIZE / side);

  const output = document.createElement("canvas");
  output.width = Math.max(1, Math.round(side * scale));
  output.height = output.width;

  const outputContext = output.getContext("2d");
  if (!outputContext) throw new ImageProcessingError("پردازش تصویر ممکن نشد.");

  // Repaint the original plate colour behind the artwork, unless the source was
  // transparent — in which case transparency is preserved.
  if (data[3] > ALPHA_THRESHOLD) {
    outputContext.fillStyle = `rgb(${data[0]} ${data[1]} ${data[2]})`;
    outputContext.fillRect(0, 0, output.width, output.height);
  }

  outputContext.drawImage(
    source,
    box.minX - (side - box.width) / 2,
    box.minY - (side - box.height) / 2,
    side,
    side,
    0,
    0,
    output.width,
    output.height,
  );

  const blob = await canvasToBlob(output, "image/png");
  if (!blob) throw new ImageProcessingError("پردازش تصویر ممکن نشد.");

  return new File([blob], replaceExtension(file.name, "png"), { type: "image/png" });
}

interface ContentBox {
  minX: number;
  minY: number;
  width: number;
  height: number;
}

function findContentBox(
  data: Uint8ClampedArray,
  width: number,
  height: number,
): ContentBox | null {
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const i = (y * width + x) * 4;
      if (data[i + 3] <= ALPHA_THRESHOLD) continue;
      if (Math.max(data[i], data[i + 1], data[i + 2]) <= LUMA_THRESHOLD) continue;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }

  if (maxX < 0) return null;
  return { minX, minY, width: maxX - minX + 1, height: maxY - minY + 1 };
}
