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
      <SidebarInset
        className="flex flex-col overflow-hidden"
        style={{ height: 'calc(100vh - 1rem)' }}
      >
        <SiteHeader />
        <div className="flex-1 p-4 md:p-6 min-h-0 overflow-hidden">
          {/* Enhanced Chat with Data Panel */}
          <EnhancedChat />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
