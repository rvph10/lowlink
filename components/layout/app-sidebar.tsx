"use client";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useMediaQuery } from "@/hooks/use-media-query";
import { IconPhotoUp } from "@tabler/icons-react";
import * as React from "react";
import { OrgSwitcher } from "../org-switcher";
import UserSidebarFooter from "../user-sidebar-footer";
export const company = {
  name: "Acme Inc",
  logo: IconPhotoUp,
  plan: "Enterprise",
};

const tenants = [
  { id: "1", name: "Acme Inc" },
  { id: "2", name: "Beta Corp" },
  { id: "3", name: "Gamma Ltd" },
  { id: "4", name: "Delta Ltd" },
  { id: "5", name: "Epsilon Ltd" },
  { id: "6", name: "Zeta Ltd" },
  { id: "7", name: "Eta Ltd" },
  { id: "8", name: "Theta Ltd" },
  { id: "9", name: "Iota Ltd" },
  { id: "10", name: "Kappa Ltd" },
];

export default function AppSidebar() {
  const { isOpen } = useMediaQuery();
  const handleSwitchTenant = () => {
    console.log("Switching tenant");
  };

  const activeTenant = tenants[0];

  React.useEffect(() => {
    // Side effects based on sidebar state changes
  }, [isOpen]);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <OrgSwitcher
          tenants={tenants}
          defaultTenant={activeTenant}
          onTenantSwitch={handleSwitchTenant}
        />
      </SidebarHeader>
      <SidebarContent className="overflow-x-hidden"></SidebarContent>
      <SidebarFooter>
        <UserSidebarFooter />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
