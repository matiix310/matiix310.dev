import { Button } from "@/components/ui/button";
import { z } from "zod";
import { CirclePlus } from "lucide-react";
import { VaultEntry } from "./columns";
import React from "react";
import { useFetchApi } from "@/hooks/use-fetch-api";
import VaultEntryForm, { formSchema, VaultEntryFormRef } from "./VaultEntryForm";
import FormDialog from "@/components/FormDialog";

type AddVaultEntryProps = {
  onNewVaultEntry: (vaultEntry: VaultEntry) => unknown;
};

export default function AddVaultEntry({ onNewVaultEntry }: AddVaultEntryProps) {
  const fetchApi = useFetchApi();
  const [open, setOpen] = React.useState(false);

  const formRef = React.useRef<VaultEntryFormRef>(null);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    fetchApi(
      "avalon/vault/entry",
      async (res) => {
        if (res.status === 200) {
          const vaultEntry = await res.json();
          setOpen(false);
          onNewVaultEntry(vaultEntry);
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

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <CirclePlus />
        New Vault Entry
      </Button>
      <FormDialog
        open={open}
        onOpenChange={(o) => {
          if (!o) formRef.current?.reset();
          setOpen(o);
        }}
        title="NEw Vault Entry"
        description="Complete the following form to create a new vault entry."
        failText="Cancel"
        successText="Create"
        onSuccess={(e) => {
          formRef.current?.submit(e);
        }}
      >
        <VaultEntryForm
          ref={formRef}
          onSubmit={onSubmit}
          defaultValues={{
            name: "",
            kind: "username",
            content: "",
            group: "0",
            secured: false,
            uriRegex: "",
          }}
        />
      </FormDialog>
    </>
  );
}
