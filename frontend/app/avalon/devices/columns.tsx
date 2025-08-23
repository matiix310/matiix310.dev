"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Check, X } from "lucide-react";

import EditDevice from "./EditDevice";

// TODO: use Zod types
export type Device = {
  id: string;
  name: string;
  kind: "computer" | "laptop" | "phone";
  createdAt: string;
  fcmToken?: string;
  clients: string[];
  key?: string;
};

export type Client = {
  id: string;
  name: string;
};

export function getColumns(
  onUpdate: (device: Device) => unknown,
  onDelete: (id: string) => unknown
): ColumnDef<Device & { availableClients: Client[] }>[] {
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
      accessorKey: "fcmToken",
      header: "FCM",
      cell: ({ getValue }) => {
        const fcmToken = getValue() as Device["fcmToken"];
        return fcmToken !== undefined ? <Check /> : <X />;
      },
    },
    {
      accessorKey: "clients",
      header: "Clients",
      cell: ({ getValue }) => {
        const clients = getValue() as Device["clients"];
        return clients.length;
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created at",
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const device = row.original as Device & { availableClients: Client[] };
        return (
          <EditDevice
            onDelete={() => onDelete(device.id)}
            onUpdate={onUpdate}
            device={device}
          />
        );
      },
    },
  ];
}
