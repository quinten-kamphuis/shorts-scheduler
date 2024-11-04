import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import {
  AccountSetWithAccounts,
  getAllAccountSets,
} from "@/app/actions/account-sets";
import { createPost } from "@/app/actions/posts";
import { Video } from "@/lib/drizzle/schema";
import { toast } from "sonner";

type AccountSetSelectionProps = {
  video: Video;
  scheduledDate: Date;
  selectedAccountSets: number[];
  onSelectedAccountSetsChange: (ids: number[]) => void;
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  setIsSubmitting: (value: boolean) => void;
};

export function AccountSetSelection({
  video,
  scheduledDate,
  selectedAccountSets,
  onSelectedAccountSetsChange,
  onBack,
  onSubmit,
  isSubmitting,
  setIsSubmitting,
}: AccountSetSelectionProps) {
  const [accountSets, setAccountSets] = useState<AccountSetWithAccounts[]>([]);

  useEffect(() => {
    getAllAccountSets().then(setAccountSets);
  }, []);

  async function handleSubmit() {
    setIsSubmitting(true);
    try {
      // Create a post for each selected account set
      await Promise.all(
        selectedAccountSets.map((accountSetId) =>
          createPost({
            videoId: video.id,
            accountSetId,
            scheduledDate,
          })
        )
      );
      onSubmit();
    } catch (error) {
      toast.error("Failed to create posts.");
      console.error("Failed to create posts:", error);
      // Add error handling
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        {accountSets.map((set) => {
          const isSelected = selectedAccountSets.includes(set.id);
          return (
            <button
              key={set.id}
              onClick={() => {
                onSelectedAccountSetsChange(
                  isSelected
                    ? selectedAccountSets.filter((id) => id !== set.id)
                    : [...selectedAccountSets, set.id]
                );
              }}
              className={`flex items-start justify-between rounded-lg border p-4 text-left hover:bg-gray-50 ${
                isSelected ? "border-blue-500 bg-blue-50" : ""
              }`}
            >
              <div>
                <h3 className="font-medium">{set.name}</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {set.accounts.length} accounts
                </p>
              </div>
              {isSelected && <CheckCircle2 className="h-5 w-5 text-blue-500" />}
            </button>
          );
        })}
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={selectedAccountSets.length === 0 || isSubmitting}
        >
          {isSubmitting
            ? "Creating Posts..."
            : `Create ${
                selectedAccountSets.length > 0
                  ? `${selectedAccountSets.length} Posts`
                  : "Posts"
              }`}
        </Button>
      </div>
    </div>
  );
}
