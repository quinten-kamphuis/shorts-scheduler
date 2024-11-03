import { markPosted, PostWithRelations } from "@/app/actions/posts";
import { getPlatformColor } from "@/lib/utils";
import { CheckCircle2, AlertCircle } from "lucide-react";

type PostListProps = {
  posts: PostWithRelations[];
  emptyMessage?: string;
};

export function PostList({
  posts,
  emptyMessage = "No posts found",
}: PostListProps) {
  async function togglePosted(postId: number, accountId: number) {
    "use server";
    await markPosted(postId, accountId);
  }

  if (posts.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-200 p-4">
        <p className="text-center text-sm text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {posts.map((post) => (
        <div key={post.id} className="rounded-lg border bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium">{post.video?.title}</span>
              <div className="mt-1 text-sm text-gray-500">
                {new Date(post.scheduledDate).toLocaleDateString("en-US", {
                  hour: "numeric",
                  minute: "numeric",
                })}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                {post.statuses.filter((s) => s.isPosted).length}/
                {post.statuses.length} posted
              </span>
            </div>
          </div>

          {/* Status grid for each account */}
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {post.statuses.map((status) => (
              <div
                key={status.id}
                className={`flex items-center justify-between rounded-md border p-2 ${
                  status.isPosted ? "bg-gray-50" : "bg-white"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getPlatformColor(
                      status.account.platform
                    )}`}
                  >
                    {status.account.platform}
                  </span>
                  <span className="text-sm">{status.account.accountName}</span>
                </div>

                <form
                  action={async () => {
                    await togglePosted(post.id, status.account.id);
                  }}
                >
                  <button
                    type="submit"
                    className={`rounded-full p-1 ${
                      status.isPosted
                        ? "bg-green-50 text-green-600 hover:bg-green-100"
                        : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                    }`}
                  >
                    {status.isPosted ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <AlertCircle className="h-5 w-5" />
                    )}
                  </button>
                </form>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
