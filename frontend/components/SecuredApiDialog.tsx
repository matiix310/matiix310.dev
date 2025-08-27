"use client";

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
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { Form, FormDescription, FormField, FormItem, FormLabel } from "./ui/form";
import PasswordInput from "./PasswordInput";
import { SecuredContext, useFetchApi } from "@/hooks/use-fetch-api";

const formSchema = z.object({
  password: z.string().nonempty().max(50),
});

export default function SecuredApiDialog() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
    },
  });

  const fetchApi = useFetchApi();
  const [open, setOpen] = useState(false);
  const [onSuccess, setOnSuccess] = useState(() => () => {});
  const [onFailure, setOnFailure] = useState(() => () => {});

  useEffect(() => {
    return SecuredContext.subscribe((onSuccessCb, onFailureCb) => {
      if (open) {
        onFailure();
        return;
      }

      setOnSuccess(() => onSuccessCb);
      setOnFailure(() => onFailureCb);
      setOpen(true);
    });
  }, [onFailure, open]);

  const onSubmit = async (value: z.infer<typeof formSchema>) => {
    fetchApi(
      "auth/secured-api-key",
      (res) => {
        if (res.status !== 200) {
          form.setError(
            "password",
            { message: "Password is invalid" },
            { shouldFocus: true }
          );
          return;
        }

        onSuccess();
        form.reset();
        setOpen(false);
      },
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(value),
      }
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o && form.getValues().password !== "") onFailure();

        form.reset();
        setOpen(o);
      }}
    >
      <form>
        <DialogContent className="m:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Restricted action</DialogTitle>
            <DialogDescription>
              Enter your password to confirm your identity. You will be granted privileged
              authorizations for 5 minutes and 3 secured request.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid gap-4">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="grid gap-2">
                      <FormLabel>Password</FormLabel>
                      <PasswordInput inputProps={field} asFormInput />
                      <FormDescription>Maximum 50 characters.</FormDescription>
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
            <Button onClick={form.handleSubmit(onSubmit)}>Submit</Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
