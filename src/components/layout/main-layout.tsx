
"use client";

import React from 'react';
import { PageHeader } from "./page-header";
import { TooltipProvider } from "@/components/ui/tooltip"; // Keep if other tooltips are used, remove if only for sidebar

interface MainLayoutProps {
  children: React.ReactNode;
  pageTitle: string;
  headerActions?: React.ReactNode;
  showDate?: boolean; // Added prop
}

export function MainLayout({ children, pageTitle, headerActions, showDate = false }: MainLayoutProps) {
  return (
    // If tooltips are used elsewhere in PageHeader or children, wrap with <TooltipProvider>
    // For now, assuming TooltipProvider was mainly for the sidebar.
    // <TooltipProvider> 
    <div className="min-h-screen flex flex-col bg-background">
      <PageHeader title={pageTitle} showDate={showDate}>
        {headerActions}
      </PageHeader>
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        {children}
      </main>
    </div>
    // </TooltipProvider>
  );
}
