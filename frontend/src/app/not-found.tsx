import Link from 'next/link';
import { Button } from '../ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900">404</h1>
        <h2 className="mt-4 text-2xl font-semibold text-gray-700">Page Not Found</h2>
        <p className="mt-2 text-gray-600">
          The page you are looking for does not exist.
        </p>
        <div className="mt-8">
          <Link href="/">
            <Button>Go Home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}