"use client";

import { useState } from "react";
import { StatusGrid } from "./status-grid";
import { EditPostDialog } from "./edit-post-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { DeletePostDialog } from "./delete-post-dialog";
import { PostWithRelations } from "@/app/actions/posts";

type PostCardProps = {
  post: PostWithRelations;
};

export function PostCard({ post }: PostCardProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit Post
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDownload}>
                    <Download className="mr-2 h-4 w-4" />
                    Download Video
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setShowDeleteDialog(true)}
                    className="text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Post
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
