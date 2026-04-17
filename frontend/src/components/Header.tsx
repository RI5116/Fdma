'use client';

import Link from 'next/link';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../ui/Button';

export function Header() {
  const { user, signOut } = useAuth();

  return (
    <header className="text-white p-4" style={{ backgroundColor: 'var(--dark-blue)' }}>
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold">FMDA Portal</h1>
        <nav className="flex items-center space-x-4">
          {user ? (
            <>
              <span>Welcome, {user.firstName}</span>
              <Link href="/logout">
                <Button variant="secondary" size="sm">Logout</Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="secondary" size="sm">Login</Button>
              </Link>
              <Link href="/register">
                <Button variant="secondary" size="sm">Register</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}