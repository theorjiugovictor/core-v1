'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Boxes, LayoutDashboard, Lightbulb, Package, Settings, ShoppingCart, HelpCircle, TrendingDown, Sparkles } from 'lucide-react';

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
  SidebarGroup,
  SidebarGroupLabel,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/logo';
import { Header } from '@/components/header';
import { User } from 'next-auth';

const mainNav = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/materials', icon: Boxes, label: 'Inventory' },
  { href: '/products', icon: Package, label: 'Products' },
  { href: '/sales', icon: ShoppingCart, label: 'Sales' },
  { href: '/expenses', icon: TrendingDown, label: 'Expenses' },
];

const intelligenceNav = [
  { href: '/insights', icon: Sparkles, label: 'Insights' },
  { href: '/ideas', icon: Lightbulb, label: 'Ideas & Strategy' },
];

const supportNav = [
  { href: '/help', icon: HelpCircle, label: 'Help & Guides' },
];

const allNav = [...mainNav, ...intelligenceNav, ...supportNav];

const pageTitles: { [key: string]: string } = {
  '/dashboard': 'Dashboard',
  '/materials': 'Inventory',
  '/products': 'Products',
  '/sales': 'Sales',
  '/expenses': 'Expenses',
  '/ideas': 'Ideas & Strategy',
  '/insights': 'Insights',
  '/settings': 'Settings',
  '/help': 'Help & Guides',
};

export default function MainLayout({ children, user }: { children: React.ReactNode; user: User }) {
  const pathname = usePathname();

  const deriveTitle = (path: string) => {
    for (const item of allNav) {
      if (path.startsWith(item.href)) return pageTitles[item.href];
    }
    if (path.startsWith('/settings')) return pageTitles['/settings'];
    return 'CORE';
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="px-4 py-4 border-b border-sidebar-border">
          <Logo size={28} />
        </SidebarHeader>

        <SidebarContent className="px-2 py-3">
          <SidebarGroup>
            <SidebarGroupLabel className="px-2 mb-1 text-xs font-medium text-muted-foreground/60 uppercase tracking-wider">
              Business
            </SidebarGroupLabel>
            <SidebarMenu>
              {mainNav.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={pathname.startsWith(item.href)} tooltip={item.label}>
                    <Link href={item.href}>
                      <item.icon className="w-4 h-4" />
                      <span className="text-sm">{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>

          <SidebarGroup className="mt-4">
            <SidebarGroupLabel className="px-2 mb-1 text-xs font-medium text-muted-foreground/60 uppercase tracking-wider">
              Intelligence
            </SidebarGroupLabel>
            <SidebarMenu>
              {intelligenceNav.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={pathname.startsWith(item.href)} tooltip={item.label}>
                    <Link href={item.href}>
                      <item.icon className="w-4 h-4" />
                      <span className="text-sm">{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>

          <SidebarGroup className="mt-4">
            <SidebarMenu>
              {supportNav.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={pathname.startsWith(item.href)} tooltip={item.label}>
                    <Link href={item.href}>
                      <item.icon className="w-4 h-4" />
                      <span className="text-sm">{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="px-2 py-3 border-t border-sidebar-border">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname.startsWith('/settings')} tooltip="Settings">
                <Link href="/settings">
                  <Settings className="w-4 h-4" />
                  <span className="text-sm">Settings</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <div className="flex flex-col h-[100dvh] overflow-hidden">
          <Header title={deriveTitle(pathname)} user={user} />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
