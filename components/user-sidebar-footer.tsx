"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuShortcut,
} from "@/components/ui/dropdown-menu";
import {
  IconLogout,
  IconDotsVertical,
  IconSettings,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { UserAvatarProfile } from "@/components/user-avatar-profile";
import { useAuth } from "@/context/auth-context";
import Link from "next/link";

function UserSidebarFooter() {
  const router = useRouter();
  const { user, signOut, profile } = useAuth();

  // Helper to format the joined date
  const formatJoinedDate = (dateString?: string) => {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      year: "numeric",
    }).format(date);
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/login ");
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground hover:bg-sidebar-hover transition-colors pr-3"
            >
              <div className="flex items-center gap-3 w-full">
                {user && (
                  <div className="relative">
                    <UserAvatarProfile
                      className="h-8 w-8 rounded-full"
                      showInfo={false}
                      user={user}
                    />
                  </div>
                )}
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-medium leading-none truncate">
                    {profile?.username || user?.email?.split("@")[0]}
                  </p>
                  <p className="text-xs text-muted-foreground truncate mt-1">
                    {user?.email}
                  </p>
                </div>
                <IconDotsVertical className="size-4 text-muted-foreground" />
              </div>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-64 rounded-lg max-w-[240px]"
            side="top"
            align="end"
            sideOffset={10}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="p-3 space-y-2">
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <UserAvatarProfile
                      className="h-11 w-11 rounded-full"
                      showInfo={false}
                      user={user}
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium leading-none">
                        {profile?.username || user?.email?.split("@")[0]}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {user?.email}
                    </p>
                    <div className="flex items-center gap-1 mt-2">
                      <Badge
                        variant="outline"
                        className="text-xs rounded-full capitalize px-2 py-0.5"
                      >
                        free plan
                      </Badge>
                      <button className="text-xs font-medium text-blue-600 hover:underline">
                        Upgrade
                      </button>
                    </div>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  Joined {formatJoinedDate(user?.created_at)}
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              asChild
              className="cursor-pointer"
              onClick={() => router.push("/dashboard/settings")}
            >
              <Link href="/dashboard/settings">
                <IconSettings className="h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>

            {/* Sign Out */}
            <DropdownMenuItem
              onClick={handleSignOut}
              className="text-rose-500 focus:text-rose-500 gap-2"
            >
              <IconLogout className="h-4 w-4" />
              Sign Out
              <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

export default UserSidebarFooter;
