"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

function LoginPage() {
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();

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

  // Password validation
  const validatePassword = (value: string) => {
    if (!value) {
      return "Password is required";
    }
    return "";
  };

  // Handle email continue button
  const handleEmailContinue = () => {
    const error = validateEmail(email);
    setEmailError(error);
    if (!error) {
      setStep("password");
    }
  };

  // Handle key press for email step
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && step === "email") {
      e.preventDefault();
      handleEmailContinue();
    }
  };

  // Handle login with email/password
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const error = validatePassword(password);
    setPasswordError(error);
    if (error) {
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await signIn(email, password);

      if (error) {
        toast.error(error.message);
      } else {
        router.push("/dashboard");
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(err.message || "Failed to log in");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle login with Google
  const handleGoogleLogin = async () => {
    // Implementation for Google login would go here
    // This is placeholder functionality until we implement OAuth
    toast.info("Google login is not implemented yet");
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
            Log in to your account
          </h1>

          <Button
            variant="outline"
            className="flex h-14 w-full max-w-lg items-center justify-center gap-8 rounded-full border-muted-foreground/30"
            onClick={handleGoogleLogin}
          >
            <Image
              className="h-5 w-5"
              alt="Google logo"
              width={20}
              height={20}
              src="https://shadcnblocks.com/images/block/logos/google-icon.svg"
            />
            <span className="font-medium">Log in with Google</span>
          </Button>

          <div className="flex w-full max-w-lg items-center gap-6">
            <Separator className="flex-1" />
            <span className="font-medium tracking-tight">or</span>
            <Separator className="flex-1" />
          </div>

          <form onSubmit={handleLogin} className="w-full max-w-lg space-y-4">
            {step === "email" ? (
              <>
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
                    onKeyDown={handleKeyPress}
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
                  type="button"
                  className="h-14 w-full max-w-lg rounded-full bg-foreground text-background hover:bg-foreground/90"
                  onClick={handleEmailContinue}
                  disabled={isLoading}
                >
                  <span className="font-medium tracking-tight">
                    {isLoading ? "Processing..." : "Continue"}
                  </span>
                </Button>
              </>
            ) : (
              <>
                <div className="space-y-4">
                  <div className="relative">
                    <Input
                      className={`h-14 rounded-full border-none bg-muted px-5 py-4 font-medium ${
                        passwordError ? "border-2 border-red-500" : ""
                      }`}
                      inputMode="text"
                      placeholder="Enter Password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onBlur={(e) => validatePassword(e.target.value)}
                      required
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="absolute right-4 top-4"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-6 w-6 text-gray-500" />
                      ) : (
                        <Eye className="h-6 w-6 text-gray-500" />
                      )}
                    </button>
                  </div>

                  {passwordError && (
                    <p className="text-red-500 text-xs ml-4">{passwordError}</p>
                  )}
                  <div className="flex space-x-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-14 w-1/2 rounded-full"
                      onClick={() => setStep("email")}
                      disabled={isLoading}
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      className="h-14 w-1/2 rounded-full bg-foreground text-background hover:bg-foreground/90"
                      disabled={isLoading}
                    >
                      {isLoading ? "Logging in..." : "Log in"}
                    </Button>
                  </div>
                </div>
              </>
            )}
            <div className="flex justify-end">
              <Link
                href="/forgot-password"
                className="text-sm text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>
          </form>

          <p className="mb-8 w-full text-center text-sm tracking-tight text-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="cursor-pointer underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}

export default LoginPage;
