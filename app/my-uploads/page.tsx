'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { Upload as UploadIcon } from 'lucide-react';

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
      <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <UploadIcon className="h-6 w-6 text-blue-600" />
            <h1 className="text-3xl font-bold">My Uploads</h1>
          </div>
          <Link href="/upload">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              New Upload
            </Button>
          </Link>
        </div>

        {uploads.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6 pb-6 text-center">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                You haven&apos;t uploaded any lessons yet.
              </p>
              <Link href="/upload">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  Upload Your First Lesson
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {uploads.map((upload) => (
              <Card key={upload.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <div className="h-1 bg-blue-600" />
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base font-semibold">
                        {upload.title}
                      </CardTitle>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Uploaded {new Date(upload.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex-shrink-0 ml-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                        upload.status === 'published'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : upload.status === 'rejected'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      }`}>
                        {upload.status.charAt(0).toUpperCase() + upload.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}


