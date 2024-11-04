import { useState, useRef } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useVideoUpload } from "@/lib/hooks/use-video-uploads";
import { Video } from "@/lib/drizzle/schema";
import { toast } from "sonner";

type VideoUploadProps = {
  onVideoUploaded: (video: Video) => void;
};

export function VideoUpload({ onVideoUploaded }: VideoUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { uploadVideo, isUploading } = useVideoUpload();
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(file: File) {
    if (!file || !file.type.startsWith("video/")) {
      toast.error("Invalid file type. Please upload a video file.");
      return;
    }

    try {
      await uploadVideo(file, file.name, {
        onProgress: (progress) => {
          setUploadProgress(Math.round(progress * 100));
        },
        onSuccess: (video) => {
          onVideoUploaded(video);
          setUploadProgress(0);
        },
        onError: (error) => {
          toast.error("Upload failed.");
          console.error("Upload failed:", error);
          setUploadProgress(0);
        },
      });
    } catch (error) {
      toast.error("Upload failed.");
      console.error("Upload failed:", error);
    }
  }

  return (
    <div
      className={`relative rounded-lg border-2 border-dashed p-12 text-center ${
        isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFileChange(file);
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileChange(file);
        }}
      />

      <div className="flex flex-col items-center">
        <Upload className="mb-4 h-12 w-12 text-gray-400" />
        <p className="mb-2 text-lg font-medium">Drag and drop video here</p>
        <p className="mb-4 text-sm text-gray-500">or</p>
        <Button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
        >
          Browse Files
        </Button>
        {isUploading && (
          <div className="mt-4">
            <div className="mb-2">
              <span className="text-sm font-medium">
                {uploadProgress}% uploaded
              </span>
            </div>
            <div className="h-2 w-64 rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-blue-500 transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
