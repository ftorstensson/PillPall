
"use client";
import React, { useState, useEffect } from 'react';
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MOCK_USER_PROFILE } from "@/lib/constants";
import { LogOut, Users, Settings, Home } from "lucide-react"; // Added Users, Settings, Home
import Link from 'next/link';

interface PageHeaderProps {
  title: string;
  children?: React.ReactNode;
  showDate?: boolean;
}

export function PageHeader({ title, children, showDate = false }: PageHeaderProps) {
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    if (showDate) {
      const date = new Date();
      const options: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' };
      setCurrentDate(new Intl.DateTimeFormat('en-US', options).format(date));
    }
  }, [showDate]);

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between h-16 px-4 bg-background/80 backdrop-blur-sm border-b">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="md:hidden" />
        <div>
          <h1 className="text-xl font-semibold">{title}</h1>
          {showDate && currentDate && <p className="text-xs text-muted-foreground">{currentDate}</p>}
        </div>
      </div>
      <div className="flex items-center gap-4">
        {children}
        <UserMenu />
      </div>
    </header>
  );
}

function UserMenu() {
  const user = MOCK_USER_PROFILE;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative w-8 h-8 rounded-full">
          <Avatar className="w-8 h-8">
            <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="profile person" />
            <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/settings">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/helpers"> {/* Assuming /helpers is family sharing */}
            <Users className="w-4 h-4 mr-2" />
            Family sharing
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <LogOut className="w-4 h-4 mr-2" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
