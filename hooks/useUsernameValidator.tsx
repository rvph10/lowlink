import { useState } from "react";
import { debounce } from "lodash";
import { createClient } from "@/utils/supabase/client";

// Custom hook for username validation
export function useUsernameValidator() {
  const [username, setUsername] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const supabase = createClient();

  // Basic validation rules
  const validateUsername = (value: string) => {
    if (!value) {
      setErrorMessage("Username is required");
      return false;
    }

    if (value.length < 3) {
      setErrorMessage("Username must be at least 3 characters");
      return false;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(value)) {
      setErrorMessage(
        "Username can only contain letters, numbers, and underscores",
      );
      return false;
    }

    return true;
  };

  // Debounced function to check username availability
  const checkAvailability = debounce(async (value: string) => {
    if (!validateUsername(value)) {
      setIsAvailable(false);
      return;
    }

    setIsChecking(true);
    setErrorMessage("");

    try {
      const { error, count } = await supabase
        .from("profiles")
        .select("username", { count: "exact" })
        .eq("username", value)
        .limit(1);

      if (error) throw error;

      setIsAvailable(count === 0);
      setErrorMessage(count === 0 ? "" : "Username is already taken");
    } catch (err) {
      console.error("Error checking username:", err);
      setErrorMessage("Error checking username availability");
    } finally {
      setIsChecking(false);
    }
  }, 500); // 500ms debounce delay

  const handleUsernameChange = (value: string) => {
    setUsername(value);

    // Reset states for new input
    setIsAvailable(null);

    if (value) {
      checkAvailability(value);
    } else {
      setErrorMessage("");
      setIsAvailable(null);
    }
  };

  return {
    username,
    isChecking,
    isAvailable,
    errorMessage,
    handleUsernameChange,
    validateUsername,
  };
}
