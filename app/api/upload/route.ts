import { NextResponse } from "next/server";
import { ALLOWED_IMAGE_MIME, MAX_UPLOAD_BYTES, saveImage } from "@/lib/db/media-db";
import { jsonError, requireAdmin, serverErrorResponse } from "@/lib/api/guards";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const form = await request.formData();
    const file = form.get("file");

    if (!(file instanceof File)) return jsonError("فایلی ارسال نشده است.", 400);
    if (!ALLOWED_IMAGE_MIME.has(file.type)) {
      return jsonError("فقط تصویر با فرمت PNG، JPG، WebP، GIF یا SVG مجاز است.", 415);
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      return jsonError("حجم تصویر نباید بیشتر از ۵ مگابایت باشد.", 413);
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const id = await saveImage(file.type, bytes);

    return NextResponse.json({ url: `/api/images/${id}` }, { status: 201 });
  } catch (error) {
    return serverErrorResponse(error);
  }
}
