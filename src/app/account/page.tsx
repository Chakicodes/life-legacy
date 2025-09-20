import Link from 'next/link';
import { Container } from '@/components/Container';
import { RequireAuth } from '@/components/RequireAuth';

export default function AccountPage() {
  return (
    <RequireAuth>
      <Container className="py-16">
        <h1 className="text-2xl font-semibold tracking-tight">Account</h1>
        <p className="mt-2 text-gray-600">Šeit vēlāk rādīsim profila datus, e-pastu, plānu u.c.</p>
        <Link href="/memories/new" className="inline-flex text-sm text-blue-600 hover:underline">
          + New memory
        </Link>
      </Container>
    </RequireAuth>
  );
}
