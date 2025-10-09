'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/signin');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !user) {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push('/signin');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <Button onClick={handleLogout} variant="outline">
            Logout
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Welcome, {user.email}!</CardTitle>
            <CardDescription>User information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500">User ID</p>
              <p className="text-base">{user.userId}</p>
            </div>
            {user.name && (
              <div>
                <p className="text-sm font-medium text-gray-500">Name</p>
                <p className="text-base">{user.name}</p>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-gray-500">Email</p>
              <p className="text-base" data-testid="user-email">{user.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Roles</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {user.roles.map((role) => (
                  <span
                    key={role}
                    className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded"
                  >
                    {role}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Permissions</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {user.permissions.map((permission) => (
                  <span
                    key={permission}
                    className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded"
                  >
                    {permission}
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
