export function toBase64(file: File, aspectRatio: number = 1) {
  let canvas = document.createElement("canvas");
  let ctx = canvas.getContext("2d");
  let img = document.createElement("img");
  img.setAttribute("src", URL.createObjectURL(file));

  return new Promise((resolve) => {
    img.onload = () => {
      let width, height;
      if (img.width < img.height) {
        width = img.width;
        height = width / aspectRatio;
      } else {
        height = img.height;
        width = height * aspectRatio;
      }

      canvas.setAttribute("width", width.toString());
      canvas.setAttribute("height", height.toString());

      if (ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(
          img,
          (img.width - width) / 2,
          (img.height - height) / 2,
          width,
          height,
          0,
          0,
          width,
          height,
        );
      }
      resolve(canvas.toDataURL(file.type, 0.9));
    };
  });
}

// Utility function to convert any file to base64
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

// Utility function to get file size in a readable format
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// Updated file size validation with increased limits
export function validateFileSize(
  file: File,
  type: "image" | "video" | "document",
): boolean {
  const limits = {
    image: 5 * 1024 * 1024, // 5MB
    video: 50 * 1024 * 1024, // 50MB for videos
    document: 10 * 1024 * 1024, // 10MB for documents
  };
  return file.size <= limits[type];
}

export function gamma(r: number, g: number, b: number) {
  return Math.pow(
    (Math.pow(r, 2.2) + Math.pow(1.5 * g, 2.2) + Math.pow(0.6 * b, 2.2)) /
      (1 + Math.pow(1.5, 2.2) + Math.pow(0.6, 2.2)),
    1 / 2.2,
  );
}
