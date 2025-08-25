// src/app/api/admin/products/bulk/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import { getCurrentAdmin } from "@/lib/auth";
import { del } from "@vercel/blob";

export async function PATCH(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await dbConnect();

    const { productIds, action, data } = await request.json();

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json(
        { success: false, message: "No product IDs provided" },
        { status: 400 }
      );
    }

    let updateData = {};

    switch (action) {
      case "toggleStatus":
        // Toggle the status of selected products
        const products = await Product.find({ _id: { $in: productIds } });
        const updates = await Promise.all(
          products.map(async (product) => {
            const newStatus = !product.isActive;
            return Product.findByIdAndUpdate(
              product._id,
              { isActive: newStatus },
              { new: true }
            );
          })
        );
        return NextResponse.json({
          success: true,
          message: `Updated ${updates.length} products`,
          data: updates,
        });

      case "activate":
        updateData = { isActive: true };
        break;

      case "deactivate":
        updateData = { isActive: false };
        break;

      case "updateCategory":
        if (!data?.category) {
          return NextResponse.json(
            { success: false, message: "Category is required" },
            { status: 400 }
          );
        }
        updateData = { category: data.category };
        break;

      case "updateStock":
        if (typeof data?.stock !== "number") {
          return NextResponse.json(
            { success: false, message: "Valid stock number is required" },
            { status: 400 }
          );
        }
        updateData = { stock: data.stock };
        break;

      default:
        return NextResponse.json(
          { success: false, message: "Invalid action" },
          { status: 400 }
        );
    }

    const result = await Product.updateMany(
      { _id: { $in: productIds } },
      { $set: updateData }
    );

    const updatedProducts = await Product.find({ _id: { $in: productIds } });

    return NextResponse.json({
      success: true,
      message: `Updated ${result.modifiedCount} products`,
      data: updatedProducts,
    });
  } catch (error) {
    console.error("Bulk update error:", error);
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

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const productIdsParam = searchParams.get("productIds");

    if (!productIdsParam) {
      return NextResponse.json(
        { success: false, message: "No product IDs provided" },
        { status: 400 }
      );
    }

    const productIds = productIdsParam.split(",");

    // Get products first to retrieve their images
    const products = await Product.find({ _id: { $in: productIds } });

    // Collect all image URLs for deletion
    const imageUrls: string[] = [];
    products.forEach((product) => {
      if (product.images && product.images.length > 0) {
        imageUrls.push(...product.images);
      }
    });

    // Delete images from Vercel Blob
    const imageDeletePromises = imageUrls.map(async (url) => {
      try {
        const urlObj = new URL(url);
        const pathname = urlObj.pathname.startsWith("/")
          ? urlObj.pathname.slice(1)
          : urlObj.pathname;
        await del(pathname);
      } catch (error) {
        console.error(`Failed to delete image ${url}:`, error);
        // Continue even if some images fail to delete
      }
    });

    // Wait for image deletions (but don't fail if some images fail)
    await Promise.allSettled(imageDeletePromises);

    // Delete products from database
    const result = await Product.deleteMany({ _id: { $in: productIds } });

    return NextResponse.json({
      success: true,
      message: `Deleted ${result.deletedCount} products`,
      deletedCount: result.deletedCount,
      imagesDeleted: imageUrls.length,
    });
  } catch (error) {
    console.error("Bulk delete error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
