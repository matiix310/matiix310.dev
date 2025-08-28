import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, UseFormSetValue } from "react-hook-form";
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
import PasswordInput from "@/components/PasswordInput";
import { Switch } from "@/components/ui/switch";

export const formSchema = z.object({
  name: z.string().min(2).max(20),
  uriRegex: z.string().max(30).nonempty(),
  kind: z.union([z.literal("username"), z.literal("email"), z.literal("password")]),
  content: z.string().max(50).nonempty(),
  group: z.string().regex(/^[0-9]+$/),
  secured: z.boolean(),
});

export type VaultEntryFormRef = {
  reset: () => unknown;
  submit: (e?: React.BaseSyntheticEvent) => unknown;
  setValue: UseFormSetValue<z.infer<typeof formSchema>>;
};

export type VaultEntryFormProps = {
  defaultValues?: Partial<z.infer<typeof formSchema>>;
  onSubmit: (values: z.infer<typeof formSchema>) => unknown;
};

const VaultEntryForm = React.forwardRef<VaultEntryFormRef, VaultEntryFormProps>(
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
        setValue: form.setValue,
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
                  <FormDescription>Between 2 and 20 characters.</FormDescription>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="uriRegex"
              render={({ field }) => (
                <FormItem className="grid gap-2">
                  <FormLabel>URI Regex</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>Maximum 30 characters.</FormDescription>
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
              name="content"
              render={({ field }) => (
                <FormItem className="grid gap-2">
                  <FormLabel>Content</FormLabel>
                  <PasswordInput inputProps={field} asFormInput />
                  <FormDescription>Maximum 50 characters.</FormDescription>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="group"
              render={({ field }) => (
                <FormItem className="grid gap-2">
                  <FormLabel>Group</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormDescription>Positive number.</FormDescription>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="secured"
              render={({ field }) => (
                <FormItem className="grid gap-2">
                  <div className="flex justify-between">
                    <FormLabel>Secured</FormLabel>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </div>
                  <FormDescription>
                    It will ask a confirmation to a verified device before sending the
                    content
                  </FormDescription>
                </FormItem>
              )}
            />
          </div>
        </form>
      </Form>
    );
  }
);

VaultEntryForm.displayName = "VaultEntryForm";
export default VaultEntryForm;
