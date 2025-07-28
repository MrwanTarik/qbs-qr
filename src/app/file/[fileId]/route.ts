import { NextRequest, NextResponse } from "next/server";

// Simple in-memory storage (in production, use Redis, database, or cloud storage)
const globalFileStorage = new Map<
  string,
  {
    name: string;
    type: string;
    data: string;
    uploadedAt: Date;
  }
>();

// Make storage globally accessible
if (typeof global !== "undefined") {
  (global as any).fileStorage = globalFileStorage;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { fileId: string } },
) {
  const fileId = params.fileId;

  // Get file from global storage
  const storage = (global as any).fileStorage || globalFileStorage;
  const fileData = storage.get(fileId);

  if (!fileData) {
    return new NextResponse("File not found", { status: 404 });
  }

  try {
    // Convert base64 data back to binary
    const base64Data = fileData.data.split(",")[1];
    const buffer = Buffer.from(base64Data, "base64");

    // Return the file with proper headers
    return new NextResponse(buffer as any, {
      status: 200,
      headers: {
        "Content-Type": fileData.type,
        "Content-Disposition": `inline; filename="${fileData.name}"`,
        "Cache-Control": "public, max-age=31536000",
      },
    });
  } catch (error) {
    console.error("Error serving file:", error);
    return new NextResponse("Error serving file", { status: 500 });
  }
}
