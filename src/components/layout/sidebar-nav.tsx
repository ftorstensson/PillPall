"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { NAV_ITEMS, APP_NAME } from "@/lib/constants";
import { Pill } from "lucide-react";

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-6 border-b border-sidebar-border">
        <Pill className="w-8 h-8 text-primary" />
        <h1 className="text-xl font-semibold text-sidebar-foreground group-data-[collapsible=icon]:hidden">
          {APP_NAME}
        </h1>
      </div>
      <SidebarMenu className="flex-1 p-2">
        {NAV_ITEMS.map((item) => (
          <SidebarMenuItem key={item.title}>
            <Link href={item.href} passHref legacyBehavior>
              <SidebarMenuButton
                asChild
                variant="default"
                size="default"
                isActive={pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))}
                tooltip={{ children: item.title, side: "right", align: "center" }}
                className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground"
                
              >
                <a>
                  <item.icon />
                  <span>{item.title}</span>
                </a>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
      {/* Footer can be added here if needed */}
    </div>
  );
}