import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Client } from "./columns";
import { Input } from "@/components/ui/input";
import ComboboxKind from "./ComboBoxKind";
import ClientsSelector from "./ClientSelector";
import React from "react";

export const formSchema = z.object({
  name: z.string().min(2).max(50),
  kind: z.union([z.literal("laptop"), z.literal("computer"), z.literal("phone")]),
  fcmToken: z.union([z.string().length(142), z.string().length(0)]),
  clients: z.array(z.string()),
});

export type DeviceFormRef = {
  reset: () => unknown;
  submit: (e?: React.BaseSyntheticEvent) => unknown;
};

export type DeviceFormProps = {
  availableClients: Client[];
  defaultValues?: Partial<z.infer<typeof formSchema>>;
  onSubmit: (values: z.infer<typeof formSchema>) => unknown;
};

const DeviceForm = React.forwardRef<DeviceFormRef, DeviceFormProps>(
  ({ availableClients, onSubmit, defaultValues }, ref) => {
    const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues,
    });

    React.useImperativeHandle(
      ref,
      () => ({
        reset: form.reset,
        submit: form.handleSubmit(onSubmit),
      }),
      [form, onSubmit]
    );

    return (
      <Form {...form}>
        <div className="grid gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="grid gap-2">
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormDescription>Between 2 and 50 characters.</FormDescription>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="kind"
            render={({ field }) => (
              <FormItem className="grid gap-2">
                <FormLabel>Kind</FormLabel>
                <FormControl>
                  <ComboboxKind defaultValue={field.value} onChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="fcmToken"
            render={({ field }) => (
              <FormItem className="grid gap-2">
                <FormLabel>FCM Token</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="clients"
            render={({ field }) => (
              <FormItem className="grid gap-2">
                <FormLabel>Clients</FormLabel>
                <FormControl>
                  <ClientsSelector
                    availableClients={availableClients}
                    defaultClients={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      </Form>
    );
  }
);

DeviceForm.displayName = "DeviceForm";
export default DeviceForm;
