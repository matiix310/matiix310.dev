"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  ClockAlert,
  LucideIcon,
  MessageCircleQuestionMark,
  X,
} from "lucide-react";
import { HoverCard, HoverCardTrigger } from "@/components/ui/hover-card";

// TODO: use Zod types
export type AvalonLog = {
  id: string;
  device?: {
    id: string;
    name: string;
    kind: "computer" | "laptop" | "phone";
  };
  client: {
    id: string;
    name: string;
    kind: "pam" | "web_extension";
  };
  answer?: boolean;
  kind: "request" | "answer" | "timeout";
  createdAt: string;
};

export const columns: ColumnDef<AvalonLog>[] = [
  {
    accessorKey: "client",
    header: "Client",
    cell: ({ row }) => {
      const client = row.getValue("client") as AvalonLog["client"];
      return client.name;
    },
  },
  {
    accessorKey: "kind",
    header: "Kind",
    cell: ({ row }) => {
      const log = row.original as AvalonLog;

      if (log.kind === "timeout") return createTag(ClockAlert, "Timeout", "destructive");

      if (log.kind === "request")
        return createTag(MessageCircleQuestionMark, "Request", "warning");

      if (log.kind === "answer") {
        console.log(row.original);
        return log.answer
          ? createTag(Check, `Accepted by ${log.device!.name}`, "success")
          : createTag(X, `Rejected by ${log.device!.name}`, "destructive");
      }
    },
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => {
      const createdAt = row.getValue("createdAt") as AvalonLog["createdAt"];
      const date = new Date(createdAt);

      const formattedDate = new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
      }).format(date);

      const formattedTime = new Intl.DateTimeFormat("en-US", {
        timeStyle: "medium",
      }).format(date);

      return (
        <HoverCard>
          <HoverCardTrigger>
            {formattedDate}
            <span className="opacity-50"> {formattedTime}</span>
          </HoverCardTrigger>
          {/* <HoverCardContent side="right" className="w-fit text-sm px-2 py-1">
            {formattedTime}
          </HoverCardContent> */}
        </HoverCard>
      );
    },
  },
];

const createTag = (Icon: LucideIcon, content: string, color?: string) => (
  <Badge variant="outline" className={`border-${color} text-${color}`}>
    <div className="flex items-center justify-between">
      <Icon size={15} className="m-1 mr-2" />
      <span>{content}</span>
    </div>
  </Badge>
);
