import { Button } from "@/components/ui/button";
import { z } from "zod";
import { CirclePlus } from "lucide-react";
import { Client } from "./columns";
import React from "react";
import { useFetchApi } from "@/hooks/use-fetch-api";
import { ClientFormRef, formSchema } from "./ClientForm";
import FormDialog from "@/components/FormDialog";
import ClientForm from "./ClientForm";

type AddClientProps = {
  onNewClient: (client: Client) => unknown;
};

export default function AddClient({ onNewClient }: AddClientProps) {
  const fetchApi = useFetchApi();
  const [open, setOpen] = React.useState(false);
  const formRef = React.useRef<ClientFormRef>(null);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    fetchApi(
      "avalon/clients",
      async (res) => {
        if (res.status === 200) {
          const client = await res.json();
          setOpen(false);
          onNewClient(client);
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
        }),
      }
    );
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <CirclePlus />
        New client
      </Button>
      <FormDialog
        open={open}
        onOpenChange={(o) => {
          if (!o) formRef.current?.reset();
          setOpen(o);
        }}
        title="New Client"
        description="Complete the following form to create a new client."
        failText="Cancel"
        successText="Create"
        onSuccess={(e) => {
          formRef.current?.submit(e);
        }}
      >
        <ClientForm
          ref={formRef}
          onSubmit={onSubmit}
          defaultValues={{ name: "", kind: "pam" }}
        />
      </FormDialog>
    </>
  );
}
