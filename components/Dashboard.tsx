'use client';

import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import EnhancedChat from '@/components/chatbot/EnhancedChat';
import {
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface DashboardProps {
  userId?: string;
}

export default function Dashboard({ userId = 'demo-user' }: DashboardProps) {
  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 64)',
          '--header-height': 'calc(var(--spacing) * 12)',
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
          {/* Enhanced Chat with Data Panel */}
          <div className="flex-1 overflow-auto lg:overflow-hidden">
            <EnhancedChat />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
