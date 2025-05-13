"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { UserCircle, Loader2, XCircle, CheckCircle, AlertCircle, Clock } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { useProfile } from "@/context/profile-context";
import { debounce } from "lodash";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { validateUsername as checkUsername } from "@/utils/usernameValidator";
import { Database } from "@/utils/supabase/types/database.types";

interface UsernameFieldProps {
  username: string | null | undefined;
  setUsername: (username: string) => void;
  profile: Database["public"]["Tables"]["profiles"]["Row"] | null;
  isLoading: boolean;
  isAvailable: boolean | null;
  setIsAvailable: (isAvailable: boolean | null) => void;
  usernameError: string;
  setUsernameError: (error: string) => void;
}

export default function UsernameField({
  username,
  setUsername,
  profile,
  isLoading,
  isAvailable,
  setIsAvailable,
  usernameError,
  setUsernameError,
}: UsernameFieldProps) {
  const { getUsernameExists } = useAuth();
  const { canChangeUsername } = useProfile();

  const [isChecking, setIsChecking] = useState(false);
  const [newUsername, setNewUsername] = useState<string | null>(null);
  const [initialUsername, setInitialUsername] = useState<string | null>(null);
  const [usernameChangeStatus, setUsernameChangeStatus] = useState<{
    canChange: boolean;
    daysLeft: number | null;
  }>({ canChange: true, daysLeft: null });

  // Set initial username and check username change status
  useEffect(() => {
    if (profile?.username !== undefined) {
      setInitialUsername(profile?.username);
    }

    // Check username change status
    if (canChangeUsername) {
      setUsernameChangeStatus(canChangeUsername());
    }
  }, [profile, canChangeUsername]);

  // Basic username validation
  const validateUsername = async (value: string): Promise<boolean> => {
    // First check if user can change username
    if (!usernameChangeStatus.canChange && value !== initialUsername) {
      setUsernameError(
        `You can only change your username once every 7 days. Please wait ${usernameChangeStatus.daysLeft} more day${
          usernameChangeStatus.daysLeft === 1 ? "" : "s"
        }.`
      );
      return false;
    }
  
    if (!value) {
      setUsernameError("Username is required");
      return false;
    }
  
    if (value.length < 3) {
      setUsernameError("Username must be at least 3 characters");
      return false;
    }
  
    if (!/^[a-zA-Z0-9_]+$/.test(value)) {
      setUsernameError(
        "Username can only contain letters, numbers, and underscores"
      );
      return false;
    }
    
    // Check for prohibited usernames and patterns
    const { isValid, reason } = checkUsername(value);
    if (!isValid) {
      setUsernameError(reason || "This username is not allowed");
      return false;
    }
  
    setUsernameError("");
    return true;
  };

  // Debounced function to check username availability
  const checkUsernameAvailability = debounce(async (value: string) => {
    // If username hasn't changed from profile, skip check
    if (value === initialUsername) {
      setIsAvailable(true);
      setIsChecking(false);
      return;
    }

    // If on cooldown, don't even check availability
    if (!usernameChangeStatus.canChange) {
      setIsAvailable(false);
      setIsChecking(false);
      return;
    }

    if (!validateUsername(value)) {
      setIsAvailable(false);
      setIsChecking(false);
      return;
    }

    try {
      const { count, error } = await getUsernameExists(value);

      if (error) throw error;

      setIsAvailable(count === 0);
      if (count && count > 0) {
        setUsernameError("Username is already taken");
      }
    } catch (err) {
      console.error("Error checking username:", err);
      setUsernameError("Error checking availability");
      setIsAvailable(false);
    } finally {
      setIsChecking(false);
    }
  }, 500);

  const handleUsernameChange = (value: string) => {
    setUsername(value);
  
    // If user is on cooldown and trying to change username, don't allow
    if (!usernameChangeStatus.canChange && value !== initialUsername) {
      setIsAvailable(false);
      setUsernameError(
        `You can only change your username once every 7 days. Please wait ${usernameChangeStatus.daysLeft} more day${
          usernameChangeStatus.daysLeft === 1 ? "" : "s"
        }.`
      );
      return;
    }
  
    setIsChecking(true);
    setIsAvailable(null);
  
    // Skip empty values
    if (!value.trim()) {
      setIsChecking(false);
      setIsAvailable(false);
      setUsernameError("Username is required");
      return;
    }

    // Start the debounced check
    checkUsernameAvailability(value);
  };

  // Format the date of the last username change
  const formatLastUsernameChange = () => {
    if (!profile?.username_updated_at) return null;

    const date = new Date(profile.username_updated_at);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Label htmlFor="username" className="font-medium">
          Username
        </Label>

        {/* Cooldown indicator */}
        {!usernameChangeStatus.canChange && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1 text-amber-500">
                  <Clock size={14} />
                  <span className="text-xs font-medium">
                    {usernameChangeStatus.daysLeft} day
                    {usernameChangeStatus.daysLeft === 1 ? "" : "s"}{" "}
                    left
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  You can change your username once every 7 days.
                </p>
                <p className="text-xs mt-1">
                  Last changed: {formatLastUsernameChange()}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      {isLoading ? (
        <>
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-4 w-48 mt-1" />
        </>
      ) : (
        <>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              <UserCircle size={18} />
            </div>
            <Input
              id="username"
              type="text"
              placeholder="Choose a username"
              value={username || ""}
              onChange={(e) => {
                setNewUsername(e.target.value);
                handleUsernameChange(e.target.value);
              }}
              className={cn(
                "pl-10 py-6 bg-background transition-all border-input hover:border-primary/50 focus-visible:ring-1",
                isChecking ? "pr-12" : "",
                !isChecking && isAvailable === false
                  ? "border-red-500 focus-visible:ring-red-500"
                  : "",
                !isChecking && isAvailable === true
                  ? "border-green-500 focus-visible:ring-green-500"
                  : "",
                !usernameChangeStatus.canChange &&
                  username !== initialUsername
                  ? "opacity-50"
                  : ""
              )}
              disabled={
                !usernameChangeStatus.canChange &&
                username !== initialUsername
              }
            />

            {/* Username validation indicator */}
            {isChecking && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-primary">
                <Loader2 size={18} className="animate-spin" />
              </div>
            )}
            {!isChecking && isAvailable === false && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500">
                <XCircle size={18} />
              </div>
            )}
            {!isChecking && isAvailable === true && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
                <CheckCircle size={18} />
              </div>
            )}

            {/* Cooldown overlay */}
            {!usernameChangeStatus.canChange &&
              username !== initialUsername && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-500">
                  <AlertCircle size={18} />
                </div>
              )}
          </div>

          {/* Username error or helper text */}
          {usernameError ? (
            <p className="text-xs text-red-600 mt-1 ml-1">
              {usernameError}
            </p>
          ) : !usernameChangeStatus.canChange ? (
            <p className="text-xs text-amber-600 mt-1 ml-1">
              You can change your username again in{" "}
              {usernameChangeStatus.daysLeft} day
              {usernameChangeStatus.daysLeft === 1 ? "" : "s"}.
              {formatLastUsernameChange() &&
                ` Last changed: ${formatLastUsernameChange()}`}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground ml-1">
              This will be used for your profile URL:{" "}
              {profile?.username ? (
                newUsername ? (
                  <span className="text-primary hover:underline">
                    lowlink.app/view/{newUsername}
                  </span>
                ) : (
                  <Link
                    href={`view/${profile?.username}`}
                    className="text-primary hover:underline"
                  >
                    lowlink.app/view/{profile?.username}
                  </Link>
                )
              ) : (
                "username"
              )}
            </p>
          )}
        </>
      )}
    </div>
  );
}