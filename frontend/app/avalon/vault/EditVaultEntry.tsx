import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { z } from "zod";
import { MoreHorizontal } from "lucide-react";
import { VaultEntry } from "./columns";
import React from "react";
import { useFetchApi } from "@/hooks/use-fetch-api";
import VaultEntryForm, { formSchema, VaultEntryFormRef } from "./VaultEntryForm";
import FormDialog from "@/components/FormDialog";

type EditVaultEntryProps = {
  vaultEntry: VaultEntry;
  onUpdate: (vaultEntry: VaultEntry) => unknown;
  onDelete: () => unknown;
};

export default function EditVaultEntry({
  vaultEntry,
  onUpdate,
  onDelete,
}: EditVaultEntryProps) {
  const fetchApi = useFetchApi();
  const [open, setOpen] = React.useState(false);

  const formRef = React.useRef<VaultEntryFormRef>(null);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    fetchApi(
      `avalon/vault/entry/${vaultEntry.id}`,
      async (res) => {
        if (res.status === 200) {
          const vaultEntry = await res.json();
          setOpen(false);
          onUpdate(vaultEntry);
        } else {
          console.error(await res.text());
        }
      },
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          group: "group" in values ? Number(values.group) : undefined,
        }),
      }
    );
  };

  const handleOnEditClicked = () => {
    if (vaultEntry.content !== undefined) {
      formRef.current?.setValue("content", vaultEntry.content);
      setOpen(true);
      return;
    }

    fetchApi(`avalon/vault/content/${vaultEntry.id}`, async (res) => {
      if (res.status !== 200) return;
      const { content } = await res.json();
      onUpdate({ ...vaultEntry, content });
      formRef.current?.setValue("content", content);
      setOpen(true);
    });
  };

  const handleDelete = async () => {
    fetchApi(
      `avalon/vault/entry/${vaultEntry.id}`,
      async (res) => {
        if (res.status === 200) {
          setOpen(false);
          onDelete();
        } else {
          console.error(await res.text());
        }
      },
      {
        method: "DELETE",
      }
    );
  };

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            className="hover:cursor-pointer"
            onClick={handleOnEditClicked}
          >
            Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            className="hover:cursor-pointer"
            onClick={handleDelete}
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <FormDialog
        open={open}
        onOpenChange={(o) => {
          if (!o) formRef.current?.reset();
          setOpen(o);
        }}
        title={vaultEntry.name}
        description={vaultEntry.id}
        failText="Cancel"
        successText="Save changes"
        onSuccess={(e) => {
          formRef.current?.submit(e);
        }}
      >
        <VaultEntryForm
          ref={formRef}
          onSubmit={onSubmit}
          defaultValues={{
            name: vaultEntry.name,
            uriRegex: vaultEntry.uriRegex,
            kind: vaultEntry.kind,
            content: vaultEntry.content,
            group: vaultEntry.group.toString(),
          }}
        />
      </FormDialog>
    </>
  );
}
