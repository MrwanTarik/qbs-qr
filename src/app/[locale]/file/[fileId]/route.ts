import { NextRequest, NextResponse } from "next/server";
import { list } from "@vercel/blob";

export async function GET(
  request: NextRequest,
  { params }: { params: { fileId: string } },
) {
  const fileId = params.fileId;

  console.log(`[FILE SERVE] Attempting to serve file: ${fileId}`);

  try {
    // List blobs to find our file
    const { blobs } = await list({
      prefix: fileId,
      limit: 10, // Increased limit to catch multiple matches
    });

    console.log(
      `[FILE SERVE] Found ${blobs.length} blobs with prefix ${fileId}`,
    );

    if (blobs.length === 0) {
      console.log(`[FILE SERVE] File not found: ${fileId}`);
      return new NextResponse(`File not found: ${fileId}`, { status: 404 });
    }

    // Find exact match or closest match
    let blob =
      blobs.find((b) => b.pathname.startsWith(fileId + ".")) || blobs[0];
    console.log(`[FILE SERVE] Using blob: ${blob.pathname} -> ${blob.url}`);

    // Redirect to the Vercel Blob URL
    return NextResponse.redirect(blob.url);
  } catch (error) {
    console.error("[FILE SERVE] Error serving file:", error);

    // Check if it's an authentication error
    if (
      error instanceof Error &&
      error.message.includes("BLOB_READ_WRITE_TOKEN")
    ) {
      console.error("[FILE SERVE] Vercel Blob token not configured properly");
      return new NextResponse("Storage not configured", { status: 500 });
    }

    return new NextResponse("Error serving file", { status: 500 });
  }
}
