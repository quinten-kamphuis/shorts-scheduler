import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { PostWithRelations } from "@/app/actions/posts";
import { useState } from "react";
import { updatePost } from "@/app/actions/posts";
import { toast } from "sonner";

type EditPostDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post: PostWithRelations;
};

export function EditPostDialog({
  open,
  onOpenChange,
  post,
}: EditPostDialogProps) {
  const [title, setTitle] = useState(post.video?.title ?? "");
  const [caption, setCaption] = useState(post.video?.caption ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await updatePost({
        id: post.id,
        videoId: post.video?.id,
        title,
        caption,
      });
      toast.success("Post updated successfully");
      onOpenChange(false);
    } catch {
      toast.error("Failed to update post");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Post</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Caption</label>
            <Textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="mt-1"
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
