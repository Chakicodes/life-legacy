import Link from 'next/link';
import { Container } from './Container';
import { AuthStatus } from '@/components/AuthStatus';

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur">
      <Container className="h-16 flex items-center justify-between">
        <Link href="/" className="text-base font-semibold tracking-tight">
          Life&nbsp;Legacy
        </Link>

        <nav className="flex items-center gap-4">
          <Link href="/pricing" className="text-sm text-gray-600 hover:text-gray-900">
            Pricing
          </Link>
          <Link href="/about" className="text-sm text-gray-600 hover:text-gray-900">
            About
          </Link>
          <AuthStatus />
        </nav>
      </Container>
    </header>
  );
}
