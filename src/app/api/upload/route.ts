// src/app/api/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { put, del } from "@vercel/blob";
import { getCurrentAdmin } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated admin
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { success: false, message: "Only image files are allowed" },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: "File size must be less than 10MB" },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2);
    const fileExtension = file.name.split(".").pop() || "jpg";
    const filename = `products/${timestamp}-${randomString}.${fileExtension}`;

    try {
      // Upload to Vercel Blob
      const blob = await put(filename, file, {
        access: "public",
        addRandomSuffix: false,
      });

      return NextResponse.json({
        success: true,
        url: blob.url,
        filename: filename,
        downloadUrl: blob.downloadUrl,
        pathname: blob.pathname,
      });
    } catch (blobError) {
      console.error("Blob upload error:", blobError);
      return NextResponse.json(
        { success: false, message: "Failed to upload to blob storage" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url");

    if (!url) {
      return NextResponse.json(
        { success: false, message: "No URL provided" },
        { status: 400 }
      );
    }

    try {
      // Extract the pathname from the blob URL
      // Vercel blob URLs are in format: https://[random].public.blob.vercel-storage.com/[pathname]
      let pathname = "";

      try {
        const urlObj = new URL(url);
        pathname = urlObj.pathname;

        // Remove leading slash if present
        pathname = pathname.startsWith("/") ? pathname.slice(1) : pathname;
      } catch (urlError) {
        // If URL parsing fails, try to extract pathname from the end of the URL
        const parts = url.split("/");
        pathname = parts[parts.length - 1];
        if (!pathname || pathname === url) {
          throw new Error("Invalid URL format");
        }
      }

      // Delete from Vercel Blob using the pathname
      await del(pathname);

      return NextResponse.json({
        success: true,
        message: "Image deleted successfully",
        deletedUrl: url,
        pathname: pathname,
      });
    } catch (deleteError) {
      console.error("Blob deletion error:", deleteError);

      // If it's a "blob not found" error, consider it successful
      if (deleteError instanceof Error) {
        const errorMessage = deleteError.message.toLowerCase();
        if (
          errorMessage.includes("not found") ||
          errorMessage.includes("does not exist") ||
          errorMessage.includes("404")
        ) {
          return NextResponse.json({
            success: true,
            message: "Image was already deleted or not found",
            deletedUrl: url,
          });
        }
      }

      return NextResponse.json(
        {
          success: false,
          message: "Failed to delete from blob storage",
          error:
            deleteError instanceof Error
              ? deleteError.message
              : "Unknown error",
          url: url,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Delete endpoint error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
