import { randomUUID } from "node:crypto";
import { extname } from "node:path";
import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const bucket = process.env.R2_BUCKET_NAME || process.env.R2_BUCKET;

function getR2Client() {
  if (!process.env.R2_ENDPOINT || !process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY) {
    throw new Error("R2_NOT_CONFIGURED");
  }

  return new S3Client({
    region: "auto",
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
  });
}

export async function uploadBufferToR2(params: {
  key: string;
  body: Buffer;
  contentType?: string;
}) {
  if (!bucket) throw new Error("R2_BUCKET_NOT_CONFIGURED");

  await getR2Client().send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: params.key,
      Body: params.body,
      ContentType: params.contentType,
    })
  );

  return {
    key: params.key,
    publicUrl: process.env.R2_PUBLIC_URL
      ? `${process.env.R2_PUBLIC_URL.replace(/\/$/, "")}/${params.key}`
      : null,
  };
}

export async function uploadRemoteFileToR2(params: {
  url: string;
  prefix: string;
  fallbackExtension?: string;
}) {
  const response = await fetch(params.url);
  if (!response.ok) {
    throw new Error(`REMOTE_FILE_FETCH_FAILED_${response.status}`);
  }

  const contentType = response.headers.get("content-type") ?? undefined;
  const contentLength = response.headers.get("content-length");
  const bytes = Buffer.from(await response.arrayBuffer());
  const extension = inferExtension(params.url, contentType, params.fallbackExtension);
  const key = `${params.prefix}/${randomUUID()}${extension}`;

  await uploadBufferToR2({ key, body: bytes, contentType });

  return {
    key,
    contentType,
    sizeBytes: contentLength ? Number(contentLength) : bytes.byteLength,
  };
}

export async function createSignedDownloadUrl(key: string, expiresIn = 60 * 60 * 24) {
  if (!bucket) throw new Error("R2_BUCKET_NOT_CONFIGURED");

  return getSignedUrl(
    getR2Client(),
    new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    }),
    { expiresIn }
  );
}

function inferExtension(url: string, contentType?: string, fallback = "") {
  try {
    const pathname = new URL(url).pathname;
    const ext = extname(pathname);
    if (ext) return ext;
  } catch {
    // Keep falling back to content-type.
  }

  if (contentType?.includes("video/mp4")) return ".mp4";
  if (contentType?.includes("image/png")) return ".png";
  if (contentType?.includes("image/webp")) return ".webp";
  if (contentType?.includes("image/jpeg")) return ".jpg";
  return fallback;
}
