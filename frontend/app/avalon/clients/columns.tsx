"use client";

import { ColumnDef } from "@tanstack/react-table";

import EditClient from "./EditClient";

// TODO: use Zod types
export type Client = {
  id: string;
  name: string;
  kind: "web_extension" | "pam";
  createdAt: string;
  key?: string;
};

export function getColumns(
  onUpdate: (client: Client) => unknown,
  onDelete: (id: string) => unknown
): ColumnDef<Client>[] {
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
      accessorKey: "kind",
      header: "Kind",
    },
    {
      accessorKey: "createdAt",
      header: "Created at",
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const client = row.original as Client;
        return (
          <EditClient
            onDelete={() => onDelete(client.id)}
            onUpdate={onUpdate}
            client={client}
          />
        );
      },
    },
  ];
}
