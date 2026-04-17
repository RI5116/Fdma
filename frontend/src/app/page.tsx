import Link from 'next/link';
import { Button } from '../ui/Button';

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          FMDA Drug Testing Portal
        </h1>
        <div className="space-x-4">
          <Link href="/login">
            <Button>Login</Button>
          </Link>
          <Link href="/register">
            <Button variant="secondary">Register</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
