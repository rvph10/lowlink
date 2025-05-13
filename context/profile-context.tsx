"use client";

import { createClient } from "@/utils/supabase/client";
import { createContext, useContext, useState, ReactNode } from "react";
import { toast } from "sonner";
import { useAuth } from "@/context/auth-context";

type ProfileContextType = {
  isUpdating: boolean;
  updateProfile: (profileData: {
    full_name?: string;
    username?: string;
  }) => Promise<{ error: Error | null }>;
  updateEmail: (newEmail: string) => Promise<{ error: Error | null }>;
  sendVerificationEmail: () => Promise<{ error: Error | null }>;
  uploadProfilePicture: (
    file: File | null,
    cropSettings?: { x: number; y: number; scale: number },
  ) => Promise<{ url: string | null; error: Error | null }>;
  removeProfilePicture: () => Promise<{ error: Error | null }>;
  canChangeUsername: () => { canChange: boolean; daysLeft: number | null };
};

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

type ProfileUpdateData = {
  full_name?: string;
  username?: string;
  username_updated_at?: string;
};

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user, profile, getUserProfile } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const supabase = createClient();

  /**
   * Check if user can change their username (7-day cooldown period)
   */
  const canChangeUsername = () => {
    if (!profile?.username_updated_at) {
      // No previous change, can change anytime
      return { canChange: true, daysLeft: null };
    }

    const lastChanged = new Date(profile.username_updated_at);
    const now = new Date();
    const diffTime = now.getTime() - lastChanged.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays >= 7) {
      return { canChange: true, daysLeft: null };
    } else {
      return { canChange: false, daysLeft: 7 - diffDays };
    }
  };

  /**
   * Helper function to extract storage path from public URL
   */
  const extractPathFromUrl = (url: string | null): string | null => {
    if (!url) return null;

    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split("/");
      // Look for the part after "profile-pictures/"
      const bucketIndex = pathParts.findIndex(
        (part) => part === "profile-pictures",
      );
      if (bucketIndex !== -1 && bucketIndex < pathParts.length - 1) {
        return pathParts.slice(bucketIndex + 1).join("/");
      }
    } catch (e) {
      console.error("Error parsing URL:", e);
    }

    return null;
  };

  /**
   * Helper function to delete an existing profile picture
   */
  const deleteExistingProfilePicture = async (): Promise<{
    error: Error | null;
  }> => {
    if (!user || !profile?.profile_picture_url) {
      return { error: null }; // No picture to delete
    }

    try {
      const path = extractPathFromUrl(profile.profile_picture_url);

      if (path) {
        const { error } = await supabase.storage
          .from("profile-pictures")
          .remove([path]);

        if (error) {
          console.warn("Failed to delete old profile picture:", error);
          // Continue anyway - this shouldn't block the upload process
        }
      }

      return { error: null };
    } catch (err) {
      console.error("Error in deleteExistingProfilePicture:", err);
      return { error: err as Error };
    }
  };

  /**
   * Helper function to apply crop to image
   */
  const applyCropToImage = async (
    imageUrl: string,
    cropSettings: { x: number; y: number; scale: number },
    targetSize = 400,
  ): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";

      img.onload = () => {
        // Create canvas
        const canvas = document.createElement("canvas");
        canvas.width = targetSize;
        canvas.height = targetSize;
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          console.error("Could not get canvas context");
          resolve(null);
          return;
        }

        // Calculate scaling factors based on image dimensions
        const size = Math.min(img.width, img.height);
        const scale = cropSettings.scale;
        const scaledSize = size / scale;

        // Adjusted x and y to be centered
        const centerX = img.width / 2;
        const centerY = img.height / 2;
        const x = centerX - scaledSize / 2 + cropSettings.x;
        const y = centerY - scaledSize / 2 + cropSettings.y;

        // Draw circular crop
        ctx.save();
        ctx.beginPath();
        ctx.arc(
          canvas.width / 2,
          canvas.height / 2,
          canvas.width / 2,
          0,
          Math.PI * 2,
        );
        ctx.clip();

        // Draw the image with crop transformation
        ctx.drawImage(
          img,
          x,
          y,
          scaledSize,
          scaledSize,
          0,
          0,
          canvas.width,
          canvas.height,
        );

        ctx.restore();

        // Convert to blob
        canvas.toBlob(
          (blob) => {
            resolve(blob);
          },
          "image/jpeg",
          0.9,
        );
      };

      img.onerror = () => {
        console.error("Failed to load image for cropping");
        resolve(null);
      };

      img.src = imageUrl;
    });
  };

  /**
   * Update profile information (name, username)
   */
  const updateProfile = async (profileData: ProfileUpdateData) => {
    if (!user) {
      return { error: new Error("User not authenticated") };
    }

    setIsUpdating(true);
    let error = null;

    try {
      // Check if username is being changed
      const isUsernameChanged =
        profileData.username !== undefined &&
        profileData.username !== profile?.username;

      // Apply username change cooldown check
      if (isUsernameChanged) {
        const { canChange, daysLeft } = canChangeUsername();

        if (!canChange) {
          throw new Error(
            `You can only change your username once every 7 days. Please wait ${daysLeft} more day${daysLeft === 1 ? "" : "s"}.`,
          );
        }

        // Add the timestamp for username change
        profileData = {
          ...profileData,
          username_updated_at: new Date().toISOString(),
        };
      }

      const { error: updateError } = await supabase
        .from("profiles")
        .update(profileData)
        .eq("id", user.id);

      error = updateError;

      if (!error) {
        // Refresh the profile data in the auth context
        await getUserProfile();

        if (isUsernameChanged) {
          toast.success("Username updated! You can change it again in 7 days.");
        } else {
          toast.success("Profile updated successfully");
        }
      } else {
        console.error("Error updating profile:", updateError);
        throw new Error(updateError?.message || "Failed to update profile");
      }
    } catch (err) {
      error = err as Error;
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsUpdating(false);
    }

    return { error };
  };

  /**
   * Update email address
   */
  const updateEmail = async (newEmail: string) => {
    if (!user) {
      return { error: new Error("User not authenticated") };
    }

    setIsUpdating(true);
    let error = null;

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        email: newEmail,
      });

      error = updateError;

      if (!error) {
        toast.success(
          "Email update initiated. Please check your inbox to confirm.",
        );
      }
    } catch (err) {
      error = err as Error;
      toast.error("Failed to update email");
    } finally {
      setIsUpdating(false);
    }

    return { error };
  };

  /**
   * Send verification email
   */
  const sendVerificationEmail = async () => {
    if (!user) {
      return { error: new Error("User not authenticated") };
    }

    setIsUpdating(true);
    let error = null;

    try {
      const { error: emailError } = await supabase.auth.resend({
        type: "signup",
        email: user.email || "",
      });

      error = emailError;

      if (!error) {
        toast.success("Verification email sent. Please check your inbox.");
      }
    } catch (err) {
      error = err as Error;
      toast.error("Failed to send verification email");
    } finally {
      setIsUpdating(false);
    }

    return { error };
  };

  /**
   * Upload and process profile picture
   */
  const uploadProfilePicture = async (
    file: File | null,
    cropSettings?: { x: number; y: number; scale: number },
  ) => {
    if (!user || !file) {
      return {
        url: null,
        error: new Error("User not authenticated or no file provided"),
      };
    }

    setIsUpdating(true);
    let error: Error | null = null;
    let url: string | null = null;

    try {
      // Verify that the profile exists first
      if (!profile) {
        throw new Error("Profile not found. Please refresh and try again.");
      }

      // Process the image with crop settings if provided
      let fileToUpload: File | Blob = file;
      if (cropSettings) {
        const fileUrl = URL.createObjectURL(file);
        const croppedBlob = await applyCropToImage(fileUrl, cropSettings);
        URL.revokeObjectURL(fileUrl); // Clean up
        if (croppedBlob) {
          fileToUpload = new File([croppedBlob], file.name, {
            type: "image/jpeg",
            lastModified: Date.now(),
          });
        } else {
          console.warn("Failed to crop image, uploading original");
        }
      }

      // Delete existing profile picture if present
      await deleteExistingProfilePicture();

      // Generate a unique file path
      const filePath = `${user.id}/${Date.now()}-${file.name.split(" ").join("_")}`;

      // Upload the processed image to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("profile-pictures")
        .upload(filePath, fileToUpload, {
          upsert: true,
        });

      if (uploadError) {
        // Supabase error objects may be empty or lack a message
        const errMsg =
          uploadError.message ||
          JSON.stringify(uploadError) ||
          "Unknown upload error";
        throw new Error(`Supabase upload failed: ${errMsg}`);
      }

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from("profile-pictures")
        .getPublicUrl(filePath);
      url = urlData.publicUrl;

      // Update the profile with the new image URL
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ profile_picture_url: url })
        .eq("id", user.id)
        .select();

      if (updateError) {
        const errMsg =
          updateError.message ||
          JSON.stringify(updateError) ||
          "Unknown update error";
        console.error("Error updating profile:", updateError);
        throw new Error(`Profile update failed: ${errMsg}`);
      }

      // Refresh the profile data
      await getUserProfile();
      toast.success("Profile picture updated successfully");
    } catch (err: unknown) {
      // Robust error handling for all error types
      let errMsg = "Unknown error";
      if (err instanceof Error) {
        errMsg = err.message;
      } else if (typeof err === "string") {
        errMsg = err;
      } else if (err && typeof err === "object") {
        errMsg = JSON.stringify(err);
      }
      error = new Error(errMsg);
      console.error("Upload error (robust):", err);
      toast.error(`Failed to update profile picture: ${errMsg}`);
    } finally {
      setIsUpdating(false);
    }

    return { url, error };
  };

  /**
   * Remove profile picture
   */
  const removeProfilePicture = async () => {
    if (!user) {
      return { error: new Error("User not authenticated") };
    }

    setIsUpdating(true);
    let error = null;

    try {
      // Verify that the profile exists first
      if (!profile) {
        throw new Error("Profile not found. Please refresh and try again.");
      }

      // Delete the file from storage first
      await deleteExistingProfilePicture();

      // Update the profile to remove the profile picture URL
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ profile_picture_url: null })
        .eq("id", user.id)
        .select();

      if (updateError) {
        console.error("Error updating profile:", updateError);
        throw updateError;
      }

      // Refresh the profile data
      await getUserProfile();
      toast.success("Profile picture removed");
    } catch (err) {
      error = err as Error;
      toast.error(`Failed to remove profile picture: ${error.message}`);
    } finally {
      setIsUpdating(false);
    }

    return { error };
  };

  const value = {
    isUpdating,
    updateProfile,
    updateEmail,
    sendVerificationEmail,
    uploadProfilePicture,
    removeProfilePicture,
    canChangeUsername,
  };

  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);

  if (context === undefined) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }

  return context;
}
