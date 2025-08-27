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
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import PasswordInput from "@/components/PasswordInput";
import { useSearchParams } from "next/navigation";
import React, { Suspense, useEffect } from "react";
import { REGEXP_ONLY_DIGITS } from "input-otp";

const loginFormSchema = z.object({
  username: z.string().min(2).max(50),
  password: z.string().min(2).max(50),
});

const TOTPFormSchema = z.object({
  code: z.string().regex(/^\d{6}$/),
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
  const [verifyTOTP, setVerifyTOTP] = React.useState(false);

  const loginForm = useForm<z.infer<typeof loginFormSchema>>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const isSubmittingLogin = loginForm.formState.isSubmitting;

  const TOTPForm = useForm<z.infer<typeof TOTPFormSchema>>({
    resolver: zodResolver(TOTPFormSchema),
    defaultValues: {
      code: "",
    },
  });

  const isSubmittingTOTP = TOTPForm.formState.isSubmitting;

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

  const onLoggedIn = () => {
    window.location.href = searchParams.get("redirect") ?? "/";
  };

  const onSubmitLogin = async (values: z.infer<typeof loginFormSchema>) => {
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

      loginForm.setError("root", { message: "Invalid username and / or password" });
      loginForm.setError("username", {});
      loginForm.setError("password", {});
      return;
    }

    if (data) {
      if ("twoFactorRedirect" in data) {
        // verify 2FA
        loginForm.reset();
        setVerifyTOTP(true);
      } else {
        onLoggedIn();
      }
    }
  };

  const onSubmitTOTP = async (values: z.infer<typeof TOTPFormSchema>) => {
    const { data, error } = await authClient.twoFactor.verifyTotp({ code: values.code });

    if (error) {
      toast("Error while verifying your TOTP token", {
        style: { borderColor: "var(--destructive)" },
        description: error.message,
        className: "bg-red-400",
      });

      TOTPForm.setError("root", { message: "Invalid TOTP code" });
      TOTPForm.setError("code", {});
      return;
    }

    if (data) {
      onLoggedIn();
    }
  };

  const handleOnCancel = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    if (verifyTOTP) {
      TOTPForm.reset();
      setVerifyTOTP(false);
    }
  };

  return verifyTOTP ? (
    <Form key={0} {...TOTPForm}>
      <form
        className="w-full max-w-md"
        onSubmit={(e) => TOTPForm.handleSubmit(onSubmitTOTP)(e)}
      >
        <Card className="w-full">
          <CardHeader>
            <CardTitle>2FA verification</CardTitle>
            <CardDescription>
              Please enter your authentication code below.
            </CardDescription>
            <CardAction>
              <Button variant="ghost" onClick={handleOnCancel}>
                Cancel
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-6">
              <FormField
                control={TOTPForm.control}
                name="code"
                render={({ field }) => (
                  <FormItem className="grid gap-2">
                    <FormLabel>Code</FormLabel>
                    <FormControl>
                      <InputOTP
                        maxLength={6}
                        pattern={REGEXP_ONLY_DIGITS}
                        {...field}
                        onComplete={TOTPForm.handleSubmit(onSubmitTOTP)}
                        disabled={isSubmittingTOTP}
                      >
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                        </InputOTPGroup>
                        <InputOTPGroup>
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    </FormControl>
                    <FormDescription>6 digit code</FormDescription>
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-2">
            <Button type="submit" className="w-full" disabled={isSubmittingLogin}>
              Login
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  ) : (
    <Form key={1} {...loginForm}>
      <form
        className="w-full max-w-md"
        onSubmit={(e) => loginForm.handleSubmit(onSubmitLogin)(e)}
      >
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
                control={loginForm.control}
                name="username"
                render={({ field }) => (
                  <FormItem className="grid gap-2">
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isSubmittingLogin} />
                    </FormControl>
                    <FormDescription>Between 2 and 50 characters.</FormDescription>
                  </FormItem>
                )}
              />
              <FormField
                control={loginForm.control}
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
                      inputProps={{
                        ...field,
                        id: "password",
                        disabled: isSubmittingLogin,
                      }}
                      asFormInput
                    />
                    <FormDescription>Between 2 and 50 characters.</FormDescription>
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-2">
            <Button type="submit" className="w-full" disabled={isSubmittingLogin}>
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
