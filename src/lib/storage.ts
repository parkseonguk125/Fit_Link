import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const endpoint = process.env.MINIO_ENDPOINT ?? "http://localhost:9000";
const accessKeyId = process.env.MINIO_ACCESS_KEY ?? "minioadmin";
const secretAccessKey = process.env.MINIO_SECRET_KEY ?? "minioadmin";
const bucket = process.env.MINIO_BUCKET ?? "record-images";
const publicUrl = process.env.MINIO_PUBLIC_URL ?? "http://localhost:9000";

export const minioBucket = bucket;
export const minioPublicUrl = publicUrl;

export const s3Client = new S3Client({
  endpoint,
  region: "us-east-1",
  credentials: { accessKeyId, secretAccessKey },
  forcePathStyle: true,
});

export async function uploadImage(
  file: Buffer,
  filename: string,
  contentType: string,
): Promise<{ url: string; storagePath: string }> {
  const storagePath = `uploads/${Date.now()}-${filename}`;

  await s3Client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: storagePath,
      Body: file,
      ContentType: contentType,
    }),
  );

  return {
    storagePath,
    url: `${publicUrl}/${bucket}/${storagePath}`,
  };
}
