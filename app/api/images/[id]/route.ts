import { getImage } from "@/lib/db/media-db";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteContext) {
  const { id } = await params;
  const image = await getImage(id);

  if (!image) return new Response("Not found", { status: 404 });

  return new Response(new Uint8Array(image.bytes), {
    headers: {
      "Content-Type": image.mime,
      // Ids are random and content never changes under one, so this can cache forever.
      "Cache-Control": "public, max-age=31536000, immutable",
      // An uploaded SVG is markup; these stop it being treated as an active document.
      "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
