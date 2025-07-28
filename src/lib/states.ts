import { atom } from "jotai";
import { qrStyleList } from "@/lib/qr_style_list";

export type ContentType = "url" | "image" | "video" | "document";

export interface FileData {
  name: string;
  type: string;
  size: number;
  data: string; // base64 encoded data
  fileId?: string; // generated unique ID for the file
  fileUrl?: string; // URL to the file in Vercel Blob storage
}

export const urlAtom = atom<string>("");
export const contentTypeAtom = atom<ContentType>("url");
export const fileDataAtom = atom<FileData | null>(null);

// Get the current base URL dynamically
function getBaseUrl(): string {
  if (typeof window !== "undefined") {
    // Client-side: use window.location
    return window.location.origin;
  } else {
    // Server-side: check if we're in development
    if (process.env.NODE_ENV === "development") {
      return "http://localhost:8007";
    }
    // Production: use environment variables or fallback
    return process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXT_PUBLIC_VERCEL_URL
        ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
        : "https://qbs-qr-test.vercel.app"; // fallback to your known production URL
  }
}

// Generate a data URL for very small files, or a message for larger files
function generateFileContent(fileData: FileData): string {
  // If we have a file URL from Vercel Blob, use that
  if (fileData.fileUrl) {
    return fileData.fileUrl;
  }

  // For very small files (under 2KB), we can embed them directly
  if (fileData.size < 2048) {
    // For text files, return the decoded text
    if (fileData.type === "text/plain") {
      try {
        const base64Data = fileData.data.split(",")[1];
        const textContent = atob(base64Data);
        return textContent;
      } catch {
        // If decoding fails, fall back to data URL
      }
    }

    // For small images, return the data URL directly
    if (fileData.type.startsWith("image/")) {
      return fileData.data;
    }
  }

  // For larger files without a URL, generate a local file URL
  if (fileData.fileId) {
    const baseUrl = getBaseUrl();
    return `${baseUrl}/file/${fileData.fileId}`;
  }

  // Fallback: return a helpful message
  const baseUrl = getBaseUrl();
  return `File: ${fileData.name} (${(fileData.size / 1024).toFixed(1)}KB)\n\nProcessing file upload...\n\nVisit: ${baseUrl}`;
}

// Computed atom to get the current content for QR generation
export const qrContentAtom = atom((get) => {
  const contentType = get(contentTypeAtom);
  const url = get(urlAtom);
  const fileData = get(fileDataAtom);

  console.log("🔍 QR Content Debug:", {
    contentType,
    url,
    hasFileData: !!fileData,
    fileData: fileData
      ? {
          name: fileData.name,
          size: fileData.size,
          hasFileUrl: !!fileData.fileUrl,
          hasFileId: !!fileData.fileId,
        }
      : null,
  });

  if (contentType === "url") {
    const result = url || getBaseUrl();
    console.log("🔍 QR Content (URL mode):", result);
    return result;
  } else if (fileData) {
    const result = generateFileContent(fileData);
    console.log("🔍 QR Content (File mode):", result);
    return result;
  }

  const fallback = getBaseUrl();
  console.log("🔍 QR Content (Fallback):", fallback);
  return fallback;
});

export {};
