'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

type Session = NonNullable<
  Awaited<ReturnType<typeof supabase.auth.getSession>>['data']['session']
> | null;

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [session, setSession] = useState<Session>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // 1) sākotnējā sesija
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setLoading(false);
      if (!data.session) router.replace('/sign-in');
    });

    // 2) klausāmies izmaiņas
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (!newSession) router.replace('/sign-in');
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [router]);

  if (loading) {
    return <div className="px-4 py-16 text-sm text-gray-500">Loading…</div>;
  }

  if (!session) {
    // īslaicīgi nerādam saturu – notiks redirect uz /sign-in
    return null;
  }

  return <>{children}</>;
}
