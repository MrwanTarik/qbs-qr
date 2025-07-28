import { NextRequest, NextResponse } from "next/server";
import { list } from "@vercel/blob";

export async function GET(request: NextRequest) {
  try {
    console.log("[BLOB TEST] Testing Vercel Blob configuration...");

    // Try to list existing blobs
    const { blobs } = await list({ limit: 5 });

    console.log(
      `[BLOB TEST] Successfully connected. Found ${blobs.length} blobs.`,
    );

    return NextResponse.json({
      success: true,
      message: "Vercel Blob is configured correctly",
      blobCount: blobs.length,
      blobs: blobs.map((b) => ({ pathname: b.pathname, size: b.size })),
    });
  } catch (error) {
    console.error("[BLOB TEST] Error testing Vercel Blob:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        message:
          "Vercel Blob configuration error. Check BLOB_READ_WRITE_TOKEN environment variable.",
      },
      { status: 500 },
    );
  }
}
