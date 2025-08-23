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
import { Input } from "@/components/ui/input";
import ComboboxKind from "./ComboBoxKind";
import React from "react";

export const formSchema = z.object({
  name: z.string().min(2).max(50),
  kind: z.union([z.literal("web_extension"), z.literal("pam")]),
});

export type ClientFormRef = {
  reset: () => unknown;
  submit: (e?: React.BaseSyntheticEvent) => unknown;
};

export type ClientFormProps = {
  defaultValues?: Partial<z.infer<typeof formSchema>>;
  onSubmit: (values: z.infer<typeof formSchema>) => unknown;
};

const ClientForm = React.forwardRef<ClientFormRef, ClientFormProps>(
  ({ onSubmit, defaultValues }, ref) => {
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
        <form onSubmit={form.handleSubmit(onSubmit)}>
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
          </div>
        </form>
      </Form>
    );
  }
);

ClientForm.displayName = "ClientForm";
export default ClientForm;
