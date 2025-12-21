'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useAuth } from '@/lib/auth-context';
import { supabase, Upload } from '@/lib/supabase';
import { Upload as UploadIcon, CheckCircle, XCircle, Clock, Trash2, FileText } from 'lucide-react';
import { format } from 'date-fns';

export default function MyUploadsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [uploadToDelete, setUploadToDelete] = useState<Upload | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    } else if (user) {
      fetchUploads();
    }
  }, [user, authLoading]);

  const fetchUploads = async () => {
    try {
      setLoading(true);
      // Fetch uploads first (without joins to avoid RLS issues)
      const { data, error } = await supabase
        .from('uploads')
        .select('*')
        .eq('uploader_id', user?.id || '')
        .order('created_at', { ascending: false });

      if (error) {
        setUploads([]);
        return;
      }

      // Fetch related data separately
      const uploadsWithRelations = await Promise.all(
        (data || []).map(async (upload) => {
          const [subjectRes, uploaderRes] = await Promise.all([
            upload.subject_id
              ? supabase.from('subjects').select('*').eq('id', upload.subject_id).maybeSingle()
              : Promise.resolve({ data: null, error: null }),
            upload.uploader_id
              ? supabase.from('profiles').select('*').eq('id', upload.uploader_id).maybeSingle()
              : Promise.resolve({ data: null, error: null }),
          ]);

          return {
            ...upload,
            subject: subjectRes.data || null,
            uploader: uploaderRes.data || null,
          };
        })
      );
      setUploads(uploadsWithRelations);
    } catch (error) {
      setUploads([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!uploadToDelete) return;

    setDeleting(true);
    const { error } = await supabase
      .from('uploads')
      .delete()
      .eq('id', uploadToDelete.id);

    if (error) {
      alert('Failed to delete upload. Please try again.');
    } else {
      await fetchUploads();
      setDeleteDialogOpen(false);
      setUploadToDelete(null);
    }
    setDeleting(false);
  };

  if (authLoading || loading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <p>Loading...</p>
        </div>
      </MainLayout>
    );
  }

  const pendingUploads = uploads.filter((u) => u.status === 'pending');
  const approvedUploads = uploads.filter((u) => u.status === 'approved');
  const rejectedUploads = uploads.filter((u) => u.status === 'rejected');

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UploadIcon className="h-6 w-6" />
            <h1 className="text-3xl font-bold">My Uploads</h1>
          </div>
          <Button onClick={() => router.push('/upload')} variant="default">
            <FileText className="mr-2 h-4 w-4" />
            New Upload
          </Button>
        </div>

        <Tabs defaultValue="pending">
          <TabsList>
            <TabsTrigger value="pending">
              Pending ({pendingUploads.length})
            </TabsTrigger>
            <TabsTrigger value="approved">
              Approved ({approvedUploads.length})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rejected ({rejectedUploads.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pendingUploads.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">
                    No pending uploads
                  </p>
                </CardContent>
              </Card>
            ) : (
              pendingUploads.map((upload) => (
                <Card key={upload.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle>{upload.title}</CardTitle>
                        <CardDescription>
                          Submitted on {format(new Date(upload.created_at), 'MMM d, yyyy')}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                          <Clock className="mr-1 h-3 w-3" />
                          Pending
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setUploadToDelete(upload);
                            setDeleteDialogOpen(true);
                          }}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Subject:</span>{' '}
                        {upload.subject?.name || (
                          <span className="text-orange-600">
                            {upload.suggested_subject_name} (Pending approval)
                          </span>
                        )}
                      </div>
                      {upload.content && (
                        <div>
                          <span className="font-medium">Content:</span>{' '}
                          <span className="text-muted-foreground">
                            {upload.content.substring(0, 100)}
                            {upload.content.length > 100 && '...'}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="approved" className="space-y-4">
            {approvedUploads.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">
                    No approved uploads
                  </p>
                </CardContent>
              </Card>
            ) : (
              approvedUploads.map((upload) => (
                <Card key={upload.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle>{upload.title}</CardTitle>
                        <CardDescription>
                          Approved on {upload.reviewed_at ? format(new Date(upload.reviewed_at), 'MMM d, yyyy') : 'N/A'}
                        </CardDescription>
                      </div>
                      <Badge>
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Approved
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Subject:</span>{' '}
                        {upload.subject?.name || 'N/A'}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="rejected" className="space-y-4">
            {rejectedUploads.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">
                    No rejected uploads
                  </p>
                </CardContent>
              </Card>
            ) : (
              rejectedUploads.map((upload) => (
                <Card key={upload.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle>{upload.title}</CardTitle>
                        <CardDescription>
                          Rejected on {upload.reviewed_at ? format(new Date(upload.reviewed_at), 'MMM d, yyyy') : 'N/A'}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="destructive">
                          <XCircle className="mr-1 h-3 w-3" />
                          Rejected
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setUploadToDelete(upload);
                            setDeleteDialogOpen(true);
                          }}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Subject:</span>{' '}
                        {upload.subject?.name || upload.suggested_subject_name || 'N/A'}
                      </div>
                      {upload.admin_notes && (
                        <div>
                          <span className="font-medium">Admin Notes:</span>{' '}
                          <span className="text-muted-foreground">{upload.admin_notes}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Upload</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{uploadToDelete?.title}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={deleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </MainLayout>
  );
}


