import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createSignedDownloadUrl, uploadBufferToR2 } from "@/lib/storage";
import { randomUUID } from "node:crypto";

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
    const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);

    if (!isImage && !isVideo) {
      return NextResponse.json(
        { error: `Unsupported file type: ${file.type}. Allowed: ${[...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES].join(", ")}` },
        { status: 400 }
      );
    }

    const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File too large. Max ${isImage ? "10MB" : "100MB"}` },
        { status: 400 }
      );
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const ext = file.name.split(".").pop() || (isImage ? "png" : "mp4");
    const key = `uploads/${user.id}/${randomUUID()}.${ext}`;

    const result = await uploadBufferToR2({
      key,
      body: bytes,
      contentType: file.type,
    });

    const url = result.publicUrl ?? await createSignedDownloadUrl(result.key, 60 * 30);

    return NextResponse.json({
      key: result.key,
      url,
      contentType: file.type,
      sizeBytes: bytes.byteLength,
    });
  } catch (error) {
    console.error("Upload error:", error);
    if (
      error instanceof Error &&
      (error.message === "R2_NOT_CONFIGURED" || error.message === "R2_BUCKET_NOT_CONFIGURED")
    ) {
      return NextResponse.json({ error: "File storage not configured" }, { status: 503 });
    }
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
