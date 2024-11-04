import { PostWithRelations } from "@/app/actions/posts";
import { PostCard } from "./post-card";

type PostListProps = {
  posts: PostWithRelations[];
  emptyMessage?: string;
};

export function PostList({
  posts,
  emptyMessage = "No posts found",
}: PostListProps) {
  if (posts.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-200 p-4">
        <p className="text-center text-sm text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
