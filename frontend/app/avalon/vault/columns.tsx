"use vaultEntry";

import { ColumnDef } from "@tanstack/react-table";

import EditVaultEntry from "./EditVaultEntry";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useFetchApi } from "@/hooks/use-fetch-api";

// TODO: use Zod types
export type VaultEntry = {
  id: string;
  name: string;
  uriRegex: string;
  kind: "username" | "email" | "password";
  content?: string;
  group: number;
  createdAt: string;
};

export function getColumns(
  onUpdate: (vaultEntry: VaultEntry) => unknown,
  onDelete: (id: string) => unknown
): ColumnDef<VaultEntry>[] {
  return [
    {
      accessorKey: "id",
      header: "ID",
    },
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "uriRegex",
      header: "URI Regex",
    },
    {
      accessorKey: "kind",
      header: "Kind",
    },
    {
      accessorKey: "content",
      header: "Content",
      cell: ({ row }) => {
        const vaultEntry = row.original as VaultEntry;

        <VaultContent vaultEntry={vaultEntry} onUpdate={onUpdate} />;
      },
    },
    {
      accessorKey: "group",
      header: "Group",
    },
    {
      accessorKey: "createdAt",
      header: "Created at",
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const vaultEntry = row.original as VaultEntry;
        return (
          <EditVaultEntry
            onDelete={() => onDelete(vaultEntry.id)}
            onUpdate={onUpdate}
            vaultEntry={vaultEntry}
          />
        );
      },
    },
  ];
}

const VaultContent = ({
  vaultEntry,
  onUpdate,
}: {
  vaultEntry: VaultEntry;
  onUpdate: (vaultEntry: VaultEntry) => unknown;
}) => {
  const fetchApi = useFetchApi();
  const [visible, setVisible] = useState(false);

  const handleVisibilityChange = async () => {
    if (visible) {
      setVisible(false);
      return;
    }

    if (vaultEntry.content !== undefined) {
      setVisible(true);
      return;
    }

    fetchApi(`avalon/vault/content/${vaultEntry.id}`, async (res) => {
      if (res.status !== 200) return;

      const { content } = await res.json();
      onUpdate({ ...vaultEntry, content });
      setVisible(true);
    });
  };

  return (
    <div className="flex items-center">
      <p className="mr-1">{visible ? vaultEntry.content : "*".repeat(7)}</p>
      <Button variant="ghost" onClick={handleVisibilityChange}>
        {visible ? <EyeOff /> : <Eye />}
      </Button>
    </div>
  );
};
