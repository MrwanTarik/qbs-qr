import { atom } from "jotai";
import { qrStyleList } from "@/lib/qr_style_list";

export type ContentType = "url" | "image" | "video" | "document";

export interface FileData {
  name: string;
  type: string;
  size: number;
  data: string; // base64 encoded data
  fileId?: string; // generated unique ID for the file
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
        : "https://qr-dun-xi.vercel.app"; // fallback to your known production URL
  }
}

// Generate a data URL for very small files, or a message for larger files
function generateFileContent(fileData: FileData): string {
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

  // For larger files, return a helpful message
  const baseUrl = getBaseUrl();
  return `File: ${fileData.name} (${(fileData.size / 1024).toFixed(1)}KB)\n\nThis file is too large to embed in a QR code. Please set up Vercel Blob storage for file hosting.\n\nVisit: ${baseUrl}`;
}

// Computed atom to get the current content for QR generation
export const qrContentAtom = atom((get) => {
  const contentType = get(contentTypeAtom);
  const url = get(urlAtom);
  const fileData = get(fileDataAtom);

  if (contentType === "url") {
    return url || getBaseUrl();
  } else if (fileData) {
    return generateFileContent(fileData);
  }

  return getBaseUrl();
});

export {};
