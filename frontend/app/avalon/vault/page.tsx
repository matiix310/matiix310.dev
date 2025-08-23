"use client";

import { toast } from "sonner";
import { VaultEntry, getColumns } from "./columns";
import { DataTable } from "./data-table";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";
import AddDevice from "./AddVaultEntry";
import React from "react";
import { useFetchApiWithState } from "@/hooks/use-fetch-api";

export default function VaultEntrysScreen() {
  const [vault, setVault, updateVault] = useFetchApiWithState<VaultEntry[]>(
    "avalon/vault/entry",
    () => toast("Error fetching the vault (check that you are signed in).")
  );

  const handleOnNewVaultEntry = React.useCallback(
    (vaultEntry: VaultEntry) => {
      setVault((old) => [...(old ?? []), vaultEntry]);
    },
    [setVault]
  );

  const handleOnUpdate = React.useCallback(
    (vaultEntry: VaultEntry) => {
      setVault((old) => [
        ...(old?.filter((c) => c.id !== vaultEntry.id) ?? []),
        vaultEntry,
      ]);
    },
    [setVault]
  );

  const handleOnDelete = React.useCallback(
    (id: string) => {
      setVault((old) => old?.filter((c) => c.id !== id) ?? []);
    },
    [setVault]
  );

  const columns = React.useMemo(
    () => getColumns(handleOnUpdate, handleOnDelete),
    [handleOnUpdate, handleOnDelete]
  );

  return (
    <div className="m-4 grid gap-4">
      <div className="flex justify-between">
        <AddDevice onNewVaultEntry={handleOnNewVaultEntry} />
        <Button
          variant="ghost"
          onClick={() => {
            updateVault();
          }}
        >
          <RefreshCcw />
        </Button>
      </div>
      <DataTable columns={columns} data={vault ?? []} />
    </div>
  );
}
