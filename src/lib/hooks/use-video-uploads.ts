import { useState } from "react";
import type { Video } from "@/lib/drizzle/schema";

type UploadOptions = {
  onProgress?: (progress: number) => void;
  onSuccess?: (video: Video) => void;
  onError?: (error: Error) => void;
};

export function useVideoUpload() {
  const [isUploading, setIsUploading] = useState(false);

  async function uploadVideo(
    file: File,
    title?: string,
    options: UploadOptions = {}
  ) {
    const { onProgress, onSuccess, onError } = options;
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      if (title) {
        formData.append("title", title);
      }

      const xhr = new XMLHttpRequest();

      // Set up progress handling
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = event.loaded / event.total;
          onProgress(progress);
        }
      });

      // Create a promise to handle the upload
      const uploadPromise = new Promise<Video>((resolve, reject) => {
        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const response = JSON.parse(xhr.responseText);
            resolve(response.video);
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        });

        xhr.addEventListener("error", () => {
          reject(new Error("Upload failed"));
        });
      });

      // Start the upload
      xhr.open("POST", "/api/videos/upload");
      xhr.send(formData);

      // Wait for upload to complete
      const video = await uploadPromise;
      onSuccess?.(video);
      return video;
    } catch (error) {
      const uploadError =
        error instanceof Error ? error : new Error("Upload failed");
      onError?.(uploadError);
      throw uploadError;
    } finally {
      setIsUploading(false);
    }
  }

  return {
    uploadVideo,
    isUploading,
  };
}
