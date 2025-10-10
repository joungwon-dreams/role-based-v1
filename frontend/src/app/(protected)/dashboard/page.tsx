'use client';

import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    // Body content - max-width: 1132px (Figma spec)
    <div style={{ maxWidth: '1132px', width: '100%' }}>
      {/* gap: 24px between rows */}
      <div className="flex flex-col" style={{ gap: '24px' }}>

        {/* Row 1: 1132px x 214px, gap 24px */}
        <div className="flex" style={{ gap: '24px', height: '214px' }}>
          {/* Left Content: 720px x 166px */}
          <div className="flex flex-col justify-center" style={{ width: '720px', height: '166px', gap: '16px' }}>
            <h2 className="text-3xl font-bold">Welcome back, {user?.name || user?.email?.split('@')[0]} 👋🏻</h2>
            <p className="text-muted-foreground">
              Your progress this week is Awesome. let's keep it up and get a lot of points reward!
            </p>
          </div>

          {/* Divider */}
          <div style={{ width: '0px' }}></div>

          {/* Card: 364px x 150px */}
          <Card style={{ width: '364px', height: '150px' }}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Revenue Growth</p>
                  <p className="text-3xl font-bold">$32.5k</p>
                  <div className="flex items-center gap-1 text-sm text-green-600">
                    <TrendingUp className="h-4 w-4" />
                    <span>+72.80%</span>
                  </div>
                </div>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Row 2: 1132px x 394px, gap 24px */}
        <div className="flex" style={{ gap: '24px', height: '394px' }}>
          {/* Topic you are interested: 746px x 394px */}
          <Card style={{ width: '746px', height: '394px' }}>
            <CardHeader>
              <CardTitle>Topic you are interested in</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {['UI Design', 'UX Design', 'Music', 'Photography', '3D Design', 'Programming'].map((topic) => (
                  <div key={topic} className="p-4 border rounded-lg hover:bg-accent cursor-pointer">
                    <p className="font-medium">{topic}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Popular Instructors: 362px x 394px */}
          <Card style={{ width: '362px', height: '394px' }}>
            <CardHeader>
              <CardTitle>Popular Instructors</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { name: 'Jordan Stevenson', students: '1.2k', courses: '24' },
                { name: 'Jennifer Walsh', students: '1.1k', courses: '18' },
                { name: 'Allie Grater', students: '980', courses: '21' },
              ].map((instructor) => (
                <div key={instructor.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-muted"></div>
                    <div>
                      <p className="font-medium text-sm">{instructor.name}</p>
                      <p className="text-xs text-muted-foreground">{instructor.students} Students</p>
                    </div>
                  </div>
                  <Badge variant="secondary">{instructor.courses} Courses</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Row 3: 1132px x 416px, gap 24px - 3 equal cards */}
        <div className="flex" style={{ gap: '24px', height: '416px' }}>
          {/* Top Courses: 361.33px x 416px */}
          <Card style={{ width: 'calc((100% - 48px) / 3)', height: '416px' }}>
            <CardHeader>
              <CardTitle>Top Courses</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { name: 'Photoshop Editing Course', students: '1.2k', progress: 85 },
                { name: 'Full Stack Development', students: '890', progress: 70 },
                { name: 'UI/UX Design Fundamentals', students: '1.5k', progress: 92 },
              ].map((course) => (
                <div key={course.name} className="space-y-2">
                  <div className="flex justify-between">
                    <p className="text-sm font-medium">{course.name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 flex-1 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${course.progress}%` }}></div>
                    </div>
                    <span className="text-xs text-muted-foreground">{course.progress}%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{course.students} Students</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Upcoming Webinar: 361.33px x 416px */}
          <Card style={{ width: 'calc((100% - 48px) / 3)', height: '416px' }}>
            <CardContent className="p-6 space-y-4">
              <div className="aspect-video bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg"></div>
              <div>
                <h3 className="font-semibold mb-2">Next.js Advanced Patterns</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Learn advanced patterns and best practices for Next.js 14
                </p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>📅 Tomorrow, 2:00 PM</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assignment Progress: 361.33px x 416px */}
          <Card style={{ width: 'calc((100% - 48px) / 3)', height: '416px' }}>
            <CardHeader>
              <CardTitle>Assignment Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { title: 'User Interface Design', dueDate: '12/12/2023', progress: 90 },
                { title: 'React Components', dueDate: '15/12/2023', progress: 65 },
                { title: 'API Integration', dueDate: '18/12/2023', progress: 45 },
              ].map((assignment) => (
                <div key={assignment.title} className="space-y-2">
                  <div className="flex justify-between">
                    <p className="text-sm font-medium">{assignment.title}</p>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${assignment.progress}%` }}></div>
                  </div>
                  <p className="text-xs text-muted-foreground">Due: {assignment.dueDate}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
