"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Save } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useProfile } from "@/context/profile-context";
import { useEffect } from "react";
import { toast } from "sonner";

import ProfilePictureUpload from "@/components/settings/ProfilePictureUpload";
import UsernameField from "@/components/settings/UsernameField";
import EmailField from "@/components/settings/EmailField";
import PasswordSettings from "@/components/settings/PasswordSettings";
import DangerZone from "@/components/settings/DangerZone";
import { useProfileForm } from "@/hooks/useProfileForm";
import { User } from "@supabase/supabase-js";

export default function SettingsPage() {
  const { user, profile, isLoading } = useAuth();
  const {
    isUpdating,
    updateProfile,
    updateEmail,
  } = useProfile();

  const {
    email, setEmail,
    fullName, setFullName,
    username, setUsername,
    previewImage, setPreviewImage,
    hasChanges, setHasChanges,
    isAvailable, setIsAvailable,
    usernameError, setUsernameError,
    handleDiscardChanges
  } = useProfileForm(user as User, profile);

  // Track form changes
  useEffect(() => {
    if (
      email !== user?.email ||
      fullName !== profile?.full_name ||
      username !== profile?.username ||
      previewImage
    ) {
      setHasChanges(true);
    } else {
      setHasChanges(false);
    }
  }, [email, fullName, username, previewImage, user, profile, setHasChanges]);

  const handleSaveChanges = async () => {
    // First, save profile info (name, username)
    if (fullName !== profile?.full_name || username !== profile?.username) {
      const { error: profileError } = await updateProfile({
        full_name: fullName || undefined,
        username: username || undefined,
      });

      if (profileError) {
        toast.error("Failed to update profile information");
        return;
      }
    }

    // Then, save email if it has changed
    if (email !== user?.email) {
      const { error: emailError } = await updateEmail(email || "");

      if (emailError) {
        toast.error("Failed to update email address");
        return;
      }
    }

    // Reset the changes state
    setHasChanges(false);
    
    toast.success("Changes saved successfully", {
      description: "Your profile has been updated"
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Profile Section */}
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex flex-col gap-3 md:min-w-64">
          <h1 className="text-2xl font-bold">Profile</h1>
          <p className="text-sm text-muted-foreground">
            Manage your personal information and account settings
          </p>
        </div>

        <Card className="w-full shadow-sm">
          <CardHeader className="pb-4 space-y-1">
            <CardTitle className="text-xl">Personal Information</CardTitle>
            <CardDescription>
              Update your profile details and contact information
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="flex flex-col gap-8">
              {/* Profile picture field */}
              <ProfilePictureUpload 
                profile={profile}
                isLoading={isLoading}
                previewImage={previewImage}
                setPreviewImage={setPreviewImage}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name Field */}
                <div className="flex flex-col gap-3">
                  <label htmlFor="fullName" className="font-medium">
                    Full Name
                  </label>
                  <div className="relative">
                    <input
                      id="fullName"
                      type="text"
                      placeholder="Enter your full name"
                      value={fullName || ""}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                </div>

                {/* Username Field */}
                <UsernameField 
                  username={username}
                  setUsername={setUsername}
                  profile={profile}
                  isLoading={isLoading}
                  isAvailable={isAvailable}
                  setIsAvailable={setIsAvailable}
                  usernameError={usernameError}
                  setUsernameError={setUsernameError}
                />

                {/* Email Field */}
                <EmailField
                  email={email}
                  setEmail={setEmail}
                  user={user}
                  isLoading={isLoading}
                />
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-between border-t pt-6 mt-4">
            {hasChanges && (
              <Button
                variant="outline"
                onClick={handleDiscardChanges}
                disabled={isLoading || isUpdating}
              >
                Discard changes
              </Button>
            )}
            <Button
              disabled={
                isLoading ||
                isUpdating ||
                !hasChanges ||
                (username !== profile?.username && !isAvailable)
              }
              onClick={handleSaveChanges}
              className={cn(
                "transition-all ml-auto",
                !hasChanges ||
                  isLoading ||
                  isUpdating ||
                  (username !== profile?.username && !isAvailable)
                  ? "opacity-70"
                  : "opacity-100"
              )}
            >
              {isLoading || isUpdating ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save size={16} />
                  <span>Save Changes</span>
                </div>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Password Settings Section */}
      <PasswordSettings />

      {/* Danger Zone Section */}
      <DangerZone />
    </div>
  );
}