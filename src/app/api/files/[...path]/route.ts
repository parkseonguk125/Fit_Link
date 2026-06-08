import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { getUploadPath } from "@/lib/storage";

const mimeTypes: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  try {
    const segments = (await params).path;
    const filename = path.basename(segments.join("/"));
    const filePath = getUploadPath(filename);
    const buffer = await readFile(filePath);
    const extension = path.extname(filename).toLowerCase();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": mimeTypes[extension] ?? "application/octet-stream",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch {
    return NextResponse.json({ error: "파일을 찾을 수 없습니다." }, { status: 404 });
  }
}
