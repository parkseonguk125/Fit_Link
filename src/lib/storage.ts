import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { del, put } from "@vercel/blob";
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

export function useBlobStorage(): boolean {
  // Vercel: BLOB_STORE_ID + OIDC 토큰(자동) 또는 BLOB_READ_WRITE_TOKEN
  return Boolean(
    process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID,
  );
}

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

async function uploadImageToBlob(
  file: Buffer,
  filename: string,
  mimeType?: string,
): Promise<{ url: string; storagePath: string }> {
  const extension = resolveExtension(filename, mimeType);
  const storagePath = `${createClientId()}${extension}`;
  const blobPath = `uploads/${storagePath}`;
  const contentType = mimeType ?? mimeToExtension[extension] ?? "image/jpeg";

  const blob = await put(blobPath, file, {
    access: "public",
    contentType,
    addRandomSuffix: false,
  });

  return {
    url: blob.url,
    storagePath: blob.url,
  };
}

async function uploadImageToDisk(
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

export async function uploadImage(
  file: Buffer,
  filename: string,
  mimeType?: string,
): Promise<{ url: string; storagePath: string }> {
  if (useBlobStorage()) {
    return uploadImageToBlob(file, filename, mimeType);
  }

  return uploadImageToDisk(file, filename, mimeType);
}

export function getUploadPath(storagePath: string): string {
  const safePath = path.basename(storagePath);
  return path.join(uploadRoot, safePath);
}

async function deleteBlobFile(storagePath: string): Promise<void> {
  try {
    await del(storagePath);
  } catch {
    // 파일이 없어도 DB 삭제는 계속 진행
  }
}

export async function deleteUploadedFile(storagePath: string): Promise<void> {
  if (storagePath.startsWith("https://")) {
    await deleteBlobFile(storagePath);
    return;
  }

  if (useBlobStorage()) {
    await deleteBlobFile(storagePath);
    return;
  }

  try {
    await unlink(getUploadPath(storagePath));
  } catch {
    // 파일이 없어도 DB 삭제는 계속 진행
  }
}

export { uploadRoot };
