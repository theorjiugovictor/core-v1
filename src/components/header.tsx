import { SidebarTrigger } from '@/components/ui/sidebar';
import { UserNav } from './user-nav';
import { User } from 'next-auth';

interface HeaderProps {
  title: string;
  user: User;
}

export function Header({ title, user }: HeaderProps) {
  return (
    <header className="flex h-16 shrink-0 items-center gap-4 border-b bg-background px-4 sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 sm:py-4">
      <SidebarTrigger className="sm:hidden" />
      <div className="flex items-center gap-4">
        <h1 className="font-headline text-xl font-semibold md:text-2xl">{title}</h1>
      </div>
      <div className="ml-auto flex items-center gap-4">
        <UserNav user={user} />
      </div>
    </header>
  );
}
