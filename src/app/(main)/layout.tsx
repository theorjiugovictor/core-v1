'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Boxes, LayoutDashboard, Lightbulb, Settings, ShoppingCart, UtensilsCrossed } from 'lucide-react';

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
import { Logo } from '@/components/logo';
import { Separator } from '@/components/ui/separator';
import { mockUser } from '@/lib/data';
import { Header } from '@/components/header';
import { UserNav } from '@/components/user-nav';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/inventory', icon: Boxes, label: 'Inventory' },
  { href: '/recipes', icon: UtensilsCrossed, label: 'Recipes' },
  { href: '/sales', icon: ShoppingCart, label: 'Sales' },
  { href: '/insights', icon: Lightbulb, label: 'Insights' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

const pageTitles: { [key: string]: string } = {
  '/dashboard': 'Dashboard',
  '/inventory': 'Ingredient Inventory',
  '/recipes': 'Meal Recipes',
  '/sales': 'Sales Records',
  '/insights': 'Business Insights',
  '/settings': 'Settings',
};

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
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
                  <SidebarMenuButton
                  asChild
                  isActive={pathname.startsWith(item.href)}
                  tooltip={item.label}
                  >
                  <Link href={item.href}>
                      <item.icon />
                      <span>{item.label}</span>
                  </Link>
                  </SidebarMenuButton>
              </SidebarMenuItem>
              ))}
          </SidebarMenu>
          </SidebarContent>
          <Separator className="my-2" />
          <SidebarFooter>
          <UserNav />
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
