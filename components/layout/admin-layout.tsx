import React from 'react';
import Link from 'next/link';
import { Shield, Users, BookOpen, BarChart3, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const menuItems = [
    { icon: BarChart3, label: 'Dashboard', href: '/admin' },
    { icon: BarChart3, label: 'Content Moderation', href: '#uploads' },
    { icon: BookOpen, label: 'Lessons', href: '#lessons' },
    { icon: BookOpen, label: 'Subjects', href: '#subjects' },
    { icon: Users, label: 'Users', href: '#users' },
    { icon: Users, label: 'Moderators', href: '#moderators' },
  ];

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
      {/* Sidebar */}
      <aside className="w-64 bg-blue-900 dark:bg-blue-950 border-r border-blue-800 overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-blue-100 dark:bg-blue-700 p-2 rounded-lg">
              <Shield className="h-6 w-6 text-blue-900 dark:text-blue-100" />
            </div>
            <div>
              <h1 className="font-bold text-white text-lg">Admin Panel</h1>
              <p className="text-xs text-blue-200">Faculty Hub</p>
            </div>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-blue-100 hover:bg-blue-800 transition-colors group"
                >
                  <Icon className="h-5 w-5 text-blue-200 group-hover:text-blue-100" />
                  <span className="text-sm font-medium">{item.label}</span>
                </a>
              );
            })}
          </nav>
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-blue-800">
          <Button
            variant="outline"
            className="w-full text-blue-100 border-blue-700 hover:bg-blue-800"
            onClick={async () => {
              await fetch('/api/auth/signout', { method: 'POST' });
              window.location.href = '/';
            }}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
