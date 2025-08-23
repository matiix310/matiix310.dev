"use client";

import { toast } from "sonner";
import { Client, getColumns } from "./columns";
import { DataTable } from "./data-table";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";
import AddDevice from "./AddClient";
import { useCallback, useMemo } from "react";
import { useFetchApiWithState } from "@/hooks/use-fetch-api";

export default function ClientsScreen() {
  const [clients, setClients, updateClients] = useFetchApiWithState<Client[]>(
    "avalon/clients",
    () => toast("Error fetching clients (check that you are signed in).")
  );

  const handleOnNewClient = useCallback(
    (client: Client) => {
      setClients((old) => [...(old ?? []), client]);
      // toast the private key
      if (client.key) {
        const privateKey = client.key;
        toast("Copy your private key", {
          description: client.name,
          action: {
            label: "Copy",
            onClick: () => {
              navigator.clipboard.writeText(privateKey);
            },
          },
        });
      }
    },
    [setClients]
  );

  const handleOnUpdate = useCallback(
    (client: Client) => {
      setClients((old) => [...(old?.filter((c) => c.id !== client.id) ?? []), client]);
    },
    [setClients]
  );

  const handleOnDelete = useCallback(
    (id: string) => {
      setClients((old) => old?.filter((c) => c.id !== id) ?? []);
    },
    [setClients]
  );

  const columns = useMemo(
    () => getColumns(handleOnUpdate, handleOnDelete),
    [handleOnUpdate, handleOnDelete]
  );

  return (
    <div className="m-4 grid gap-4">
      <div className="flex justify-between">
        <AddDevice onNewClient={handleOnNewClient} />
        <Button
          variant="ghost"
          onClick={() => {
            updateClients();
          }}
        >
          <RefreshCcw />
        </Button>
      </div>
      <DataTable columns={columns} data={clients ?? []} />
    </div>
  );
}
