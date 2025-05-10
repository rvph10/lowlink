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
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import {
  IconUserCircle,
  IconCreditCard,
  IconBell,
  IconLogout,
  IconMoon,
  IconSun,
  IconSettings,
  IconHelpCircle,
  IconDeviceDesktop,
  IconDotsVertical,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { UserAvatarProfile } from "@/components/user-avatar-profile";
import { cn } from "@/lib/utils";

function UserSidebarFooter() {
  // Mock user with additional properties
  const { user } = {
    user: {
      name: "John Doe",
      email: "john.doe@example.com",
      imageUrl: "https://github.com/shadcn.png",
      emailAddresses: [{ emailAddress: "john.doe@example.com" }],
      plan: "free",
      role: "admin",
      createdAt: "2023-01-15T00:00:00Z",
    },
  };

  const router = useRouter();
  const [theme, setTheme] = React.useState<"light" | "dark" | "system">(
    "system",
  );

  // Helper to format the joined date
  const formatJoinedDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      year: "numeric",
    }).format(date);
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
                      className="h-8 w-8 rounded-lg"
                      showInfo={false}
                      user={user}
                    />
                  </div>
                )}
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-medium leading-none truncate">
                    {user?.name}
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
                      className="h-11 w-11 rounded-lg"
                      showInfo={false}
                      user={user}
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium leading-none">
                        {user?.name}
                      </p>
                      {user?.role && (
                        <Badge variant="secondary" className="text-xs">
                          {user.role}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {user?.email}
                    </p>
                    <div className="flex items-center gap-1 mt-2">
                      <Badge
                        variant={user.plan === "free" ? "outline" : "default"}
                        className={cn(
                          "text-xs rounded-full capitalize px-2 py-0.5",
                          user.plan === "pro" &&
                            "bg-purple-100 text-purple-800",
                          user.plan === "enterprise" &&
                            "bg-blue-100 text-blue-800",
                        )}
                      >
                        {user.plan} plan
                      </Badge>
                      {user.plan === "free" && (
                        <button className="text-xs font-medium text-blue-600 hover:underline">
                          Upgrade
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  Joined {formatJoinedDate(user.createdAt)}
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            {/* Account Section */}
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={() => router.push("/dashboard/profile")}
                className="gap-2"
              >
                <IconUserCircle className="h-4 w-4" />
                Profile
                <DropdownMenuShortcut>⇧P</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push("/dashboard/billing")}
                className="gap-2"
              >
                <IconCreditCard className="h-4 w-4" />
                Billing
                <DropdownMenuShortcut>⇧B</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push("/dashboard/notifications")}
                className="gap-2"
              >
                <IconBell className="h-4 w-4" />
                Notifications
                <DropdownMenuShortcut>⇧N</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            {/* Settings Section */}
            <DropdownMenuGroup>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <IconSettings className="mr-2 h-4 w-4" />
                  <span>Appearance</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuRadioGroup
                    value={theme}
                    onValueChange={(value) =>
                      setTheme(value as "light" | "dark" | "system")
                    }
                  >
                    <DropdownMenuRadioItem value="light" className="gap-2">
                      <IconSun className="h-4 w-4" />
                      Light
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="dark" className="gap-2">
                      <IconMoon className="h-4 w-4" />
                      Dark
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="system" className="gap-2">
                      <IconDeviceDesktop className="h-4 w-4" />
                      System
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuItem
                onClick={() => router.push("/dashboard/settings")}
              >
                <IconSettings className="mr-2 h-4 w-4" />
                Settings
                <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/support")}>
                <IconHelpCircle className="mr-2 h-4 w-4" />
                Help & Support
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            {/* Sign Out */}
            <DropdownMenuItem
              onClick={() => router.push("/auth/sign-in")}
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
