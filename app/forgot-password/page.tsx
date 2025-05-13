"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [emailError, setEmailError] = useState("");
  const { resetPassword } = useAuth();

  // Email validation
  const validateEmail = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value) {
      return "Email is required";
    } else if (!emailRegex.test(value)) {
      return "Please enter a valid email address";
    }
    return "";
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    const error = validateEmail(email);
    setEmailError(error);
    if (error) {
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await resetPassword(email);

      if (error) {
        toast.error(error.message);
      } else {
        setIsSuccess(true);
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(err.message || "Failed to send reset email");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="bg-background flex justify-center items-center">
      <div className="container flex min-h-screen items-center justify-center py-4">
        <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-6">
          <div className="flex h-14 w-14 items-center justify-center">
            <Image
              className="h-14 w-12"
              alt="Logo"
              width={56}
              height={56}
              src="https://shadcnblocks.com/images/block/block-1.svg"
            />
          </div>

          <h1 className="mb-8 w-full text-center text-3xl font-medium tracking-tighter text-foreground md:text-4xl">
            Reset your password
          </h1>

          {isSuccess ? (
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                We&apos;ve sent you an email with instructions to reset your
                password.
              </p>
              <Button
                className="h-14 w-full max-w-lg rounded-full bg-foreground text-background hover:bg-foreground/90"
                asChild
              >
                <Link href="/login">Return to login</Link>
              </Button>
            </div>
          ) : (
            <>
              <p className="text-center text-muted-foreground">
                Enter your email address and we&apos;ll send you a link to reset
                your password.
              </p>

              <form
                onSubmit={handleResetPassword}
                className="w-full max-w-lg space-y-4"
              >
                <div className="relative">
                  <Input
                    className={`h-14 rounded-full border-none bg-muted px-5 py-4 font-medium ${
                      emailError ? "border-2 border-red-500" : ""
                    }`}
                    placeholder="Enter Your Email"
                    type="email"
                    value={email}
                    inputMode="email"
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                  {emailError && (
                    <p className="text-red-500 text-xs mt-1 ml-4">
                      {emailError}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="h-14 w-full max-w-lg rounded-full bg-foreground text-background hover:bg-foreground/90"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending reset link...
                    </>
                  ) : (
                    "Send reset link"
                  )}
                </Button>
              </form>

              <div className="flex w-full max-w-lg items-center gap-6">
                <Separator className="flex-1" />
                <span className="font-medium tracking-tight">or</span>
                <Separator className="flex-1" />
              </div>

              <Button
                variant="outline"
                className="h-14 w-full max-w-lg rounded-full"
                asChild
              >
                <Link href="/login">Return to login</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
