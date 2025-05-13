"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Mail, CheckCircle, XCircle } from "lucide-react";
import { useProfile } from "@/context/profile-context";
import { User } from "@supabase/supabase-js";

interface EmailFieldProps {
  email: string | null | undefined;
  setEmail: (email: string) => void;
  user: User | null;
  isLoading: boolean;
}

export default function EmailField({
  email,
  setEmail,
  user,
  isLoading,
}: EmailFieldProps) {
  const { isUpdating, sendVerificationEmail } = useProfile();

  return (
    <div className="flex flex-col gap-3 md:col-span-2">
      <Label htmlFor="email" className="font-medium">
        Email Address
      </Label>
      {isLoading ? (
        <>
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-8 w-32 mt-1" />
        </>
      ) : (
        <>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              <Mail size={18} />
            </div>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email || ""}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 py-6 bg-background transition-all border-input hover:border-primary/50 focus-visible:ring-1"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Badge
                variant="outline"
                className={cn(
                  "flex items-center gap-1 py-1 transition-all",
                  user?.email_confirmed_at
                    ? "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800"
                    : "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800"
                )}
              >
                {user?.email_confirmed_at ? (
                  <>
                    <CheckCircle
                      size={14}
                      className="fill-green-100 dark:fill-transparent"
                    />
                    <span>Verified</span>
                  </>
                ) : (
                  <>
                    <XCircle
                      size={14}
                      className="fill-red-100 dark:fill-transparent"
                    />
                    <span>Unverified</span>
                  </>
                )}
              </Badge>
            </div>
          </div>
          {!user?.email_confirmed_at && (
            <div className="flex flex-col gap-2 mt-1">
              <p className="text-xs text-red-600 ml-1">
                Please verify your email address to unlock all features
              </p>
              <Button
                variant="outline"
                size="sm"
                className="self-start"
                onClick={() => sendVerificationEmail()}
                disabled={isUpdating}
              >
                Resend verification email
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
