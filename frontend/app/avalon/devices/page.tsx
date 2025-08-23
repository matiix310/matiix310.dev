"use client";

import { toast } from "sonner";
import { Client, Device, getColumns } from "./columns";
import { DataTable } from "./data-table";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";
import AddDevice from "./AddDevice";
import { useCallback, useMemo } from "react";
import { useFetchApiWithState } from "@/hooks/use-fetch-api";

export default function DevicesScreen() {
  const [data, setData, updateData] = useFetchApiWithState<Device[]>(
    "avalon/devices",
    () => toast("Error fetching devices (check that you are signed in).")
  );
  const [clients, , updateClients] = useFetchApiWithState<Client[]>(
    "avalon/clients",
    () => toast("Error fetching clients (check that you are signed in).")
  );

  const handleOnNewDevice = useCallback(
    (device: Device) => {
      setData((old) => [...(old ?? []), device]);
      // toast the private key
      if (device.key) {
        const privateKey = device.key;
        toast("Private key", {
          description: `For device: ${device.name}`,
          action: {
            label: "Copy",
            onClick: () => {
              navigator.clipboard.writeText(privateKey);
            },
          },
        });
      }
    },
    [setData]
  );

  const handleOnUpdate = useCallback(
    (device: Device) => {
      setData((old) => [...(old?.filter((c) => c.id !== device.id) ?? []), device]);
    },
    [setData]
  );

  const handleOnDelete = useCallback(
    (id: string) => {
      setData((old) => old?.filter((c) => c.id !== id) ?? []);
    },
    [setData]
  );

  const columns = useMemo(
    () => getColumns(handleOnUpdate, handleOnDelete),
    [handleOnUpdate, handleOnDelete]
  );

  return (
    <div className="m-4 grid gap-4">
      <div className="flex justify-between">
        <AddDevice availableClients={clients ?? []} onNewDevice={handleOnNewDevice} />
        <Button
          variant="ghost"
          onClick={() => {
            updateData();
            updateClients();
          }}
        >
          <RefreshCcw />
        </Button>
      </div>
      <DataTable
        columns={columns}
        data={(data ?? []).map((d) => ({ ...d, availableClients: clients ?? [] }))}
      />
    </div>
  );
}
