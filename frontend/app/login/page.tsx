"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import PasswordInput from "@/components/PasswordInput";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

const formSchema = z.object({
  username: z.string().min(2).max(50),
  password: z.string().min(2).max(50),
});

export default function LoginScreen() {
  return (
    <div className="flex justify-center items-center h-[100vh] w-[100vw]">
      <Suspense>
        <LoginCard />
      </Suspense>
    </div>
  );
}

const LoginCard = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const searchParams = useSearchParams();
  const {
    data,
    isPending, //loading state
    error, //error object
  } = authClient.useSession();

  useEffect(() => {
    if (!isPending && data !== null)
      window.location.href = searchParams.get("redirect") ?? "/";
  }, [data, isPending, error, searchParams]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const { data, error } = await authClient.signIn.username({
      username: values.username,
      password: values.password,
    });

    if (error) {
      toast("Error on login", {
        style: { borderColor: "var(--destructive)" },
        description: error.message,
        className: "bg-red-400",
      });

      form.setError("root", { message: "Invalid username and / or password" });
      form.setError("username", {});
      form.setError("password", {});
    }

    if (data) {
      window.location.href = searchParams.get("redirect") ?? "/";
    }
  };

  return (
    <Form {...form}>
      <form className="w-full max-w-md" onSubmit={(e) => form.handleSubmit(onSubmit)(e)}>
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Login to your Avalon account</CardTitle>
            <CardDescription>
              Enter your credentials below to login to your account
            </CardDescription>
            <CardAction>
              <Button disabled variant="link">
                Sign Up
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-6">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem className="grid gap-2">
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>Between 2 and 50 characters.</FormDescription>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="grid gap-2">
                    <div className="flex items-center">
                      <FormLabel htmlFor="password">Password</FormLabel>
                      <p
                        onClick={() => {
                          /* TODO: redirect to forgot password page */
                        }}
                        className="ml-auto inline-block text-sm underline-offset-4 hover:underline cursor-pointer"
                      >
                        Forgot your password?
                      </p>
                    </div>
                    <PasswordInput
                      inputProps={{ ...field, id: "password" }}
                      asFormInput
                    />
                    <FormDescription>Between 2 and 50 characters.</FormDescription>
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-2">
            <Button type="submit" className="w-full">
              Login
            </Button>
            <Button disabled variant="outline" className="w-full">
              Login with Google
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
};
