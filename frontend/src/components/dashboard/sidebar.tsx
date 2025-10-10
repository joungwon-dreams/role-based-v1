'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  Settings,
  BookOpen,
  GraduationCap,
  BarChart3,
  FileText,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Academy', href: '/dashboard/academy', icon: GraduationCap },
  { name: 'Users', href: '/dashboard/users', icon: Users },
  { name: 'Courses', href: '/dashboard/courses', icon: BookOpen },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Reports', href: '/dashboard/reports', icon: FileText },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen border-r bg-background" style={{ width: '260px' }}>
      {/* Logo - 64px height */}
      <div className="flex items-center border-b px-6" style={{ height: '64px' }}>
        <GraduationCap className="mr-2 h-6 w-6 text-primary" />
        <span className="text-xl font-bold">Academy</span>
      </div>

      {/* Menu Drawer - padding: 12px L/R, 4px T/B */}
      <nav className="space-y-1" style={{ padding: '4px 12px' }}>
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
