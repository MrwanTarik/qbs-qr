import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";

export async function POST(request: NextRequest) {
  try {
    const { fileId, name, type, data } = await request.json();

    console.log(`[FILE STORE] Storing file: ${fileId} (${name})`);

    if (!fileId || !name || !type || !data) {
      console.log("[FILE STORE] Missing required fields");
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Convert base64 data to buffer
    const base64Data = data.split(",")[1];
    const buffer = Buffer.from(base64Data, "base64");

    // Store the file in Vercel Blob with metadata
    const blob = await put(`${fileId}.${name}`, buffer, {
      access: "public",
      contentType: type,
    });

    console.log(
      `[FILE STORE] Stored file ${fileId} (${name}) in Vercel Blob: ${blob.url}`,
    );

    return NextResponse.json({
      success: true,
      fileId,
      url: blob.url,
    });
  } catch (error) {
    console.error("[FILE STORE] Error storing file:", error);
    return NextResponse.json(
      { error: "Failed to store file" },
      { status: 500 },
    );
  }
}
