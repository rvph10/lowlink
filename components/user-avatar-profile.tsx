import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { useAuth } from "@/context/auth-context";

interface UserAvatarProfileProps {
  className?: string;
  showInfo?: boolean;
  user: User | null;
}

export function UserAvatarProfile({
  className,
  showInfo = false,
  user,
}: UserAvatarProfileProps) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [svgString, setSvgString] = useState<string | null>(null);

  const { profile, isLoading } = useAuth();

  // Extract display information
  const displayName =
    profile?.full_name || profile?.username || user?.email?.split("@")[0] || "";
  const email = user?.email || "";

  // Set avatar URL and SVG when profile data changes
  useEffect(() => {
    if (profile?.profile_picture_url) {
      setAvatarUrl(profile.profile_picture_url);
      setSvgString(null);
    } else if (profile?.profile_picture_svg) {
      setAvatarUrl(null);
      setSvgString(profile.profile_picture_svg);
    } else {
      setAvatarUrl(null);
      setSvgString(null);
    }
  }, [profile]);

  // Create an SVG data URL for the Avatar component when using SVG
  const svgDataUrl = svgString
    ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`
    : null;

  return (
    <div className="flex items-center gap-2">
      <Avatar className={className}>
        {/* Custom uploaded avatar or SVG avatar */}
        <AvatarImage src={avatarUrl || svgDataUrl || ""} alt={displayName} />

        {/* Fallback if no avatar is available */}
        <AvatarFallback className="rounded-full">
          {isLoading ? (
            <div className="animate-pulse h-full w-full bg-gray-200"></div>
          ) : (
            displayName.slice(0, 2).toUpperCase() ||
            email.slice(0, 2).toUpperCase() ||
            "U"
          )}
        </AvatarFallback>
      </Avatar>

      {showInfo && (
        <div className="grid flex-1 text-left text-sm leading-tight">
          <span className="truncate font-semibold">{displayName}</span>
          <span className="truncate text-xs">{email}</span>
        </div>
      )}
    </div>
  );
}
