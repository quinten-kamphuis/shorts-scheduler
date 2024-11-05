import { useState } from "react";
import { Edit2, Trash2, MoreVertical, Copy } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EditAccountSetDialog } from "./edit-dialog";
import { DeleteAccountSetDialog } from "./delete-dialog";
import { cn, getPlatformColor, getPlatformIcon } from "@/lib/utils";
import { useRouter } from "next/navigation";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AccountSetWithAccounts } from "@/app/actions/account-sets";

type AccountSetCardProps = {
  accountSet: AccountSetWithAccounts;
  minimized?: boolean;
};

export function AccountSetCard({ accountSet, minimized }: AccountSetCardProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const router = useRouter();

  function onUpdate() {
    router.refresh();
  }

  const AccountSetCardHeader = ({
    accountSet,
  }: {
    accountSet: AccountSetWithAccounts;
  }) => {
    return (
      <div className="flex items-center justify-between">
        <h3 className="font-medium">{accountSet.name}</h3>
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger>
              <span
                className={cn(
                  "rounded-full px-2 py-1 text-xs",
                  accountSet.accounts.length < 3
                    ? "bg-orange-50 text-orange-600"
                    : "bg-blue-50 text-blue-600"
                )}
              >
                {accountSet.accounts.length} / 3 accounts
              </span>
            </TooltipTrigger>
            <TooltipContent>
              You should have at least 3 accounts in a set
            </TooltipContent>
          </Tooltip>
          <DropdownMenu>
            <DropdownMenuTrigger className="rounded-full p-1 hover:bg-gray-100">
              <MoreVertical className="h-4 w-4 text-gray-500" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
                <Edit2 className="mr-2 h-4 w-4" />
                Edit Set
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowDeleteDialog(true)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Set
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  };

  if (minimized) {
    return (
      <div className="flex flex-col gap-4 rounded-lg border bg-white p-4 shadow-sm">
        <AccountSetCardHeader accountSet={accountSet} />
        <div className="flex flex-col gap-2">
          {accountSet.accounts.map((account) => (
            <div key={account.id} className="flex items-center gap-2">
              <span
                className={cn(
                  "inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium",
                  getPlatformColor(account.platform)
                )}
              >
                {getPlatformIcon(account.platform)}
                {account.platform}
              </span>
              <span className="text-sm font-medium ml-auto">
                {account.accountName}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="relative rounded-lg border bg-white p-4 shadow-sm">
        {/* Header */}
        <AccountSetCardHeader accountSet={accountSet} />

        {/* Description if exists */}
        {accountSet.description && (
          <p className="mt-1 text-sm text-gray-600">{accountSet.description}</p>
        )}

        {/* Phone and email if exists */}
        <div className="mt-1 flex items-center gap-4 text-sm text-gray-500">
          {accountSet.phone && (
            <span>
              <span className="mr-1">📞</span>
              {accountSet.phone}
            </span>
          )}
          {accountSet.email && (
            <span>
              <span className="mr-1">📧</span>
              {accountSet.email}
            </span>
          )}
        </div>

        {/* Email password if exists */}
        {accountSet.emailPassword && (
          <div className="mt-1 flex items-center gap-4 text-sm text-gray-500">
            <span>
              <span className="mr-1">🔑</span>
              {accountSet.emailPassword}
            </span>
          </div>
        )}

        {/* Accounts List */}
        <div className="mt-4 space-y-2">
          {accountSet.accounts.map((account) => (
            <div
              key={account.id}
              className="flex flex-col rounded-md border bg-gray-50 p-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium",
                      getPlatformColor(account.platform)
                    )}
                  >
                    {getPlatformIcon(account.platform)}
                    {account.platform}
                  </span>
                  <span className="text-sm font-medium">
                    {account.accountName}
                  </span>
                </div>
              </div>
              <div className="mt-2 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    Username: {account.username}
                  </span>
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(account.username);
                      toast.success("Username copied to clipboard");
                    }}
                    className="rounded p-1 hover:bg-gray-200"
                    title="Copy username"
                    size="icon"
                    variant="outline"
                  >
                    <Copy className="h-4 w-4 text-gray-500" />
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    Password: {account.password}
                  </span>
                  <Button
                    onClick={() =>
                      navigator.clipboard.writeText(account.password)
                    }
                    className="rounded p-1 hover:bg-gray-200"
                    title="Copy password"
                    size="icon"
                    variant="outline"
                  >
                    <Copy className="h-4 w-4 text-gray-500" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <EditAccountSetDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        accountSet={accountSet}
        onUpdate={onUpdate}
      />

      <DeleteAccountSetDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        accountSet={accountSet}
        onUpdate={onUpdate}
      />
    </>
  );
}
