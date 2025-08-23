"use client";

import { useFetchApiWithState } from "@/hooks/use-fetch-api";
import { AvalonLog, columns } from "./columns";
import { DataTable } from "./data-table";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";

export default function LogsScreen() {
  const [logs, , updateLogs] = useFetchApiWithState<AvalonLog[]>("avalon/logs", () =>
    toast("Error fetching the logs (check that you are signed in).")
  );

  return (
    <div className="m-4 grid gap-4">
      <div className="flex justify-end">
        <Button
          variant="ghost"
          onClick={() => {
            updateLogs();
          }}
        >
          <RefreshCcw />
        </Button>
      </div>
      <DataTable columns={columns} data={logs ?? []} />
    </div>
  );
}
