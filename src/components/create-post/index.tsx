"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Plus } from "lucide-react";
import { AccountSetSelection } from "@/components/create-post/account-set-selection";
import { PostDetails } from "@/components/create-post/post-details";
import { VideoUpload } from "@/components/create-post/video-upload";
import { Video } from "@/lib/drizzle/schema";
import { useRouter } from "next/navigation";

export function CreatePostDialog() {
  const [step, setStep] = useState<"upload" | "details" | "accounts">("upload");
  const [open, setOpen] = useState(false);
  const [video, setVideo] = useState<Video | null>(null);
  const [selectedAccountSets, setSelectedAccountSets] = useState<number[]>([]);
  const [scheduledDate, setScheduledDate] = useState<Date>(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  function resetForm() {
    setStep("upload");
    setVideo(null);
    setSelectedAccountSets([]);
    setScheduledDate(new Date());
    setIsSubmitting(false);
    router.refresh();
  }

  function handleClose() {
    setOpen(false);
    resetForm();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus className="mr-2 h-4 w-4" />
          Create Post
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {step === "upload" && "Upload Video"}
            {step === "details" && "Post Details"}
            {step === "accounts" && "Select Account Sets"}
          </DialogTitle>
        </DialogHeader>

        {step === "upload" && (
          <VideoUpload
            onVideoUploaded={(uploadedVideo) => {
              setVideo(uploadedVideo);
              setStep("details");
            }}
          />
        )}

        {step === "details" && video && (
          <PostDetails
            video={video}
            onBack={() => setStep("upload")}
            onNext={() => setStep("accounts")}
            scheduledDate={scheduledDate}
            onScheduledDateChange={setScheduledDate}
          />
        )}

        {step === "accounts" && video && (
          <AccountSetSelection
            video={video}
            scheduledDate={scheduledDate}
            selectedAccountSets={selectedAccountSets}
            onSelectedAccountSetsChange={setSelectedAccountSets}
            onBack={() => setStep("details")}
            onSubmit={handleClose}
            isSubmitting={isSubmitting}
            setIsSubmitting={setIsSubmitting}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
