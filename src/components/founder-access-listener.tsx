'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Secret founder shortcut: Press Cmd+Shift+L (Mac) or Ctrl+Shift+L (Windows/Linux)
 * anywhere on the landing page to quickly open the founder login screen.
 */
export function FounderAccessListener() {
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === 'L' || e.key === 'l')) {
        e.preventDefault();
        router.push('/login');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router]);

  return null;
}
