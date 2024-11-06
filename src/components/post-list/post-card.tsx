"use client";

import { useState } from "react";
import { StatusGrid } from "./status-grid";
import { EditPostDialog } from "./edit-post-dialog";
import { Button } from "@/components/ui/button";
import { Download, Eye, Pencil, Trash2 } from "lucide-react";
import { DeletePostDialog } from "./delete-post-dialog";
import { PostWithRelations } from "@/app/actions/posts";
import { PreviewVideoDialog } from "@/components/post-list/preview-video-dialog";

type PostCardProps = {
  post: PostWithRelations;
};

export function PostCard({ post }: PostCardProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);

  async function handleDownload() {
    // Create a link and trigger download
    const link = document.createElement("a");
    link.href = post.video?.filePath ?? "";
    link.download = post.video?.title ?? "video";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const completedCount = post.statuses.filter((s) => s.isPosted).length;

  return (
    <>
      <div className="rounded-lg border bg-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{post.video?.title}</span>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowPreviewDialog(true)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowEditDialog(true)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={handleDownload}>
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {post.video?.caption && (
              <p className="mt-1 text-sm text-gray-500">{post.video.caption}</p>
            )}
            <div className="mt-1 flex items-center gap-4 text-sm text-gray-500">
              <span>
                {new Date(post.scheduledDate).toLocaleDateString("en-US", {
                  hour: "numeric",
                  minute: "numeric",
                })}
              </span>
              <span>
                {completedCount}/{post.statuses.length} posted
              </span>
            </div>
          </div>
        </div>

        <StatusGrid post={post} />
      </div>

      <PreviewVideoDialog
        open={showPreviewDialog}
        onOpenChange={setShowPreviewDialog}
        post={post}
      />

      <EditPostDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        post={post}
      />

      <DeletePostDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        post={post}
      />
    </>
  );
}
