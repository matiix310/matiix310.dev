import { Button } from "@/components/ui/button";

import { z } from "zod";
import { MoreHorizontal } from "lucide-react";
import { Client, Device } from "./columns";
import React from "react";
import { useFetchApi } from "@/hooks/use-fetch-api";
import DeviceForm, { DeviceFormRef, formSchema } from "./DeviceForm";
import FormDialog from "@/components/FormDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

type EditDeviceProps = {
  device: Device & { availableClients: Client[] };
  onUpdate: (device: Device) => unknown;
  onDelete: () => unknown;
};

export default function EditDevice({ device, onUpdate, onDelete }: EditDeviceProps) {
  const fetchApi = useFetchApi();
  const [open, setOpen] = React.useState(false);

  const formRef = React.useRef<DeviceFormRef>(null);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    fetchApi(
      `avalon/devices/${device.id}`,
      async (res) => {
        if (res.status === 200) {
          const device = await res.json();
          setOpen(false);
          onUpdate(device);
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
          clients: values.clients,
          fcmToken: values.fcmToken === "" ? null : values.fcmToken,
        }),
      }
    );
  };

  const handleDelete = () => {
    fetchApi(
      `avalon/devices/${device.id}`,
      async (res) => {
        if (res.status === 200) {
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
    fetchApi(`avalon/devices/${device.id}/regenerate-key`, async (res) => {
      if (res.status === 200) {
        const { key } = await res.json();
        toast("New private key", {
          description: `For device: ${device.name}`,
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
        title={device.name}
        description={device.id}
        failText="Cancel"
        successText="Save changes"
        onSuccess={(e) => {
          formRef.current?.submit(e);
        }}
      >
        <DeviceForm
          ref={formRef}
          availableClients={device.availableClients}
          onSubmit={onSubmit}
          defaultValues={{
            name: device.name,
            fcmToken: device.fcmToken ?? "",
            kind: device.kind,
            clients: device.clients,
          }}
        />
      </FormDialog>
    </>
  );
}
