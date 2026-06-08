import { mkdir, writeFile } from "fs/promises";
import path from "path";

const uploadRoot = process.env.UPLOAD_DIR ?? path.join(process.cwd(), "uploads");

function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export async function uploadImage(
  file: Buffer,
  filename: string,
): Promise<{ url: string; storagePath: string }> {
  const storagePath = `${Date.now()}-${sanitizeFilename(filename)}`;
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

export { uploadRoot };
