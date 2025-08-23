import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Edit } from "lucide-react";
import ComboboxKind from "./ComboBoxKind";
import { VaultEntry } from "./columns";
import { useState } from "react";
import PasswordInput from "@/components/PasswordInput";
import { useFetchApi } from "@/hooks/use-fetch-api";

type EditVaultEntryProps = {
  vaultEntry: VaultEntry;
  onUpdate: (vaultEntry: VaultEntry) => unknown;
  onDelete: () => unknown;
};

const formSchema = z.object({
  name: z.string().min(2).max(20),
  uriRegex: z.string().max(30).nonempty(),
  kind: z.union([z.literal("username"), z.literal("email"), z.literal("password")]),
  content: z.string().max(50).nonempty(),
  group: z.string().regex(/^[0-9]+$/),
});

export default function EditVaultEntry({
  vaultEntry,
  onUpdate,
  onDelete,
}: EditVaultEntryProps) {
  const [open, setOpen] = useState(false);
  const fetchApi = useFetchApi();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: vaultEntry.name,
      uriRegex: vaultEntry.uriRegex,
      kind: vaultEntry.kind,
      content: vaultEntry.content,
      group: vaultEntry.group.toString(),
    },
  });

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
    <Dialog
      open={open}
      defaultOpen={false}
      onOpenChange={(open) => {
        if (!open) form.reset();
        setOpen(open);
      }}
    >
      <div className="flex justify-end">
        <Button
          className="hover:cursor-pointer"
          variant="ghost"
          onClick={() => {
            if (vaultEntry.content !== undefined) {
              form.setValue("content", vaultEntry.content);
              setOpen(true);
              return;
            }

            fetchApi(`avalon/vault/content/${vaultEntry.id}`, async (res) => {
              if (res.status !== 200) return;
              console.log("coucou");
              const { content } = await res.json();
              onUpdate({ ...vaultEntry, content });
              form.setValue("content", content);
              setOpen(true);
            });
          }}
        >
          <Edit />
        </Button>
      </div>
      <DialogContent className="outline-none">
        <DialogHeader>
          <DialogTitle>{vaultEntry.name}</DialogTitle>
          <DialogDescription>{vaultEntry.id}</DialogDescription>
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
            </div>
          </form>
        </Form>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button variant="destructive" onClick={() => handleDelete()}>
            Delete
          </Button>
          <Button onClick={form.handleSubmit(onSubmit)}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
