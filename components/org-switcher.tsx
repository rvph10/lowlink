"use client";

import {
  Check,
  ChevronsUpDown,
  PlusCircle,
  Search,
  Settings,
} from "lucide-react";
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import Image from "next/image";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

interface Tenant {
  id: string;
  name: string;
  plan?: "free" | "pro" | "enterprise";
  avatarUrl?: string;
  teamSize?: number;
}

export function OrgSwitcher({
  tenants,
  defaultTenant,
  onTenantSwitch,
}: {
  tenants: Tenant[];
  defaultTenant: Tenant;
  onTenantSwitch?: (tenantId: string) => void;
}) {
  const [selectedTenant, setSelectedTenant] = React.useState<Tenant>(
    defaultTenant || (tenants.length > 0 ? tenants[0] : tenants[0]),
  );

  const [searchQuery, setSearchQuery] = React.useState("");

  const filteredTenants = React.useMemo(
    () =>
      searchQuery
        ? tenants.filter((tenant) =>
            tenant.name.toLowerCase().includes(searchQuery.toLowerCase()),
          )
        : tenants,
    [tenants, searchQuery],
  );

  const handleTenantSwitch = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    if (onTenantSwitch) {
      onTenantSwitch(tenant.id);
    }
  };

  // Get badge color based on plan
  const getBadgeVariant = (plan?: string) => {
    switch (plan) {
      case "pro":
        return "secondary";
      case "enterprise":
        return "default";
      default:
        return "outline";
    }
  };

  if (!selectedTenant) {
    return null;
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger className="w-full" asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground hover:bg-sidebar-hover transition-colors"
            >
              <div className="flex flex-row items-center gap-3 w-full leading-none">
                <span className="font-semibold truncate flex-1">
                  {selectedTenant.name}
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge
                    variant={getBadgeVariant(selectedTenant.plan)}
                    className={cn(
                      "rounded-full px-2 text-xs capitalize",
                      selectedTenant.plan === "pro" &&
                        "bg-purple-100 text-purple-800 hover:bg-purple-200",
                      selectedTenant.plan === "enterprise" &&
                        "bg-blue-100 text-blue-800 hover:bg-blue-200",
                    )}
                  >
                    {selectedTenant.plan || "free"}
                  </Badge>
                  <ChevronsUpDown className="size-4 text-muted-foreground" />
                </div>
              </div>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="max-w-[240px] max-h-[50vh] custom-scrollbar"
            align="start"
          >
            <div className="px-2 py-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search organizations..."
                  className="pl-8 h-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                Your organizations
              </DropdownMenuLabel>
              {filteredTenants.map((tenant) => (
                <DropdownMenuItem
                  key={tenant.id}
                  onSelect={() => handleTenantSwitch(tenant)}
                  className={cn(
                    "flex items-center gap-2 py-2",
                    tenant.id === selectedTenant.id && "bg-accent",
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <p className="truncate">{tenant.name}</p>
                    {tenant.teamSize && (
                      <p className="text-xs text-muted-foreground truncate">
                        {tenant.teamSize}{" "}
                        {tenant.teamSize === 1 ? "member" : "members"}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {tenant.plan && tenant.plan !== "free" && (
                      <Badge
                        variant={getBadgeVariant(tenant.plan)}
                        className={cn(
                          "rounded-full text-xs capitalize",
                          tenant.plan === "pro" &&
                            "bg-purple-100 text-purple-800",
                          tenant.plan === "enterprise" &&
                            "bg-blue-100 text-blue-800",
                        )}
                      >
                        {tenant.plan}
                      </Badge>
                    )}
                    {tenant.id === selectedTenant.id && (
                      <Check className="h-4 w-4 text-foreground" />
                    )}
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuItem className="gap-2">
              <PlusCircle className="h-4 w-4" />
              <span>Create new organization</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem className="gap-2 text-muted-foreground">
              <Settings className="h-4 w-4" />
              <span>Manage organizations</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
