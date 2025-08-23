import { Button } from "@/components/ui/button";

import { z } from "zod";
import { CirclePlus } from "lucide-react";
import { Client, Device } from "./columns";
import React from "react";
import { useFetchApi } from "@/hooks/use-fetch-api";
import FormDialog from "@/components/FormDialog";
import DeviceForm, { DeviceFormRef, formSchema } from "./DeviceForm";

type AddDeviceProps = {
  availableClients: Client[];
  onNewDevice: (device: Device) => unknown;
};

export default function AddDevice({ availableClients, onNewDevice }: AddDeviceProps) {
  const fetchApi = useFetchApi();
  const [open, setOpen] = React.useState(false);

  const formRef = React.useRef<DeviceFormRef>(null);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    fetchApi(
      "avalon/devices",
      async (res) => {
        if (res.status === 200) {
          const device = await res.json();
          setOpen(false);
          onNewDevice(device);
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
          clients: values.clients.length === 0 ? undefined : values.clients,
          fcmToken: values.fcmToken === "" ? undefined : values.fcmToken,
        }),
      }
    );
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <CirclePlus />
        New Device
      </Button>
      <FormDialog
        open={open}
        onOpenChange={(o) => {
          if (!o) formRef.current?.reset();
          setOpen(o);
        }}
        title="New Device"
        description="Complete the following form to create a new device."
        failText="Cancel"
        successText="Create"
        onSuccess={(e) => {
          formRef.current?.submit(e);
        }}
      >
        <DeviceForm
          ref={formRef}
          availableClients={availableClients}
          onSubmit={onSubmit}
          defaultValues={{ name: "", fcmToken: "", kind: "computer", clients: [] }}
        />
      </FormDialog>
    </>
  );
}
