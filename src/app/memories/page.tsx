'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Container } from '@/components/Container';
import { RequireAuth } from '@/components/RequireAuth';

type Memory = {
  id: string;
  title: string;
  body: string | null;
  created_at: string;
};

export default function MemoriesPage() {
  const [items, setItems] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError(null);

      // (nav jāņem user_id — RLS jau sargā, ka saņemsi tikai savas rindas)
      const { data, error } = await supabase
        .from('memories')
        .select('id, title, body, created_at')
        .order('created_at', { ascending: false });

      if (!active) return;
      if (error) {
        setError(error.message);
      } else {
        setItems(data ?? []);
      }
      setLoading(false);
    }

    load();
    // ja lietotājs izlogojas/ielogojas — dzēs sarakstu
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      setItems([]);
      setLoading(true);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return (
    <RequireAuth>
      <Container className="py-16">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">My memories</h1>
          <Link href="/memories/new" className="inline-flex text-sm text-blue-600 hover:underline">
            + New memory
          </Link>
        </div>

        {loading && <p className="text-sm text-gray-600">Loading…</p>}
        {error && <p className="text-sm text-red-600">Failed to load memories: {error}</p>}

        {!loading && !error && items.length === 0 && (
          <p className="text-sm text-gray-600">
            You have no memories yet.{' '}
            <Link href="/memories/new" className="text-blue-600 hover:underline">
              Create your first.
            </Link>
          </p>
        )}

        <ul className="space-y-3">
          {items.map((m) => (
            <li key={m.id} className="rounded-lg border p-4">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-base font-semibold">
                  <Link href={`/memories/${m.id}`} className="hover:underline">
                    {m.title}
                  </Link>
                </h2>
                <time dateTime={m.created_at} className="shrink-0 text-xs text-gray-500">
                  {new Date(m.created_at).toLocaleString()}
                </time>
              </div>
              {m.body ? <p className="mt-2 text-sm text-gray-700 line-clamp-3">{m.body}</p> : null}
              {/* Vēlāk: link uz /memories/[id] detalizētu skatu */}
            </li>
          ))}
        </ul>
      </Container>
    </RequireAuth>
  );
}
