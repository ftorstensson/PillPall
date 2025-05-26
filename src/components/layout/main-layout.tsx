
"use client";

import React from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
  SidebarRail,
} from "@/components/ui/sidebar";
import { SidebarNav } from "./sidebar-nav";
import { PageHeader } from "./page-header";

interface MainLayoutProps {
  children: React.ReactNode;
  pageTitle: string;
  headerActions?: React.ReactNode;
}

export function MainLayout({ children, pageTitle, headerActions }: MainLayoutProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar collapsible="icon" variant="sidebar" side="left">
        <SidebarNav />
        <SidebarRail />
      </Sidebar>
      <SidebarInset className="min-h-screen">
        <PageHeader title={pageTitle}>
          {headerActions}
        </PageHeader>
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </SidebarInset>
    </