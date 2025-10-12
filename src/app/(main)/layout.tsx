'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Boxes, Home, LayoutDashboard, Lightbulb, Package, Settings, ShoppingCart, Users, Truck } from 'lucide-react';

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
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Logo } from '@/components/logo';
import { Separator } from '@/components/ui/separator';
import { mockUser } from '@/lib/data';
import { cn } from '@/lib/utils';
import { Header } from '@/components/header';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/inventory', icon: Boxes, label: 'Inventory' },
  { href: '/sales', icon: ShoppingCart, label: 'Sales' },
  { href: '/insights', icon: Lightbulb, label: 'Insights' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

const pageTitles: { [key: string]: string } = {
  '/dashboard': 'Dashboard',
  '/inventory': 'Inventory Management',
  '/sales': 'Sales Records',
  '/insights': 'Business Insights',
  '/settings': 'Settings',
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const getInitials = (name: string) => {
    const names = name.split(' ');
    return names.map((n) => n[0]).join('').toUpperCase();
  };
  
  const title = pageTitles[pathname] || 'CORE Biz Manager';

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 p-2">
            <Logo />
            <div className="flex flex-col">
              <span className="font-semibold text-lg leading-none tracking-tight">{mockUser.businessName}</span>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href} legacyBehavior passHref>
                  <SidebarMenuButton
                    isActive={pathname.startsWith(item.href)}
                    tooltip={item.label}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <Separator className="my-2" />
        <SidebarFooter>
          <div className={cn("flex items-center gap-3 p-2 transition-all duration-200")}>
            <Avatar className="h-9 w-9">
              <AvatarImage src={mockUser.avatarUrl} alt={`@${mockUser.name}`} data-ai-hint="user avatar" />
              <AvatarFallback>{getInitials(mockUser.name)}</AvatarFallback>
            </Avatar>
            <div className={cn("flex flex-col transition-opacity duration-200 group-data-[collapsible=icon]:opacity-0")}>
                <span className="text-sm font-medium text-foreground">{mockUser.name}</span>
                <span className="text-xs text-muted-foreground">{mockUser.email}</span>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <div className="flex flex-col">
            <Header title={title}/>
            <main className="flex-1 overflow-auto p-4 sm:px-6 sm:py-0">
                {children}
            </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
