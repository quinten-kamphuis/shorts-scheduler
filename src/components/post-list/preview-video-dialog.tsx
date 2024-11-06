import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PostWithRelations } from "@/app/actions/posts";

type Props = {
  post: PostWithRelations;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const PreviewVideoDialog = ({ post, open, onOpenChange }: Props) => {
  const video = post.video;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Video Preview</DialogTitle>
          <DialogDescription>Preview the selected video</DialogDescription>
        </DialogHeader>
        <video src={video?.filePath} controls />
      </DialogContent>
    </Dialog>
  );
};
