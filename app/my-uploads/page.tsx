'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { Upload as UploadIcon, CheckCircle, Clock, XCircle } from 'lucide-react';

type UploadItem = {
  id: string;
  title: string;
  status: 'pending' | 'published' | 'rejected';
  createdAt: string;
};

export default function MyUploadsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
      return;
    }

    const fetchUploads = async () => {
      try {
        const res = await fetch(`/api/my-uploads?userId=${user?.id}`);
        const data = await res.json();
        setUploads(data);
      } catch (err) {
        console.error('Failed to fetch uploads');
      }
      setLoading(false);
    };

    if (user) {
      fetchUploads();
    }
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <p>Loading...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-lg bg-blue-100 dark:bg-blue-900 mb-4">
            <UploadIcon className="h-7 w-7 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-3">
            My Uploads
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
            Track and manage all your lesson contributions
          </p>
          <Link href="/upload">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white h-11 px-8 font-semibold">
              <UploadIcon className="h-5 w-5 mr-2" />
              New Upload
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p>Loading uploads...</p>
          </div>
        ) : uploads.length === 0 ? (
          <div className="text-center py-16 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
            <UploadIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
              You haven&apos;t uploaded any lessons yet.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
              Start sharing your knowledge with the Faculty Hub community
            </p>
            <Link href="/upload">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white h-10 px-6 font-semibold">
                Upload Your First Lesson
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {uploads.map((upload) => {
              const statusConfig = {
                published: { 
                  bg: 'bg-green-50 dark:bg-green-900/20', 
                  border: 'border-green-200 dark:border-green-800',
                  icon: CheckCircle,
                  label: 'Published',
                  color: 'text-green-600 dark:text-green-400'
                },
                rejected: { 
                  bg: 'bg-red-50 dark:bg-red-900/20', 
                  border: 'border-red-200 dark:border-red-800',
                  icon: XCircle,
                  label: 'Rejected',
                  color: 'text-red-600 dark:text-red-400'
                },
                pending: { 
                  bg: 'bg-yellow-50 dark:bg-yellow-900/20', 
                  border: 'border-yellow-200 dark:border-yellow-800',
                  icon: Clock,
                  label: 'Pending',
                  color: 'text-yellow-600 dark:text-yellow-400'
                },
              };
              const config = statusConfig[upload.status] || statusConfig.pending;
              const IconComponent = config.icon;
              
              return (
                <Card key={upload.id} className={`${config.bg} border-2 ${config.border} shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden h-full`}>
                  <CardHeader className="pb-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${config.bg}`}>
                        <IconComponent className={`h-5 w-5 ${config.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
                          {upload.title}
                        </CardTitle>
                        <p className={`text-sm font-medium ${config.color} mt-1`}>
                          {config.label}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Uploaded on {new Date(upload.createdAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </MainLayout>
  );
}


