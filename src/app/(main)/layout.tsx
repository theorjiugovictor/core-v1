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
  { href: '/materials', icon: Boxes, label: 'Materials' },
  { href: '/products', icon: UtensilsCrossed, label: 'Products' },
  { href: '/sales', icon: ShoppingCart, label: 'Sales' },
  { href: '/insights', icon: Lightbulb, label: 'Insights' },
];

const pageTitles: { [key: string]: string } = {
  '/dashboard': 'Dashboard',
  '/materials': 'Raw Material Inventory',
  '/products': 'Finished Products',
  '/sales': 'Sales Records',
  '/insights': 'Business Insights',
  '/settings': 'Settings',
};

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  const deriveTitle = (path: string) => {
    for (const item of navItems) {
      if (path.startsWith(item.href)) {
        return pageTitles[item.href];
      }
    }
    if (path.startsWith('/settings')) {
        return pageTitles['/settings'];
    }
    return 'CORE Biz Manager';
  };
  
  const title = deriveTitle(pathname);

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
          <SidebarFooter>
            <Separator className="my-2" />
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton
                        asChild
                        isActive={pathname.startsWith('/settings')}
                        tooltip="Settings"
                    >
                        <Link href="/settings">
                            <Settings />
                            <span>Settings</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
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
