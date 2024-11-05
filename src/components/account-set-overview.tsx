"use client";

import { AccountSetWithAccounts } from "@/app/actions/account-sets";
import { AccountSetCard } from "@/components/account-set-card";
import { CreateAccountSetDialog } from "@/components/create-account-set-dialog";
import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";
import { useState } from "react";

type Props = {
  accountSets: AccountSetWithAccounts[];
};

export const AccountSetOverview = ({ accountSets }: Props) => {
  const [minimized, setMinimized] = useState(false);

  return (
    <div className="mb-8">
      <div className="flex items-center gap-4 mb-4">
        <Button
          onClick={() => setMinimized(!minimized)}
          className="rounded-full p-1"
          size="icon"
          variant="outline"
        >
          {minimized ? (
            <Plus className="h-5 w-5" />
          ) : (
            <Minus className="h-5 w-5" />
          )}
        </Button>
        <h2 className="text-lg font-medium">Account Sets</h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {accountSets.map((set) => (
          <AccountSetCard key={set.id} accountSet={set} minimized={minimized} />
        ))}
        <CreateAccountSetDialog
          trigger={
            <button className="flex h-full min-h-[120px] items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-white p-4 text-gray-500 hover:border-gray-300 hover:bg-gray-50">
              <div className="flex flex-col items-center gap-1">
                <Plus className="h-5 w-5" />
                <span className="text-sm">Add Account Set</span>
              </div>
            </button>
          }
        />
      </div>
    </div>
  );
};
