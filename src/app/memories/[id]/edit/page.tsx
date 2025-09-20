'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Container } from '@/components/Container';
import { RequireAuth } from '@/components/RequireAuth';
import { Button } from '@/components/Button';

export default function EditMemoryPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id as string;

  const [title, setTitle] = useState('');
  const [body, setBody] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);

      // ielādējam esošo ierakstu (RLS pasargā, ka piekļūst tikai īpašnieks)
      const { data, error } = await supabase
        .from('memories')
        .select('title, body')
        .eq('id', id)
        .maybeSingle();

      if (!active) return;
      if (error) {
        alert(error.message);
        setLoading(false);
        return;
      }
      if (!data) {
        alert('Memory not found or no access.');
        router.replace('/memories');
        return;
      }

      setTitle(data.title ?? '');
      setBody(data.body ?? '');
      setLoading(false);
    }

    if (id) load();
    return () => {
      active = false;
    };
  }, [id, router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    setSaving(true);
    const { error } = await supabase.from('memories').update({ title, body }).eq('id', id);

    setSaving(false);

    if (error) {
      alert(error.message);
      return;
    }
    router.push(`/memories/${id}`);
  }

  if (loading) {
    return (
      <RequireAuth>
        <Container className="py-16">
          <p className="text-sm text-gray-600">Loading…</p>
        </Container>
      </RequireAuth>
    );
  }

  return (
    <RequireAuth>
      <Container className="py-16">
        <div className="mb-6 flex items-center justify-between">
          <Link href={`/memories/${id}`} className="text-sm text-blue-600 hover:underline">
            ← Back
          </Link>
          <div className="text-sm text-gray-500">Editing</div>
        </div>

        <form onSubmit={onSubmit} className="mx-auto max-w-2xl space-y-4">
          <div className="space-y-1">
            <label htmlFor="title" className="text-sm font-medium">
              Title
            </label>
            <input
              id="title"
              className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="body" className="text-sm font-medium">
              Message
            </label>
            <textarea
              id="body"
              className="min-h-[160px] w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Save changes'}
            </Button>
            <Link href={`/memories/${id}`} className="text-sm text-gray-600 hover:underline">
              Cancel
            </Link>
          </div>
        </form>
      </Container>
    </RequireAuth>
  );
}
