import { PostWithRelations, toggleIsPosted } from "@/app/actions/posts";
import { getPlatformColor, getPlatformIcon } from "@/lib/utils";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

type StatusGridProps = {
  post: PostWithRelations;
};

export function StatusGrid({ post }: StatusGridProps) {
  const router = useRouter();

  async function toggleStatus(accountId: number) {
    await toggleIsPosted(post.id, accountId);
    router.refresh();
  }

  // console.log(post.statuses);

  return (
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
              {getPlatformIcon(status.account.platform)}
            </span>
            <span className="text-sm">{status.account.accountName}</span>
          </div>

          <button
            onClick={() => {
              toggleStatus(status.account.id);
            }}
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
        </div>
      ))}
    </div>
  );
}
