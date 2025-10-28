"use client";

import * as React from "react";
// import Link from "next/link";
import {
  // IconChartBar,
  IconDashboard,
  IconTrendingUp,
  // IconShieldCheck,
  // IconStar,
} from "@tabler/icons-react";

import { NavMain } from "@/components/nav-main";
// import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  // SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Image from "next/image";

const data = {
  user: {
    name: "Alpha Trader",
    email: "trader@solana.ai",
    avatar: "/avatars/default.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Smart Money",
      url: "/tracker",
      icon: IconTrendingUp,
    },
    // {
    //   title: "Token Health",
    //   url: "/health",
    //   icon: IconShieldCheck,
    // },
    // {
    //   title: "Analytics",
    //   url: "#",
    //   icon: IconChartBar,
    // },
    // {
    //   title: "Watchlist",
    //   url: "#",
    //   icon: IconStar,
    // },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="data-[slot=sidebar-menu-button]:!p-0 h-[32px] hover:bg-transparent">
              <div className="w-full h-full flex items-center justify-left overflow-hidden">
                <Image
                  src="/logo.png"
                  alt="Hypebiscus Alpha"
                  width={72}
                  height={72}
                  className="w-auto h-full object-contain"
                  unoptimized
                />
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      {/* <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter> */}
    </Sidebar>
  );
}
