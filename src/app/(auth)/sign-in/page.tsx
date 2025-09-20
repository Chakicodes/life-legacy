'use client';

import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { useState } from 'react';
import { Container } from '@/components/Container';
import { Button } from '@/components/Button';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!email || !password) return;

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    window.location.href = '/';
  }

  return (
    <Container className="py-16">
      <div className="mx-auto max-w-md space-y-6">
        <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <Button type="submit" className="w-full">
            Continue
          </Button>
        </form>

        <p className="text-sm text-gray-600">
          Don’t have an account?{' '}
          <Link href="/sign-up" className="text-blue-600 hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </Container>
  );
}
