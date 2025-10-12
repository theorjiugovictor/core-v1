import { SidebarTrigger } from '@/components/ui/sidebar';
import { UserNav } from './user-nav';

interface HeaderProps {
    title: string;
}

export function Header({ title }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
        <SidebarTrigger className="sm:hidden" />
        <div className="flex items-center gap-4">
            <h1 className="font-headline text-xl font-semibold md:text-2xl">{title}</h1>
        </div>
        <div className="ml-auto hidden items-center gap-4 sm:flex">
            <UserNav />
        </div>
    </header>
  );
}
