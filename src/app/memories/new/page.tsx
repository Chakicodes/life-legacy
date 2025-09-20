'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Container } from '@/components/Container';
import { Button } from '@/components/Button';

export default function NewMemoryPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    setSubmitting(true);

    // paņemam aktīvo lietotāju
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();
    if (userErr || !user) {
      alert('Please sign in first.');
      setSubmitting(false);
      return;
    }

    const { error } = await supabase.from('memories').insert({
      user_id: user.id,
      title,
      body,
    });

    setSubmitting(false);

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    // pēc veiksmīgas izveides varam aiziet uz “Account” vai nākotnē uz detail skatu
    router.push('/account');
  }

  return (
    <Container className="py-16">
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-2xl font-semibold tracking-tight">New Memory</h1>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="title" className="text-sm font-medium">
              Title
            </label>
            <input
              id="title"
              className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Piem., “Vēstule dēlam 18. dzimšanas dienā”"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="body" className="text-sm font-medium">
              Message (optional)
            </label>
            <textarea
              id="body"
              className="min-h-[160px] w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ko tu gribētu pateikt…"
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </div>

          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? 'Saving…' : 'Save Memory'}
          </Button>
        </form>
      </div>
    </Container>
  );
}
