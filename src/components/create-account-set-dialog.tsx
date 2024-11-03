"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createAccountSet } from "@/app/actions/account-sets";
import { NewAccount, type Account } from "@/lib/drizzle/schema";
import { numid } from "@/lib/utils";
import { toast } from "sonner";

const PLATFORMS = ["YouTube", "TikTok", "Instagram"] as const;
type Platform = (typeof PLATFORMS)[number];

const emptyAccount: NewAccount = {
  id: numid(),
  accountSetId: 0,
  platform: "YouTube",
  accountName: "",
  username: "",
  password: "",
  notes: null,
};

type Props = {
  trigger?: React.ReactNode;
};

export function CreateAccountSetDialog({ trigger }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [accounts, setAccounts] = useState<NewAccount[]>([{ ...emptyAccount }]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (
      !name ||
      accounts.some((acc) => !acc.accountName || !acc.username || !acc.password)
    ) {
      toast.error("Please fill out all fields");
      return; // Add error handling
    }

    try {
      await createAccountSet(
        {
          id: numid(),
          name,
          description,
        },
        accounts
      );

      // Reset form
      setName("");
      setDescription("");
      setAccounts([{ ...emptyAccount }]);
      setOpen(false);
    } catch (error) {
      console.error("Failed to create account set:", error);
      // Add error handling
    }
  }

  function addAccount() {
    setAccounts([...accounts, { ...emptyAccount }]);
  }

  function removeAccount(index: number) {
    setAccounts(accounts.filter((_, i) => i !== index));
  }

  function updateAccount(index: number, field: keyof Account, value: string) {
    setAccounts(
      accounts.map((account, i) =>
        i === index ? { ...account, [field]: value } : account
      )
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ? (
          trigger
        ) : (
          <Button id="create-account-set-trigger" variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Add Account Set
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Account Set</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-6">
          {/* Account Set Details */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Set Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Gaming Channels"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description"
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
                <div key={index} className="relative rounded-lg border p-4">
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
                          updateAccount(
                            index,
                            "platform",
                            e.target.value as Platform
                          )
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
                        placeholder="Account display name"
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
                        placeholder="Login username"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Password</label>
                      <Input
                        type="password"
                        value={account.password}
                        onChange={(e) =>
                          updateAccount(index, "password", e.target.value)
                        }
                        placeholder="Login password"
                        className="mt-1"
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
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Create Account Set</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
