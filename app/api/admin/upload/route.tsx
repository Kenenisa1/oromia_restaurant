import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary from environment keys
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: "No image file discovered in payload." }, { status: 400 });
    }

    // Convert file object to an ArrayBuffer, then into a Node buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Stream upload directly to Cloudinary
    const uploadResult = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "oromia_restaurant_menu" },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      uploadStream.end(buffer);
    });

    return NextResponse.json({
      success: true,
      url: uploadResult.secure_url,
    }, { status: 200 });

  } catch (error: any) {
    console.error("Cloudinary Engine Upload Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}