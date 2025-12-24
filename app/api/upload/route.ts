import cloudinary from "@/lib/cloudinary";
import { NextResponse } from "next/server";
import { blob } from "stream/consumers";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("image") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large (max 10MB)" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Determine resource type based on file type
    const fileType = file.type;
    let resourceType: "image" | "video" | "raw" | "auto" = "auto";

    if (fileType.startsWith("image/")) {
      resourceType = "image";
    } else if (fileType.startsWith("video/")) {
      resourceType = "video";
    } else {
      // For PDFs and other files
      resourceType = "raw";
    }

    console.log("📤 Uploading file:", {
      name: file.name,
      type: fileType,
      size: file.size,
      resourceType,
    });

    // Use signed upload without upload preset
    const uploadResult: any = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: "CUploads",
            resource_type: resourceType,
            type: "upload",
            invalidate: true, // Invalidate CDN cache
          },
          (error, result) => {
            if (error) {
              console.error("❌ Cloudinary upload error:", error);
              reject(error);
            } else {
              console.log("✅ Cloudinary upload success:", {
                public_id: result?.public_id,
                resource_type: result?.resource_type,
                format: result?.format,
                secure_url: result?.secure_url,
              });
              resolve(result);
            }
          }
        )
        .end(buffer);
    });

    // Cloudinary already provides the correct secure_url for all resource types
    const finalUrl = uploadResult.secure_url;

    console.log("📥 Final URL:", finalUrl);

    return NextResponse.json({
      success: true,
      url: finalUrl,
      public_id: uploadResult.public_id,
      resource_type: uploadResult.resource_type,
      format: uploadResult.format,
    });
  } catch (error) {
    console.error("❌ Upload error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error while uploading file to cloudinary",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
