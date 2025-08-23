import { Button } from "@/components/ui/button";
import { z } from "zod";
import { MoreHorizontal } from "lucide-react";
import { Client } from "./columns";
import React from "react";
import { useFetchApi } from "@/hooks/use-fetch-api";
import ClientForm, { ClientFormRef, formSchema } from "./ClientForm";
import FormDialog from "@/components/FormDialog";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

type EditClientProps = {
  client: Client;
  onUpdate: (client: Client) => unknown;
  onDelete: () => unknown;
};

export default function EditClient({ client, onUpdate, onDelete }: EditClientProps) {
  const fetchApi = useFetchApi();
  const [open, setOpen] = React.useState(false);

  const formRef = React.useRef<ClientFormRef>(null);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    fetchApi(
      `avalon/clients/${client.id}`,
      async (res) => {
        if (res.status === 200) {
          const client = await res.json();
          setOpen(false);
          onUpdate(client);
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

  const handleDelete = async () => {
    fetchApi(
      `avalon/clients/${client.id}`,
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

  const handleRegenerateKey = () => {
    fetchApi(`avalon/clients/${client.id}/regenerate-key`, async (res) => {
      if (res.status === 200) {
        const { key } = await res.json();
        toast("New private key", {
          description: `For client: ${client.name}`,
          action: {
            label: "Copy",
            onClick: () => {
              navigator.clipboard.writeText(key);
            },
          },
        });
      } else {
        console.error(await res.text());
      }
    });
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
            onClick={() => setOpen(true)}
          >
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            className="hover:cursor-pointer"
            onClick={handleRegenerateKey}
          >
            Regenerate key
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
        title={client.name}
        description={client.id}
        failText="Cancel"
        successText="Save changes"
        onSuccess={(e) => {
          formRef.current?.submit(e);
        }}
      >
        <ClientForm
          ref={formRef}
          onSubmit={onSubmit}
          defaultValues={{
            name: client.name,
            kind: client.kind,
          }}
        />
      </FormDialog>
    </>
  );
}
