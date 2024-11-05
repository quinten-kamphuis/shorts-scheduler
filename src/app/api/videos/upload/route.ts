import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { db } from "@/lib/drizzle/db";
import { VideoTable } from "@/lib/drizzle/schema";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const title = formData.get("title") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });

    // Create a unique filename
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const filename = `${uniqueSuffix}-${file.name.replace(
      /[^a-zA-Z0-9\.]/g,
      ""
    )}`;
    const filepath = path.join(uploadsDir, filename);

    // Convert File to ArrayBuffer and then to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Write file to disk
    await writeFile(filepath, buffer);

    // Create video record in database
    const [video] = await db
      .insert(VideoTable)
      .values({
        title: title || file.name,
        filePath: `/uploads/${filename}`,
        fileName: file.name,
        duration: "0:00", // Might want to implement this later
      })
      .returning();

    return NextResponse.json({ video });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

// For handling large files, add this config
export const config = {
  api: {
    bodyParser: false,
  },
};
