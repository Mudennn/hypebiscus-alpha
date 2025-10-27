'use client';

import { useState } from 'react';
import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import TokenHealthScore from '@/components/TokenHealthScore';
import {
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function HealthPage() {
  const [tokenAddress, setTokenAddress] = useState(
    '0xd2DD7b597Fd2435b6dB61ddf48544fd931e6869F'
  );
  const [inputAddress, setInputAddress] = useState(tokenAddress);

  const handleAddressSubmit = () => {
    if (inputAddress.trim()) {
      setTokenAddress(inputAddress.trim());
    }
  };

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
          {/* Header Card */}
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4">
                <div>
                  <CardTitle className="text-3xl">Token Health Analysis</CardTitle>
                  <CardDescription>
                    Analyze token liquidity, holder distribution, and risk metrics
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={inputAddress}
                    onChange={(e) => setInputAddress(e.target.value)}
                    placeholder="Enter token address..."
                    className="flex-1"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleAddressSubmit();
                      }
                    }}
                  />
                  <Button onClick={handleAddressSubmit}>Load</Button>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Main Content */}
          <div className="flex-1">
            <TokenHealthScore tokenAddress={tokenAddress} />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
