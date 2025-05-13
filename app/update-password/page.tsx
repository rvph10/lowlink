"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { updatePassword, user } = useAuth();

  // Check for valid access to this page
  useEffect(() => {
    const token = searchParams.get("token");
    if (!user && !token) {
      router.push("/login");
    }
  }, [user, router, searchParams]);

  // Password strength checker
  const getPasswordStrength = (password: string) => {
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    return score;
  };

  const passwordStrength = getPasswordStrength(password);
  const passwordStrengthText = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
  const passwordStrengthColor = [
    "bg-red-500",
    "bg-orange-500",
    "bg-yellow-500",
    "bg-green-500",
    "bg-green-600",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation first
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const token = searchParams.get("token");
      const { error } = await updatePassword(password, token || undefined);

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("Password updated successfully");
      router.push("/login");
    } catch (error: unknown) {
      toast.error((error as Error).message);
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
            Update your password
          </h1>

          <p className="text-center text-muted-foreground">
            Create a new, strong password for your account
          </p>

          <form onSubmit={handleSubmit} className="w-full max-w-lg space-y-4">
            <div className="space-y-4">
              <div className="relative">
                <Input
                  className={`h-14 rounded-full border-none bg-muted px-5 py-4 font-medium`}
                  placeholder="Create a password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  inputMode="text"
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
              {password && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Password Strength:</span>
                    <span className="text-sm font-medium">
                      {passwordStrengthText[passwordStrength]}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${passwordStrengthColor[passwordStrength]}`}
                      style={{
                        width: `${(passwordStrength / 4) * 100}%`,
                      }}
                    ></div>
                  </div>

                  {/* Password requirements */}
                  <ul className="text-xs space-y-1 mt-2">
                    <li
                      className={
                        password.length >= 8
                          ? "text-green-500"
                          : "text-gray-500"
                      }
                    >
                      ✓ At least 8 characters
                    </li>
                    <li
                      className={
                        /[A-Z]/.test(password)
                          ? "text-green-500"
                          : "text-gray-500"
                      }
                    >
                      ✓ At least 1 uppercase letter
                    </li>
                    <li
                      className={
                        /[0-9]/.test(password)
                          ? "text-green-500"
                          : "text-gray-500"
                      }
                    >
                      ✓ At least 1 number
                    </li>
                    <li
                      className={
                        /[^A-Za-z0-9]/.test(password)
                          ? "text-green-500"
                          : "text-gray-500"
                      }
                    >
                      ✓ At least 1 special character
                    </li>
                  </ul>
                </div>
              )}

              <div className="relative">
                <Input
                  className={`h-14 rounded-full border-none bg-muted px-5 py-4 font-medium`}
                  placeholder="Confirm your password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  inputMode="text"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="absolute right-4 top-4"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-6 w-6 text-gray-500" />
                  ) : (
                    <Eye className="h-6 w-6 text-gray-500" />
                  )}
                </button>
              </div>
              {password && confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-red-500">Passwords do not match</p>
              )}

              <Button
                type="submit"
                className="h-14 w-full rounded-full bg-foreground text-background hover:bg-foreground/90"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating password...
                  </>
                ) : (
                  "Update Password"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
