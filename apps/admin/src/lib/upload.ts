"use client";

import { createClient } from "@kiloclub/shared/supabase/client";

const MAX_SIDE = 1600;

/** Shrinks big photos to max 1600px WebP before upload (saves storage and page weight). */
async function compress(file: File): Promise<Blob> {
  if (!file.type.startsWith("image/") || file.type === "image/gif" || file.type === "image/svg+xml") return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    if (scale === 1 && file.size < 400_000) return file;
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.86));
    return blob && blob.size < file.size ? blob : file;
  } catch {
    return file;
  }
}

/** Uploads an image to the public `product-images` bucket and returns its URL. */
export async function uploadImage(file: File, folder: string): Promise<string> {
  if (file.size > 15 * 1024 * 1024) throw new Error(`${file.name} is larger than 15 MB`);
  const body = await compress(file);
  const ext = body.type === "image/webp" ? "webp" : (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const supabase = createClient();
  const { error } = await supabase.storage
    .from("product-images")
    .upload(path, body, { contentType: body.type || file.type, cacheControl: "31536000" });
  if (error) throw new Error(error.message);
  return supabase.storage.from("product-images").getPublicUrl(path).data.publicUrl;
}
