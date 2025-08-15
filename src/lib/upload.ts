import { v2 as cloudinary } from "cloudinary";
import { NextRequest } from "next/server";
import formidable from "formidable";
import fs from "fs/promises";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadImage(file: File): Promise<string> {
  try {
    // Convert File to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create temporary file
    const tempPath = `/tmp/${Date.now()}-${file.name}`;
    await fs.writeFile(tempPath, buffer);

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(tempPath, {
      folder: "digital-catalogue",
      resource_type: "auto",
    });

    // Clean up temp file
    await fs.unlink(tempPath);

    return result.secure_url;
  } catch (error) {
    console.error("Upload error:", error);
    throw new Error("Failed to upload image");
  }
}

export async function deleteImage(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Delete image error:", error);
  }
}
