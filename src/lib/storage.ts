import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { createClientId } from "@/lib/create-id";

const uploadRoot = process.env.UPLOAD_DIR ?? path.join(process.cwd(), "uploads");

const allowedExtensions = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".webp",
  ".heic",
  ".heif",
  ".avif",
]);

const mimeToExtension: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/gif": ".gif",
  "image/webp": ".webp",
  "image/heic": ".heic",
  "image/heif": ".heif",
  "image/avif": ".avif",
};

function resolveExtension(filename: string, mimeType?: string): string {
  const fromName = path.extname(filename).toLowerCase();
  if (fromName && allowedExtensions.has(fromName)) {
    return fromName;
  }

  if (mimeType && mimeToExtension[mimeType]) {
    return mimeToExtension[mimeType];
  }

  return ".jpg";
}

export async function uploadImage(
  file: Buffer,
  filename: string,
  mimeType?: string,
): Promise<{ url: string; storagePath: string }> {
  const extension = resolveExtension(filename, mimeType);
  const storagePath = `${createClientId()}${extension}`;
  const absolutePath = path.join(uploadRoot, storagePath);

  await mkdir(uploadRoot, { recursive: true });
  await writeFile(absolutePath, file);

  return {
    storagePath,
    url: `/api/files/${storagePath}`,
  };
}

export function getUploadPath(storagePath: string): string {
  const safePath = path.basename(storagePath);
  return path.join(uploadRoot, safePath);
}

export async function deleteUploadedFile(storagePath: string): Promise<void> {
  try {
    await unlink(getUploadPath(storagePath));
  } catch {
    // 파일이 없어도 DB 삭제는 계속 진행
  }
}

export { uploadRoot };
