import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file was uploaded." },
        { status: 400 },
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename to prevent overwriting existing photos
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.name) || ".jpg";
    const filename = `food-${uniqueSuffix}${extension}`;

    // Target upload directory: public/uploads
    const uploadDir = path.join(process.cwd(), "public", "uploads");

    // Ensure the folder exists
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch {
      // Folder already exists or can't be created
    }

    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);

    // This is the public URL the client will save in MongoDB
    const publicUrl = `/uploads/${filename}`;

    return NextResponse.json({ success: true, url: publicUrl });
  } catch (error) {
    console.error("Upload error details:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error during upload." },
      { status: 500 },
    );
  }
}
