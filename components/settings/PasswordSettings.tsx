"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { KeyRound, Eye, EyeOff, Check, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/auth-context";

export default function PasswordSettings() {
  const { updatePassword } = useAuth();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Password strength checking
  const getPasswordStrength = (password: string): { 
    strength: "weak" | "medium" | "strong", 
    message: string 
  } => {
    if (!password) return { strength: "weak", message: "No password entered" };
    
    const hasLowercase = /[a-z]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSymbols = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const isLongEnough = password.length >= 8;
    
    const criteria = [hasLowercase, hasUppercase, hasNumbers, hasSymbols, isLongEnough];
    const metCriteria = criteria.filter(Boolean).length;
    
    if (metCriteria <= 2) return { 
      strength: "weak", 
      message: "Password is too weak" 
    };
    
    if (metCriteria <= 4) return { 
      strength: "medium", 
      message: "Password is moderate" 
    };
    
    return { 
      strength: "strong", 
      message: "Password is strong" 
    };
  };

  const passwordStrength = getPasswordStrength(newPassword);
  const passwordsMatch = newPassword === confirmPassword;

  const toggleShowPassword = (field: 'current' | 'new' | 'confirm') => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handlePasswordChange = async () => {
    if (!currentPassword) {
      toast.error("Current password is required");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await updatePassword(newPassword);
      if (error) {
        throw error;
      }
      toast.success("Password updated successfully");
      // Reset form
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Error updating password:", error);
      toast.error("Failed to update password. Please check your current password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6">
      <div className="flex flex-col gap-3 md:min-w-64">
        <h1 className="text-2xl font-bold">Password</h1>
        <p className="text-sm text-muted-foreground">
          Update your password to keep your account secure
        </p>
      </div>

      <Card className="w-full shadow-sm">
        <CardHeader className="pb-4 space-y-1">
          <div className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-primary" />
            <CardTitle className="text-xl">Password Settings</CardTitle>
          </div>
          <CardDescription>
            We recommend using a strong, unique password that you don&apos;t use elsewhere
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Current Password Field */}
          <div className="space-y-2">
            <Label htmlFor="current-password" className="font-medium">
              Current Password
            </Label>
            <div className="relative">
              <Input
                id="current-password"
                type={showPassword.current ? "text" : "password"}
                placeholder="Enter your current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => toggleShowPassword('current')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword.current ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* New Password Field */}
          <div className="space-y-2">
            <Label htmlFor="new-password" className="font-medium">
              New Password
            </Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showPassword.new ? "text" : "password"}
                placeholder="Choose a strong password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={`pr-10 ${
                  newPassword
                    ? passwordStrength.strength === "weak"
                      ? "border-red-500 focus-visible:ring-red-500"
                      : passwordStrength.strength === "medium"
                      ? "border-amber-500 focus-visible:ring-amber-500"
                      : "border-green-500 focus-visible:ring-green-500"
                    : ""
                }`}
              />
              <button
                type="button"
                onClick={() => toggleShowPassword('new')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword.new ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Password Strength Indicator */}
            {newPassword && (
              <div className="mt-2">
                <div className="flex items-center gap-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      passwordStrength.strength === "weak"
                        ? "bg-red-500 w-1/3"
                        : passwordStrength.strength === "medium"
                        ? "bg-amber-500 w-2/3"
                        : "bg-green-500 w-full"
                    }`}
                  />
                </div>
                <p
                  className={`text-xs mt-1 ${
                    passwordStrength.strength === "weak"
                      ? "text-red-600"
                      : passwordStrength.strength === "medium"
                      ? "text-amber-600"
                      : "text-green-600"
                  }`}
                >
                  {passwordStrength.message}
                </p>
              </div>
            )}

            {/* Password Requirements */}
            <div className="space-y-1 mt-2">
              <p className="text-xs text-gray-500">Password should contain:</p>
              <ul className="text-xs space-y-1">
                <li className={`flex items-center gap-1 ${newPassword.length >= 8 ? "text-green-600" : "text-gray-500"}`}>
                  {newPassword.length >= 8 ? (
                    <Check size={12} className="text-green-600" />
                  ) : (
                    <AlertCircle size={12} />
                  )}
                  At least 8 characters
                </li>
                <li className={`flex items-center gap-1 ${/[A-Z]/.test(newPassword) ? "text-green-600" : "text-gray-500"}`}>
                  {/[A-Z]/.test(newPassword) ? (
                    <Check size={12} className="text-green-600" />
                  ) : (
                    <AlertCircle size={12} />
                  )}
                  Upper case letters (A-Z)
                </li>
                <li className={`flex items-center gap-1 ${/[a-z]/.test(newPassword) ? "text-green-600" : "text-gray-500"}`}>
                  {/[a-z]/.test(newPassword) ? (
                    <Check size={12} className="text-green-600" />
                  ) : (
                    <AlertCircle size={12} />
                  )}
                  Lower case letters (a-z)
                </li>
                <li className={`flex items-center gap-1 ${/\d/.test(newPassword) ? "text-green-600" : "text-gray-500"}`}>
                  {/\d/.test(newPassword) ? (
                    <Check size={12} className="text-green-600" />
                  ) : (
                    <AlertCircle size={12} />
                  )}
                  Numbers (0-9)
                </li>
                <li className={`flex items-center gap-1 ${/[!@#$%^&*(),.?":{}|<>]/.test(newPassword) ? "text-green-600" : "text-gray-500"}`}>
                  {/[!@#$%^&*(),.?":{}|<>]/.test(newPassword) ? (
                    <Check size={12} className="text-green-600" />
                  ) : (
                    <AlertCircle size={12} />
                  )}
                  Special characters (!@#$%...)
                </li>
              </ul>
            </div>
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <Label htmlFor="confirm-password" className="font-medium">
              Confirm New Password
            </Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showPassword.confirm ? "text" : "password"}
                placeholder="Confirm your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`pr-10 ${
                  confirmPassword
                    ? passwordsMatch
                      ? "border-green-500 focus-visible:ring-green-500"
                      : "border-red-500 focus-visible:ring-red-500"
                    : ""
                }`}
              />
              <button
                type="button"
                onClick={() => toggleShowPassword('confirm')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {confirmPassword && !passwordsMatch && (
              <p className="text-xs text-red-600 mt-1">
                Passwords do not match
              </p>
            )}
          </div>
        </CardContent>

        <CardFooter className="border-t pt-6 flex justify-end">
          <Button
            onClick={handlePasswordChange}
            disabled={
              isLoading || 
              !currentPassword || 
              !newPassword || 
              !confirmPassword || 
              !passwordsMatch || 
              passwordStrength.strength === "weak"
            }
            className="min-w-24"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Updating...</span>
              </div>
            ) : (
              "Update Password"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}