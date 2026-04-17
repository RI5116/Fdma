'use client';

import Link from 'next/link';
import { useAuth } from '../hooks/useAuth';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user } = useAuth();

  if (!user) return null;

  const menuItems = [
    { name: 'Dashboard', href: '/dashboard', permission: 'dashboard' },
    { name: 'Users', href: '/dashboard/users', permission: 'users' },
    { name: 'Vendors', href: '/dashboard/vendors', permission: 'vendors' },
    { name: 'Drivers', href: '/dashboard/drivers', permission: 'drivers' },
    { name: 'Drug Tests', href: '/dashboard/drug-tests', permission: 'drugTests' },
    { name: 'Reports', href: '/dashboard/reports', permission: 'reports' },
    { name: 'Settings', href: '/dashboard/settings', permission: 'settings' },
  ];

  const filteredItems = menuItems.filter(item => user.permissions[item.permission as keyof typeof user.permissions]);

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0 md:static md:inset-0`}
      style={{ backgroundColor: 'var(--teal)' }}
    >
      <div className="flex items-center justify-between p-4">
        <h2 className="text-white text-lg font-semibold">Menu</h2>
        <button onClick={onClose} className="md:hidden text-white">×</button>
      </div>
      <nav className="mt-8">
        <ul className="space-y-2 px-4">
          {filteredItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="block px-4 py-2 text-white hover:bg-opacity-20 hover:bg-white rounded"
                onClick={onClose}
              >
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}