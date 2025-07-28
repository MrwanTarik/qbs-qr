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
      limit: 1,
    });

    console.log(
      `[FILE SERVE] Found ${blobs.length} blobs with prefix ${fileId}`,
    );

    if (blobs.length === 0) {
      console.log(`[FILE SERVE] File not found: ${fileId}`);
      return new NextResponse(`File not found: ${fileId}`, { status: 404 });
    }

    const blob = blobs[0];
    console.log(`[FILE SERVE] Found blob: ${blob.pathname} -> ${blob.url}`);

    // Redirect to the Vercel Blob URL
    return NextResponse.redirect(blob.url);
  } catch (error) {
    console.error("[FILE SERVE] Error serving file:", error);
    return new NextResponse("Error serving file", { status: 500 });
  }
}
