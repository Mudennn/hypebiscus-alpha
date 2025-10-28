'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { WalletDeepAnalysis } from '@/components/smart-money';
import {
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { IconArrowLeft } from '@tabler/icons-react';

export default function TrackerDetailsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [walletAddress, setWalletAddress] = useState<string>('');

  useEffect(() => {
    const address = searchParams.get('address');
    if (address) {
      setWalletAddress(address);
    }
  }, [searchParams]);

  const handleBackClick = () => {
    router.push('/tracker');
  };

  if (!walletAddress) {
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
            <Card>
              <CardHeader>
                <CardTitle>No Wallet Selected</CardTitle>
                <CardDescription>
                  Please provide a wallet address in the URL or go back to the tracker page.
                </CardDescription>
                <div className="pt-4">
                  <Button onClick={handleBackClick} variant="outline">
                    <IconArrowLeft className="h-4 w-4 mr-2" />
                    Back to Tracker
                  </Button>
                </div>
              </CardHeader>
            </Card>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

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
          {/* Header with Back Button */}
          <div className="flex items-center gap-4">
            <Button onClick={handleBackClick} variant="outline" size="sm">
              <IconArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h2 className="text-2xl font-bold">Wallet Analysis</h2>
              <p className="text-sm text-muted-foreground font-mono">
                {walletAddress}
              </p>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <WalletDeepAnalysis walletAddress={walletAddress} />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
