import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Database } from "@/utils/supabase/types/database.types";
import { User } from "@supabase/supabase-js";

export function useProfileForm(user: User, profile: Database["public"]["Tables"]["profiles"]["Row"] | null) {
  const [email, setEmail] = useState<string | undefined | null>(user?.email);
  const [fullName, setFullName] = useState<string | undefined | null>(
    profile?.full_name
  );
  const [username, setUsername] = useState<string | undefined | null>(
    profile?.username
  );
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [usernameError, setUsernameError] = useState("");
  const [initialUsername, setInitialUsername] = useState<string | null>(null);

  // Set initial values
  useEffect(() => {
    if (user?.email !== undefined) setEmail(user?.email);
    if (profile?.full_name !== undefined) setFullName(profile?.full_name);
    if (profile?.username !== undefined) {
      setUsername(profile?.username);
      setInitialUsername(profile?.username);
    }
  }, [user, profile]);

  const handleDiscardChanges = () => {
    if (user?.email !== undefined) setEmail(user?.email);
    if (profile?.full_name !== undefined) setFullName(profile?.full_name);
    if (profile?.username !== undefined) setUsername(profile?.username);
    setPreviewImage(null);
    setHasChanges(false);
    setIsAvailable(null);
    setUsernameError("");

    toast.info("Changes discarded", {
      description: "Your changes have been discarded",
    });
  };

  return {
    email,
    setEmail,
    fullName,
    setFullName,
    username,
    setUsername,
    previewImage,
    setPreviewImage,
    hasChanges,
    setHasChanges,
    isAvailable,
    setIsAvailable,
    usernameError,
    setUsernameError,
    initialUsername,
    setInitialUsername,
    handleDiscardChanges
  };
}