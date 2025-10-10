'use client';

import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, BookOpen, TrendingUp, Award } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();

  const stats = [
    {
      title: 'Total Students',
      value: '2,845',
      description: '+12% from last month',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    },
    {
      title: 'Active Courses',
      value: '48',
      description: '8 new courses this month',
      icon: BookOpen,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
    },
    {
      title: 'Course Completion',
      value: '87%',
      description: '+5% from last month',
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
    },
    {
      title: 'Certificates Issued',
      value: '1,234',
      description: '+18% from last month',
      icon: Award,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Welcome back, {user?.name || user?.email}!</h2>
        <p className="text-muted-foreground">Here's what's happening with your academy today.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`${stat.bgColor} rounded-full p-2`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your academy's latest updates and activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: 'John Doe', action: 'completed', course: 'Advanced React Patterns', time: '2 hours ago' },
                { name: 'Jane Smith', action: 'enrolled in', course: 'TypeScript Masterclass', time: '4 hours ago' },
                { name: 'Mike Johnson', action: 'started', course: 'Next.js Full Stack', time: '6 hours ago' },
                { name: 'Sarah Williams', action: 'completed', course: 'UI/UX Design Basics', time: '8 hours ago' },
              ].map((activity, i) => (
                <div key={i} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      {activity.name} <span className="text-muted-foreground">{activity.action}</span>
                    </p>
                    <p className="text-sm text-muted-foreground">{activity.course}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Your Profile</CardTitle>
            <CardDescription>Account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="text-base">{user?.email}</p>
            </div>
            {user?.name && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Name</p>
                <p className="text-base">{user.name}</p>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-muted-foreground">Roles</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {user?.roles.map((role) => (
                  <Badge key={role} variant="secondary">
                    {role}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Permissions</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {user?.permissions.map((permission) => (
                  <Badge key={permission} variant="outline">
                    {permission}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
