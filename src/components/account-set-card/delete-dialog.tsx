import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { deleteAccountSet } from "@/app/actions/account-sets";
import { AccountSet } from "@/lib/drizzle/schema";

type DeleteDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accountSet: AccountSet;
  onUpdate: () => void;
};

export function DeleteAccountSetDialog({
  open,
  onOpenChange,
  accountSet,
  onUpdate,
}: DeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    setIsDeleting(true);
    try {
      await deleteAccountSet(accountSet.id);
      onUpdate();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to delete account set:", error);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Account Set</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete &quot;{accountSet.name}&quot;? This
            action cannot be undone and will remove all associated data.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete Account Set"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
