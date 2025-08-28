import { NextRequest, NextResponse } from "next/server";
import { put, del, list } from "@vercel/blob";

export async function GET(request: NextRequest) {
  try {
    // Get all carousel images from Vercel Blob
    const { blobs } = await list({
      prefix: "carousel/",
      limit: 100,
    });

    // Transform blob data to carousel image format
    const carouselImages = blobs.map((blob, index) => {
      // Extract metadata from the blob pathname if available
      const pathParts = blob.pathname.split("/");
      const filename = pathParts[pathParts.length - 1];

      return {
        id: blob.pathname.replace("/", "-"), // Use pathname as unique ID
        url: blob.url,
        title:
          blob.pathname.split("-title-")[1]?.split("-desc-")[0] ||
          filename.split(".")[0] ||
          "Untitled",
        description:
          blob.pathname.split("-desc-")[1]?.split("-order-")[0] || "",
        order:
          parseInt(blob.pathname.split("-order-")[1]?.split("-active-")[0]) ||
          index + 1,
        isActive: blob.pathname.includes("-active-true") || true,
        createdAt: blob.uploadedAt,
        updatedAt: blob.uploadedAt,
      };
    });

    // Sort by order
    carouselImages.sort((a, b) => a.order - b.order);

    return NextResponse.json(carouselImages);
  } catch (error) {
    console.error("Get carousel images error:", error);
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const order = parseInt(formData.get("order") as string) || 1;
    const isActive = formData.get("isActive") === "true";

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, message: "No files provided" },
        { status: 400 }
      );
    }

    const uploadedImages = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Validate file type
      if (!file.type.startsWith("image/")) {
        continue; // Skip non-image files
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        continue; // Skip files that are too large
      }

      // Create filename with metadata embedded
      const fileExtension = file.name.split(".").pop() || "jpg";
      const timestamp = Date.now();
      const cleanTitle = title.replace(/[^a-zA-Z0-9]/g, "") || "image";
      const cleanDesc = description.replace(/[^a-zA-Z0-9]/g, "") || "";
      const currentOrder = order + i;

      const filename = `carousel/${timestamp}-${i}-title-${cleanTitle}-desc-${cleanDesc}-order-${currentOrder}-active-${isActive}.${fileExtension}`;

      try {
        // Upload to Vercel Blob
        const blob = await put(filename, file, {
          access: "public",
        });

        const carouselImage = {
          id: filename.replace("/", "-"),
          url: blob.url,
          title: title || `Image ${i + 1}`,
          description: description || "",
          order: currentOrder,
          isActive,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        uploadedImages.push(carouselImage);
      } catch (uploadError) {
        console.error("Error uploading file:", file.name, uploadError);
      }
    }

    if (uploadedImages.length === 0) {
      return NextResponse.json(
        { success: false, message: "No valid images were uploaded" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: uploadedImages,
      message: `Successfully uploaded ${uploadedImages.length} image(s)`,
    });
  } catch (error) {
    console.error("Upload carousel images error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to upload images" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, title, description, order, isActive } = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Image ID is required" },
        { status: 400 }
      );
    }

    // Get current blob info
    const { blobs } = await list({
      prefix: "carousel/",
      limit: 100,
    });

    const currentBlob = blobs.find(
      (blob) => blob.pathname.replace("/", "-") === id
    );

    if (!currentBlob) {
      return NextResponse.json(
        { success: false, message: "Image not found" },
        { status: 404 }
      );
    }

    // Create new filename with updated metadata
    const originalFilename = currentBlob.pathname;
    const fileExtension = originalFilename.split(".").pop();
    const timestamp = originalFilename.split("/")[1].split("-")[0]; // Keep original timestamp
    const imageIndex = originalFilename.split("-")[1] || "0";

    const cleanTitle = title.replace(/[^a-zA-Z0-9]/g, "") || "image";
    const cleanDesc = description.replace(/[^a-zA-Z0-9]/g, "") || "";

    const newFilename = `carousel/${timestamp}-${imageIndex}-title-${cleanTitle}-desc-${cleanDesc}-order-${order}-active-${isActive}.${fileExtension}`;

    // If filename changed, we need to re-upload with new name and delete old
    if (newFilename !== originalFilename) {
      try {
        // Fetch the blob content
        const response = await fetch(currentBlob.url);
        const arrayBuffer = await response.arrayBuffer();

        // Upload with new filename
        await put(newFilename, arrayBuffer, {
          access: "public",
        });

        // Delete old blob
        await del(currentBlob.url);
      } catch (renameError) {
        console.error("Error renaming blob:", renameError);
        // If rename fails, just return success with current data
      }
    }

    const updatedImage = {
      id: newFilename.replace("/", "-"),
      title,
      description,
      order,
      isActive,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: updatedImage,
    });
  } catch (error) {
    console.error("Update carousel image error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update image" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const imageUrl = searchParams.get("url");

    if (!id || !imageUrl) {
      return NextResponse.json(
        { success: false, message: "Image ID and URL are required" },
        { status: 400 }
      );
    }

    // Delete from Vercel Blob
    try {
      await del(imageUrl);
    } catch (blobError) {
      console.error("Error deleting from blob:", blobError);
      return NextResponse.json(
        { success: false, message: "Failed to delete image from storage" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Image deleted successfully",
    });
  } catch (error) {
    console.error("Delete carousel image error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete image" },
      { status: 500 }
    );
  }
}
