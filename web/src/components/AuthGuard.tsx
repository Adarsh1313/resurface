'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const hydrate = useAuthStore((s) => s.hydrate);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    hydrate();
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/login');
    } else {
      setChecked(true);
    }
  }, [hydrate, router]);

  if (!checked) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-gray-500">Loading...</div>
    );
  }
  return <>{children}</>;
}
