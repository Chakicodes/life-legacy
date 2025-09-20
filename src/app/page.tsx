import { Container } from '@/components/Container';
import { Button } from '@/components/Button';

export default function Page() {
  return (
    <Container className="py-16">
      <div className="space-y-6">
        <h1 className="text-3xl font-semibold tracking-tight">Hello Tailwind 👋</h1>
        <p className="text-gray-600">
          Šī ir tava web-MVP bāze. Tālāk pievienosim autentifikāciju un “Memory” veidošanu.
        </p>
        <div className="flex gap-3">
          <Button>Get started</Button>
          <Button variant="secondary">Learn more</Button>
        </div>
      </div>
    </Container>
  );
}
