'use client';

import { useState } from 'react';
import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import {
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { IconSearch, IconTrendingUp, IconTrendingDown } from '@tabler/icons-react';

// Hardcoded smart money wallets
const SMART_WALLETS = [
  {
    address: '0xd2DD7b597Fd2435b6dB61ddf48544fd931e6869F',
    label: 'Whale Trader #1',
    category: 'DeFi Degen',
    portfolioValue: 2500000,
    pnl: 450000,
    pnlPercentage: 22.5,
  },
  {
    address: '0x8315177aB297bA92A06054cE80a67Ed4DBd7ed3a',
    label: 'NFT Collector',
    category: 'NFT Specialist',
    portfolioValue: 1800000,
    pnl: -120000,
    pnlPercentage: -6.25,
  },
  {
    address: '0xf7b10d603907658f690da534e9b7dbc4dab3e2d6',
    label: 'Arbitrage Bot',
    category: 'MEV Trader',
    portfolioValue: 5200000,
    pnl: 890000,
    pnlPercentage: 20.6,
  },
  {
    address: '0x7bfee91193d9df2ac0bfe90191d40f23c773c060',
    label: 'VC Portfolio',
    category: 'Blue Chip Holder',
    portfolioValue: 8900000,
    pnl: 1200000,
    pnlPercentage: 15.6,
  },
  {
    address: '0x3e8734ec146c981e3ed1f6b582d447dde701d90c',
    label: 'Memecoin Hunter',
    category: 'Degen',
    portfolioValue: 450000,
    pnl: 180000,
    pnlPercentage: 66.7,
  },
  {
    address: '0x6ff5693b99212da76ad316178a184ab56d299b43',
    label: 'DeFi Yield Farmer',
    category: 'Yield Farmer',
    portfolioValue: 3200000,
    pnl: 420000,
    pnlPercentage: 15.1,
  },
  {
    address: '0x5e2f47bd7d4b357fcfd0bb224eb665773b1b9801',
    label: 'Airdrop Hunter',
    category: 'Airdrop Farmer',
    portfolioValue: 680000,
    pnl: 320000,
    pnlPercentage: 88.9,
  },
  {
    address: '0x64ddc0430eec16dbf928e985177b5a93f4cb3d27',
    label: 'Stablecoin Trader',
    category: 'Conservative',
    portfolioValue: 1500000,
    pnl: 45000,
    pnlPercentage: 3.1,
  },
  {
    address: '0x04d895a70e04f80b4f1a1ab448ee9adf9cd830d0',
    label: 'GameFi Whale',
    category: 'GameFi Player',
    portfolioValue: 920000,
    pnl: 280000,
    pnlPercentage: 43.8,
  },
  {
    address: '0x411d2c093e4c2e69bf0d8e94be1bf13dadd879c6',
    label: 'Smart Contract Dev',
    category: 'Developer',
    portfolioValue: 1100000,
    pnl: 380000,
    pnlPercentage: 52.8,
  },
];

export default function TrackerIndexPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredWallets = SMART_WALLETS.filter(
    (wallet) =>
      wallet.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wallet.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wallet.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to details page with searched address
      router.push(`/tracker/details?address=${searchQuery.trim()}`);
    }
  };

  const handleRowClick = (address: string) => {
    router.push(`/tracker/details?address=${address}`);
  };

  const formatUSD = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
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
                  <CardTitle className="text-3xl">Smart Money Tracker</CardTitle>
                  <CardDescription>
                    Track and analyze top performing crypto wallets
                  </CardDescription>
                </div>
                <form onSubmit={handleSearchSubmit} className="flex gap-2">
                  <div className="relative flex-1">
                    <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by wallet address, name, or category..."
                      className="pl-10"
                    />
                  </div>
                  <Button type="submit">Search</Button>
                </form>
              </div>
            </CardHeader>
          </Card>

          {/* Wallets Table */}
          <Card>
            <div className="p-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Wallet</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Portfolio Value</TableHead>
                    <TableHead className="text-right">Total PnL</TableHead>
                    <TableHead className="text-right">PnL %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredWallets.map((wallet) => (
                    <TableRow
                      key={wallet.address}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleRowClick(wallet.address)}
                    >
                      <TableCell className="font-medium">{wallet.label}</TableCell>
                      <TableCell className="font-mono text-sm text-muted-foreground">
                        {formatAddress(wallet.address)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{wallet.category}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatUSD(wallet.portfolioValue)}
                      </TableCell>
                      <TableCell className="text-right">
                        <span
                          className={
                            wallet.pnl >= 0 ? 'text-green-600' : 'text-red-600'
                          }
                        >
                          {formatUSD(wallet.pnl)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {wallet.pnlPercentage >= 0 ? (
                            <IconTrendingUp className="h-4 w-4 text-green-600" />
                          ) : (
                            <IconTrendingDown className="h-4 w-4 text-red-600" />
                          )}
                          <span
                            className={
                              wallet.pnlPercentage >= 0
                                ? 'text-green-600'
                                : 'text-red-600'
                            }
                          >
                            {wallet.pnlPercentage >= 0 ? '+' : ''}
                            {wallet.pnlPercentage.toFixed(1)}%
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredWallets.length === 0 && (
                <div className="py-12 text-center">
                  <p className="text-muted-foreground">
                    No wallets found matching your search.
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
