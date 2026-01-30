import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import MainLayout from './main-layout';

export default async function Layout({ children }: { children: React.ReactNode }) {
    const session = await auth();

    if (!session?.user) {
        redirect('/login');
    }

    return (
        <MainLayout user={session.user}>
            {children}
        </MainLayout>
    );
}
