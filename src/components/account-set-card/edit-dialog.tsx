import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { AccountSet, NewAccount } from "@/lib/drizzle/schema";
import { numid } from "@/lib/utils";
import { updateAccountSet } from "@/app/actions/account-sets";
import { toast } from "sonner";

const PLATFORMS = ["YouTube", "TikTok", "Instagram"] as const;
type Platform = (typeof PLATFORMS)[number];

type EditDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accountSet: AccountSet & {
    accounts: Array<{
      id: number;
      platform: string;
      accountName: string;
      username: string;
      password: string;
    }>;
  };
  onUpdate: () => void;
};

export function EditAccountSetDialog({
  open,
  onOpenChange,
  accountSet,
  onUpdate,
}: EditDialogProps) {
  const [name, setName] = useState(accountSet.name);
  const [description, setDescription] = useState(accountSet.description ?? "");
  const [phone, setPhone] = useState(accountSet.phone ?? "");
  const [email, setEmail] = useState(accountSet.email ?? "");
  const [accounts, setAccounts] = useState<NewAccount[]>(
    accountSet.accounts.map((acc) => ({
      ...acc,
      accountSetId: accountSet.id,
    }))
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await updateAccountSet(
        accountSet.id,
        {
          name,
          description,
          phone,
          email,
        },
        accounts.map((acc) => ({
          id: acc.id,
          accountSetId: accountSet.id,
          platform: acc.platform as Platform,
          accountName: acc.accountName,
          username: acc.username,
          password: acc.password || "",
        }))
      );
      onUpdate();
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to update account set");
      console.error("Failed to update account set:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  function addAccount() {
    setAccounts([
      ...accounts,
      {
        id: numid(),
        accountSetId: accountSet.id,
        platform: "YouTube",
        accountName: "",
        username: "",
        password: "",
      },
    ]);
  }

  function removeAccount(index: number) {
    setAccounts(accounts.filter((_, i) => i !== index));
  }

  function updateAccount(index: number, field: string, value: string) {
    setAccounts(
      accounts.map((account, i) =>
        i === index ? { ...account, [field]: value } : account
      )
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Account Set</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-6">
          {/* Account Set Details */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Set Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Phone</label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          {/* Accounts */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Accounts</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addAccount}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Account
              </Button>
            </div>
            <div className="space-y-4">
              {accounts.map((account, index) => (
                <div
                  key={account.id}
                  className="relative rounded-lg border p-4"
                >
                  {accounts.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeAccount(index)}
                      className="absolute right-2 top-2 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium">Platform</label>
                      <select
                        value={account.platform}
                        onChange={(e) =>
                          updateAccount(index, "platform", e.target.value)
                        }
                        className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        {PLATFORMS.map((platform) => (
                          <option key={platform} value={platform}>
                            {platform}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">
                        Account Name
                      </label>
                      <Input
                        value={account.accountName}
                        onChange={(e) =>
                          updateAccount(index, "accountName", e.target.value)
                        }
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Username</label>
                      <Input
                        value={account.username}
                        onChange={(e) =>
                          updateAccount(index, "username", e.target.value)
                        }
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Password</label>
                      <Input
                        type="text"
                        value={account.password}
                        onChange={(e) =>
                          updateAccount(index, "password", e.target.value)
                        }
                        className="mt-1"
                        placeholder="Enter password"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
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
