"use client";

import { useRef, useState, useCallback } from "react";
import { useAtom } from "jotai";
import { Button } from "@/components/ui/button";
import { fileDataAtom } from "@/lib/states";
import {
  fileToBase64,
  formatFileSize,
  validateFileSize,
} from "@/lib/image_utils";
import { toast } from "sonner";
import {
  LucideUpload,
  LucideFile,
  LucideImage,
  LucideVideo,
  LucideX,
  LucideFileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  fileType: "image" | "video" | "document";
  accept: string;
  maxSize: number;
  placeholder: string;
}

export function FileUpload({
  fileType,
  accept,
  maxSize,
  placeholder,
}: FileUploadProps) {
  const [fileData, setFileData] = useAtom(fileDataAtom);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileIcon = () => {
    switch (fileType) {
      case "image":
        return <LucideImage className="w-6 h-6" />;
      case "video":
        return <LucideVideo className="w-6 h-6" />;
      case "document":
        return <LucideFileText className="w-6 h-6" />;
      default:
        return <LucideFile className="w-6 h-6" />;
    }
  };

  const handleFile = useCallback(
    async (file: File) => {
      setIsUploading(true);

      // Validate file type
      const isValidType = accept.split(",").some((type) => {
        if (type.startsWith(".")) {
          return file.name.toLowerCase().endsWith(type.toLowerCase());
        }
        return file.type.startsWith(type.replace("*", ""));
      });

      if (!isValidType) {
        toast.error(`Invalid file type. Please select a ${fileType} file.`);
        setIsUploading(false);
        return;
      }

      // Validate file size with updated limits
      if (!validateFileSize(file, fileType)) {
        toast.error(
          `File size too large. Maximum size is ${formatFileSize(maxSize)}.`,
        );
        setIsUploading(false);
        return;
      }

      try {
        const base64Data = await fileToBase64(file);

        // Generate a unique file ID
        const fileId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Upload to Vercel Blob storage
        const uploadResponse = await fetch("/api/store-file", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fileId,
            name: file.name,
            type: file.type,
            data: base64Data,
          }),
        });

        if (!uploadResponse.ok) {
          throw new Error("Failed to upload file to storage");
        }

        const uploadResult = await uploadResponse.json();

        setFileData({
          name: file.name,
          type: file.type,
          size: file.size,
          data: base64Data,
          fileId: fileId,
          fileUrl: uploadResult.url, // Store the Vercel Blob URL
        });

        // Different messaging based on file size and type
        if (
          fileType === "image" &&
          file.size < 1000 &&
          file.type === "text/plain"
        ) {
          toast.success(
            `Small text file uploaded! The text content will be embedded directly in the QR code.`,
          );
        } else {
          toast.success(
            `${fileType.charAt(0).toUpperCase() + fileType.slice(1)} uploaded successfully! The QR code will contain a URL to access your file.`,
            { duration: 6000 },
          );
        }
      } catch (error) {
        console.error("Error uploading file:", error);
        toast.error(`Failed to upload ${fileType}. Please try again.`);
      } finally {
        setIsUploading(false);
      }
    },
    [fileType, accept, maxSize, setFileData],
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile],
  );

  const handleRemoveFile = useCallback(() => {
    setFileData(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [setFileData]);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  if (fileData) {
    const isSmallTextFile =
      fileData.type === "text/plain" && fileData.size < 1000;

    return (
      <div className="border-2 border-dashed border-green-200 bg-green-50 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getFileIcon()}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {fileData.name}
              </p>
              <p className="text-sm text-gray-500">
                {formatFileSize(fileData.size)}
              </p>
              <p className="text-xs text-green-600">
                {isSmallTextFile
                  ? "✓ Text content will be embedded in QR code"
                  : "✓ QR code will contain a URL to access this file"}
              </p>
            </div>
          </div>
          <Button
            onClick={handleRemoveFile}
            variant="ghost"
            size="sm"
            className="text-red-500 hover:text-red-700"
          >
            <LucideX className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
      />

      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
          "hover:border-primary hover:bg-accent/50",
          isDragOver ? "border-primary bg-accent/50" : "border-gray-300",
          isUploading && "pointer-events-none opacity-50",
        )}
      >
        <div className="flex flex-col items-center space-y-4">
          {isUploading ? (
            <>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="text-sm text-gray-600">Uploading...</p>
            </>
          ) : (
            <>
              <div className="flex items-center space-x-2 text-gray-400">
                <LucideUpload className="w-8 h-8" />
                {getFileIcon()}
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-900">
                  {placeholder}
                </p>
                <p className="text-xs text-gray-500">
                  Maximum size: {formatFileSize(maxSize)}
                </p>
                <p className="text-xs text-blue-600">
                  Files will be given a shareable URL for the QR code
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
