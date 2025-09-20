'use client';

import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button } from '@/components/Button';

type Session = Awaited<ReturnType<typeof supabase.auth.getSession>>['data']['session'];

export function AuthStatus() {
  const [session, setSession] = useState<Session>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1) paņemam sākotnējo sesiju
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    // 2) klausāmies izmaiņas (sign in/out)
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  async function onSignOut() {
    await supabase.auth.signOut();
    // pēc izrakstīšanās — atpakaļ uz sākumlapu
    window.location.href = '/';
  }

  if (loading) {
    // neliels “skelets” — var arī nerādīt vispār
    return <div className="text-sm text-gray-500">…</div>;
  }

  if (!session) {
    // nav ielogots → rādam Sign in
    return <Button href="/sign-in">Sign in</Button>;
  }

  // ielogots → rādām Account + Sign out
  return (
    <div className="flex items-center gap-2">
      <Link href="/account" className="text-sm text-gray-700 hover:text-gray-900">
        Account
      </Link>
      <Button onClick={onSignOut} variant="secondary">
        Sign out
      </Button>
    </div>
  );
}
