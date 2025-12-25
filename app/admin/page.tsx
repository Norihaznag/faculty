'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/lib/auth-context';
import { Shield, Users, BookOpen, BarChart3, CheckCircle, Clock } from 'lucide-react';

type Stats = {
  users: number;
  lessons: number;
  subjects: number;
  uploads: number;
};

type Lesson = {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  difficulty: string;
  views: number;
  subject?: { name: string };
};

export default function AdminPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<Stats>({ users: 0, lessons: 0, subjects: 0, uploads: 0 });
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingLessons, setLoadingLessons] = useState(true);

  // Check authorization
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  // Fetch admin stats
  useEffect(() => {
    if (user) {
      fetchStats();
      fetchLessons();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      const data = await response.json();
      setStats(data.stats || { users: 0, lessons: 0, subjects: 0, uploads: 0 });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchLessons = async () => {
    try {
      const response = await fetch('/api/lessons');
      const data = await response.json();
      setLessons(data.lessons?.slice(0, 10) || []);
    } catch (error) {
      console.error('Error fetching lessons:', error);
    } finally {
      setLoadingLessons(false);
    }
  };

  if (authLoading) {
    return (
      <MainLayout>
        <div className="text-center py-12">Loading...</div>
      </MainLayout>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Admin Dashboard
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your Faculty Hub platform
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.users}</div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Total Lessons
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.lessons}</div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Subjects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.subjects}</div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Uploads
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.uploads}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="lessons" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto">
            <TabsTrigger value="lessons">Recent Lessons</TabsTrigger>
            <TabsTrigger value="content">Manage Content</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>

          {/* Recent Lessons Tab */}
          <TabsContent value="lessons" className="space-y-4">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Recent Lessons</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingLessons ? (
                  <p className="text-gray-600">Loading...</p>
                ) : lessons.length === 0 ? (
                  <p className="text-gray-600">No lessons found</p>
                ) : (
                  <div className="space-y-3">
                    {lessons.map((lesson) => (
                      <div
                        key={lesson.id}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800/50 rounded-lg"
                      >
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm mb-1">{lesson.title}</h4>
                          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                            <span>{lesson.subject?.name || 'No subject'}</span>
                            <span>•</span>
                            <span>{lesson.views} views</span>
                            <span>•</span>
                            <Badge className="text-xs capitalize">
                              {lesson.difficulty}
                            </Badge>
                          </div>
                        </div>
                        <div>
                          {lesson.published ? (
                            <Badge className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Published
                            </Badge>
                          ) : (
                            <Badge className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400">
                              <Clock className="h-3 w-3 mr-1" />
                              Draft
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Manage Content Tab */}
          <TabsContent value="content" className="space-y-4">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Manage Content</CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Add, edit, or delete lessons and subjects
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Button variant="outline" className="w-full" disabled>
                    <BookOpen className="h-4 w-4 mr-2" />
                    Create New Lesson
                  </Button>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                    Coming soon - Use the /upload page for now
                  </p>
                </div>
                <div>
                  <Button variant="outline" className="w-full" disabled>
                    <BookOpen className="h-4 w-4 mr-2" />
                    Manage Subjects
                  </Button>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                    Coming soon
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Manage user roles and permissions
                </p>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-gray-600 dark:text-gray-400">
                    User management features coming soon
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-0 shadow-sm bg-blue-50 dark:bg-slate-900/50">
            <CardHeader>
              <CardTitle className="text-base">Platform Info</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p>
                <span className="font-medium">Database:</span> Neon PostgreSQL + Prisma
              </p>
              <p>
                <span className="font-medium">Authentication:</span> NextAuth.js
              </p>
              <p>
                <span className="font-medium">Status:</span> Production Ready
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-green-50 dark:bg-slate-900/50">
            <CardHeader>
              <CardTitle className="text-base">Quick Links</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <Button
                variant="link"
                className="h-auto p-0 text-sm"
                onClick={() => router.push('/resources')}
              >
                → Browse All Lessons
              </Button>
              <Button
                variant="link"
                className="h-auto p-0 text-sm block"
                onClick={() => router.push('/upload')}
              >
                → Upload New Lesson
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
