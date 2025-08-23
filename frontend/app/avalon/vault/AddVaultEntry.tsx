import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { CirclePlus } from "lucide-react";
import ComboboxKind from "./ComboBoxKind";
import { VaultEntry } from "./columns";
import { useState } from "react";
import PasswordInput from "@/components/PasswordInput";
import { useFetchApi } from "@/hooks/use-fetch-api";

const formSchema = z.object({
  name: z.string().min(2).max(20),
  uriRegex: z.string().max(30).nonempty(),
  kind: z.union([z.literal("username"), z.literal("email"), z.literal("password")]),
  content: z.string().max(50).nonempty(),
  group: z.string().regex(/^[0-9]+$/),
});

type AddVaultEntryProps = {
  onNewVaultEntry: (vaultEntry: VaultEntry) => unknown;
};

export default function AddVaultEntry({ onNewVaultEntry }: AddVaultEntryProps) {
  const fetchApi = useFetchApi();
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      uriRegex: "",
      kind: "username",
      content: "",
      group: "0",
    },
  });

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
    <Dialog
      open={open}
      defaultOpen={false}
      onOpenChange={(open) => {
        if (!open) form.reset();
        setOpen(open);
      }}
    >
      <div className="flex justify-end">
        <DialogTrigger asChild>
          <Button>
            <CirclePlus />
            New Vault Entry
          </Button>
        </DialogTrigger>
      </div>
      <DialogContent className="outline-none">
        <DialogHeader>
          <DialogTitle>New Vault Entry</DialogTitle>
          <DialogDescription>
            Complete the following form to create a new vault entry.
          </DialogDescription>
        </DialogHeader>
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
                      <ComboboxKind
                        defaultValue={field.value}
                        onChange={field.onChange}
                      />
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
                    <FormControl>
                      <PasswordInput inputProps={field} />
                    </FormControl>
                    <FormDescription>Maximum 30 characters.</FormDescription>
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
            </div>
          </form>
        </Form>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={form.handleSubmit(onSubmit)}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
