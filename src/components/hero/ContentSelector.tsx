"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { ContentType, contentTypeAtom } from "@/lib/states";
import { useAtom } from "jotai";
import { UrlInput } from "./UrlInput";
import { FileUpload } from "./FileUpload";
import { ScanButton } from "@/components/ScanButton";

export function ContentSelector() {
  const [contentType, setContentType] = useAtom(contentTypeAtom);

  const handleTabChange = (value: string) => {
    setContentType(value as ContentType);
  };

  return (
    <div className="w-full">
      <Tabs
        value={contentType}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-4 mb-4">
          <TabsTrigger value="url">URL</TabsTrigger>
          <TabsTrigger value="image">Image</TabsTrigger>
          <TabsTrigger value="video">Video</TabsTrigger>
          <TabsTrigger value="document">Document</TabsTrigger>
        </TabsList>

        <TabsContent value="url">
          <div className="space-y-2">
            <Label className="flex justify-between text-sm font-medium">
              URL
              <div className="flex items-center gap-3">
                <ScanButton name="Scan" />
              </div>
            </Label>
            <UrlInput />
          </div>
        </TabsContent>

        <TabsContent value="image">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Upload Image</Label>
            <p className="text-xs text-muted-foreground mb-2">
              💡 Upload images up to 5MB. The QR code will contain a URL to
              access your image.
            </p>
            <FileUpload
              fileType="image"
              accept="image/*"
              maxSize={5 * 1024 * 1024} // 5MB
              placeholder="Click to upload an image or drag and drop"
            />
          </div>
        </TabsContent>

        <TabsContent value="video">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Upload Video</Label>
            <p className="text-xs text-muted-foreground mb-2">
              💡 Upload videos up to 50MB. The QR code will contain a URL to
              access your video.
            </p>
            <FileUpload
              fileType="video"
              accept="video/*"
              maxSize={50 * 1024 * 1024} // 50MB
              placeholder="Click to upload a video or drag and drop"
            />
          </div>
        </TabsContent>

        <TabsContent value="document">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Upload Document</Label>
            <p className="text-xs text-muted-foreground mb-2">
              💡 Upload documents up to 10MB. The QR code will contain a URL to
              access your document.
            </p>
            <FileUpload
              fileType="document"
              accept=".pdf,.doc,.docx,.txt,.rtf"
              maxSize={10 * 1024 * 1024} // 10MB
              placeholder="Click to upload a document or drag and drop"
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
