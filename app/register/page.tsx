"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { toast } from "sonner";

function RegisterPage() {
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();

  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    hasLength: false,
    hasUppercase: false,
    hasNumber: false,
    hasSpecial: false,
  });

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

  // Password validation and strength calculation
  const validatePassword = (value: string) => {
    const hasLength = value.length >= 8;
    const hasUppercase = /[A-Z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(value);

    let score = 0;
    if (hasLength) score += 1;
    if (hasUppercase) score += 1;
    if (hasNumber) score += 1;
    if (hasSpecial) score += 1;

    setPasswordStrength({
      score,
      hasLength,
      hasUppercase,
      hasNumber,
      hasSpecial,
    });

    if (!value) {
      setPasswordError("Password is required");
      return false;
    } else if (!hasLength || !hasUppercase || !hasNumber || !hasSpecial) {
      setPasswordError("Password doesn't meet all requirements");
      return false;
    } else {
      setPasswordError("");
      return true;
    }
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

  // Handle register with email/password
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePassword(password)) {
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await signUp(email, password);

      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Check your email to confirm your account");
        // Stay on the same page as they need to confirm their email
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(err.message || "Failed to create account");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle register with Google
  const handleGoogleRegister = async () => {
    // Implementation for Google registration would go here
    // This is placeholder functionality until we implement OAuth
    toast.info("Google registration is not implemented yet");
  };

  // Get strength color based on score
  const getStrengthColor = (score: number) => {
    if (score === 0) return "bg-gray-200";
    if (score === 1) return "bg-red-500";
    if (score === 2) return "bg-orange-500";
    if (score === 3) return "bg-yellow-500";
    if (score === 4) return "bg-green-500";
  };

  // Get strength text based on score
  const getStrengthText = (score: number) => {
    if (score === 0) return "None";
    if (score === 1) return "Weak";
    if (score === 2) return "Fair";
    if (score === 3) return "Good";
    if (score === 4) return "Strong";
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
            Create your account
          </h1>

          <Button
            variant="outline"
            className="flex h-14 w-full max-w-lg items-center justify-center gap-8 rounded-full border-muted-foreground/30"
            onClick={handleGoogleRegister}
          >
            <Image
              className="h-5 w-5"
              alt="Google logo"
              width={20}
              height={20}
              src="https://shadcnblocks.com/images/block/logos/google-icon.svg"
            />
            <span className="font-medium">Sign up with Google</span>
          </Button>

          <div className="flex w-full max-w-lg items-center gap-6">
            <Separator className="flex-1" />
            <span className="font-medium tracking-tight">or</span>
            <Separator className="flex-1" />
          </div>

          <form onSubmit={handleRegister} className="w-full max-w-lg space-y-4">
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
                      placeholder="Create Password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      inputMode="text"
                      onChange={(e) => {
                        setPassword(e.target.value);
                        validatePassword(e.target.value);
                      }}
                      required
                      autoComplete="new-password"
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

                  {/* Password strength indicator */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Password Strength:</span>
                      <span className="text-sm font-medium">
                        {getStrengthText(passwordStrength.score)}
                      </span>
                    </div>
                    <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getStrengthColor(
                          passwordStrength.score,
                        )}`}
                        style={{
                          width: `${(passwordStrength.score / 4) * 100}%`,
                        }}
                      ></div>
                    </div>

                    {/* Password requirements */}
                    <ul className="text-xs space-y-1 mt-2">
                      <li
                        className={
                          passwordStrength.hasLength
                            ? "text-green-500"
                            : "text-gray-500"
                        }
                      >
                        ✓ At least 8 characters
                      </li>
                      <li
                        className={
                          passwordStrength.hasUppercase
                            ? "text-green-500"
                            : "text-gray-500"
                        }
                      >
                        ✓ At least 1 uppercase letter
                      </li>
                      <li
                        className={
                          passwordStrength.hasNumber
                            ? "text-green-500"
                            : "text-gray-500"
                        }
                      >
                        ✓ At least 1 number
                      </li>
                      <li
                        className={
                          passwordStrength.hasSpecial
                            ? "text-green-500"
                            : "text-gray-500"
                        }
                      >
                        ✓ At least 1 special character
                      </li>
                    </ul>
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
                      {isLoading ? "Creating account..." : "Register"}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </form>

          <p className="mb-8 w-full text-center text-sm tracking-tight text-foreground">
            Already have an account?{" "}
            <Link href="/login" className="cursor-pointer underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}

export default RegisterPage;
