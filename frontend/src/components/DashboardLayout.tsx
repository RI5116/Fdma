'use client';

import { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 p-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden mb-4 px-4 py-2 bg-red-600 text-white rounded"
          >
            Open Menu
          </button>
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
}