'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/lib/auth-context';
import { BookOpen, Users, Shield } from 'lucide-react';

export default function AdminPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalLessons: 0,
    totalSubjects: 0,
  });
  const [isAdmin, setIsAdmin] = useState(false);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        if (!authLoading && user) {
          const res = await fetch('/api/auth/me');
          const data = await res.json();
          if (data.isAdmin) {
            setIsAdmin(true);
            await fetchStats();
          } else {
            router.push('/');
          }
        } else if (!authLoading && !user) {
          router.push('/auth/login');
        }
      } catch (error) {
        router.push('/');
      } finally {
        setStatsLoading(false);
      }
    };

    checkAdmin();
  }, [user, authLoading, router]);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  if (authLoading || statsLoading) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </MainLayout>
    );
  }

  if (!isAdmin) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <p className="text-red-600">You don't have permission to access this page</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-6 w-6 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Admin Dashboard
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Manage platform content and users
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-gray-900 dark:text-white">
                {stats.totalUsers}
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-indigo-600" />
                Total Lessons
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-gray-900 dark:text-white">
                {stats.totalLessons}
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-green-600" />
                Total Subjects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-gray-900 dark:text-white">
                {stats.totalSubjects}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="content">Content Management</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Platform Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 dark:bg-slate-900 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Active Users
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {Math.floor(stats.totalUsers * 0.7)}
                    </p>
                  </div>
                  <div className="p-4 bg-indigo-50 dark:bg-slate-900 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Published Lessons
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats.totalLessons}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 pt-4">
                  The platform is running smoothly with {stats.totalSubjects} subjects
                  and {stats.totalLessons} lessons across {stats.totalUsers} registered
                  users.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="space-y-4">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Content Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Manage lessons, subjects, and user-generated content
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white h-12">
                    Manage Subjects
                  </Button>
                  <Button className="bg-indigo-600 hover:bg-indigo-700 text-white h-12">
                    Manage Lessons
                  </Button>
                  <Button variant="outline" className="h-12">
                    Manage Users
                  </Button>
                  <Button variant="outline" className="h-12">
                    View Reports
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [selectedUpload, setSelectedUpload] = useState<Upload | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [uploadToDelete, setUploadToDelete] = useState<Upload | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [stats, setStats] = useState({ totalUsers: 0, totalLessons: 0, pendingUploads: 0 });
  const [allUsers, setAllUsers] = useState<Profile[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [showNewSubjectDialog, setShowNewSubjectDialog] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectDescription, setNewSubjectDescription] = useState('');
  const [subjectsLoading, setSubjectsLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [newRole, setNewRole] = useState<'student' | 'teacher' | 'moderator' | 'admin'>('student');
  const [updatingRole, setUpdatingRole] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      router.push('/');
    } else if (isAdmin) {
      fetchData();
      fetchSubjects();
      fetchUsers();
    }
  }, [user, isAdmin, authLoading, router]);

  const fetchData = async () => {
    try {
      // Fetch uploads first (without joins to avoid RLS issues)
      const uploadsRes = await supabase
        .from('uploads')
        .select('*')
        .order('created_at', { ascending: false });

      if (uploadsRes.error) {
        setUploads([]);
        return;
      }

      // Fetch related data for each upload
      const uploadsWithRelations = await Promise.all(
        (uploadsRes.data || []).map(async (upload) => {
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

      // Fetch stats
      const [usersRes, lessonsRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('lessons').select('id', { count: 'exact', head: true }),
      ]);

      setStats({
        totalUsers: usersRes.count || 0,
        totalLessons: lessonsRes.count || 0,
        pendingUploads: uploadsWithRelations.filter((u) => u.status === 'pending').length,
      });
    } catch (error) {
      setUploads([]);
    }
  };

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        setAllUsers([]);
      } else {
        setAllUsers(data || []);
      }
    } catch (error) {
      setAllUsers([]);
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      setSubjectsLoading(true);
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) {
        setSubjects([]);
      } else {
        setSubjects(data || []);
      }
    } catch (error) {
      setSubjects([]);
    } finally {
      setSubjectsLoading(false);
    }
  };

  const fetchLessonsForSubject = async (subjectId: string) => {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('subject_id', subjectId)
        .order('order_index', { ascending: true });

      if (error) {
        setLessons([]);
      } else {
        setLessons(data || []);
      }
    } catch (error) {
      setLessons([]);
    }
  };

  const handleSelectSubject = async (subject: Subject) => {
    setSelectedSubject(subject);
    await fetchLessonsForSubject(subject.id);
  };

  const handleCreateSubject = async () => {
    if (!newSubjectName.trim()) {
      alert('Please enter a subject name');
      return;
    }

    try {
      setActionLoading(true);
      const subjectSlug = slugify(newSubjectName);
      
      const { error } = await supabase.from('subjects').insert({
        name: newSubjectName,
        slug: subjectSlug,
        description: newSubjectDescription,
        order_index: subjects.length,
      });

      if (error) {
        throw error;
      }

      setNewSubjectName('');
      setNewSubjectDescription('');
      setShowNewSubjectDialog(false);
      await fetchSubjects();
    } catch (error) {
      alert('Failed to create subject. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateLessonOrder = async (lessonId: string, newOrder: number) => {
    try {
      const { error } = await supabase
        .from('lessons')
        .update({ order_index: newOrder })
        .eq('id', lessonId);

      if (error) {
        throw error;
      }

      if (selectedSubject) {
        await fetchLessonsForSubject(selectedSubject.id);
      }
    } catch (error) {
      alert('Failed to update lesson order.');
    }
  };

  const handleRoleChange = async () => {
    if (!selectedUser) return;

    setUpdatingRole(true);
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', selectedUser.id);

    if (error) {
      alert('Failed to update role. Please try again.');
    } else {
      await fetchUsers();
      setRoleDialogOpen(false);
      setSelectedUser(null);
    }
    setUpdatingRole(false);
  };

  const handleToggleUserStatus = async (targetUser: Profile) => {
    const { error } = await supabase
      .from('profiles')
      .update({ is_active: !targetUser.is_active })
      .eq('id', targetUser.id);

    if (error) {
      alert('Failed to update user status. Please try again.');
    } else {
      await fetchUsers();
      // If deactivating current user, sign them out
      if (targetUser.id === user?.id && targetUser.is_active) {
        await supabase.auth.signOut();
        router.push('/auth/login');
      }
    }
  };

  const handleApprove = async (upload: Upload) => {
    setActionLoading(true);

    let finalSubjectId = upload.subject_id;
    let newSubjectId: string | null = null;

    try {
      // Step 1: Create subject if needed
      if (upload.suggested_subject_name && !upload.subject_id) {
        const subjectSlug = slugify(upload.suggested_subject_name);
        const { data: newSubject, error: subjectError } = await supabase
          .from('subjects')
          .insert({
            name: upload.suggested_subject_name,
            slug: subjectSlug,
            order_index: 0,
          })
          .select()
          .single();

        if (subjectError) {
          throw new Error(`Failed to create faculty: ${subjectError.message}`);
        }

        if (!newSubject) {
          throw new Error('Faculty creation returned empty result');
        }

        finalSubjectId = newSubject.id;
        newSubjectId = newSubject.id;
      }

      if (!finalSubjectId) {
        throw new Error('No faculty ID available for lesson');
      }

      // Step 2: Create lesson
      const slug = slugify(upload.title);
      const { error: lessonError } = await supabase.from('lessons').insert({
        title: upload.title,
        slug: slug,
        content: upload.content,
        subject_id: finalSubjectId,
        semester: upload.semester,
        pdf_url: upload.pdf_url,
        external_link: upload.external_link,
        author_id: upload.uploader_id,
        is_published: true,
        is_premium: false,
      });

      if (lessonError) {
        throw new Error(`Failed to create lesson: ${lessonError.message}`);
      }

      // Step 3: Mark upload as approved (only after both succeed)
      const { error: updateError } = await supabase
        .from('uploads')
        .update({
          status: 'approved',
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
          admin_notes: adminNotes,
          subject_id: finalSubjectId,
        })
        .eq('id', upload.id);

      if (updateError) {
        throw new Error(`Failed to update upload: ${updateError.message}`);
      }

      // All succeeded - refresh data
      await fetchData();
      setSelectedUpload(null);
      setAdminNotes('');

    } catch (error) {

      // ROLLBACK: Delete orphaned subject if created
      if (newSubjectId) {
        try {
          await supabase
            .from('subjects')
            .delete()
            .eq('id', newSubjectId);
        } catch (err) {
        }
      }

      // Show error to user
      alert(`Failed to approve: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (upload: Upload) => {
    setActionLoading(true);

    await supabase
      .from('uploads')
      .update({
        status: 'rejected',
        reviewed_by: user?.id,
        reviewed_at: new Date().toISOString(),
        admin_notes: adminNotes,
      })
      .eq('id', upload.id);

    await fetchData();
    setSelectedUpload(null);
    setAdminNotes('');
    setActionLoading(false);
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
      await fetchData();
      setDeleteDialogOpen(false);
      setUploadToDelete(null);
    }
    setDeleting(false);
  };

  if (authLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <p>Loading...</p>
        </div>
      </MainLayout>
    );
  }

  if (!isAdmin) {
    return null;
  }

  // Filter out admin's own uploads from pending (admins publish directly, so they shouldn't appear here)
  const pendingUploads = uploads.filter((u) => u.status === 'pending' && u.uploader_id !== user?.id);
  const approvedUploads = uploads.filter((u) => u.status === 'approved');
  const rejectedUploads = uploads.filter((u) => u.status === 'rejected');

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6" />
            <h1 className="text-3xl font-bold">
              {isAdmin ? 'Admin Dashboard' : 'Moderator Dashboard'}
            </h1>
          </div>
          <Button onClick={fetchData} variant="outline" size="sm">
            Refresh
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Published Lessons</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalLessons}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingUploads}</div>
            </CardContent>
          </Card>
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
            {isAdmin && (
              <>
                <TabsTrigger value="faculties">
                  Faculties
                </TabsTrigger>
                <TabsTrigger value="users">
                  Users ({allUsers.length})
                </TabsTrigger>
              </>
            )}
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {uploads.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">
                    No uploads found. Check browser console for errors.
                  </p>
                  <p className="text-center text-xs text-muted-foreground mt-2">
                    Total uploads in state: {uploads.length}
                  </p>
                </CardContent>
              </Card>
            ) : pendingUploads.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">
                    No pending uploads to review
                  </p>
                  <p className="text-center text-xs text-muted-foreground mt-2">
                    Total uploads: {uploads.length} (Pending: {pendingUploads.length}, Approved: {approvedUploads.length}, Rejected: {rejectedUploads.length})
                  </p>
                </CardContent>
              </Card>
            ) : (
              pendingUploads.map((upload) => (
                <Card key={upload.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{upload.title}</CardTitle>
                        <CardDescription>
                          Submitted by {upload.uploader?.full_name} on{' '}
                          {format(new Date(upload.created_at), 'MMM d, yyyy')}
                        </CardDescription>
                      </div>
                      <Badge variant="secondary">
                        <Clock className="mr-1 h-3 w-3" />
                        Pending
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Subject:</span>{' '}
                        {upload.subject?.name || (
                          <span className="text-orange-600 font-semibold">
                            {upload.suggested_subject_name} (New - will be created on approval)
                          </span>
                        )}
                      </div>
                      {upload.semester && (
                        <div>
                          <span className="font-medium">Semester:</span> {upload.semester}
                        </div>
                      )}
                      {upload.pdf_url && (
                        <div className="col-span-2">
                          <span className="font-medium">PDF:</span>{' '}
                          <a
                            href={upload.pdf_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            View PDF
                          </a>
                        </div>
                      )}
                      {upload.external_link && (
                        <div className="col-span-2">
                          <span className="font-medium">Link:</span>{' '}
                          <a
                            href={upload.external_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            Visit Link
                          </a>
                        </div>
                      )}
                    </div>

                    {upload.content && (
                      <div>
                        <p className="font-medium text-sm mb-2">Content Preview:</p>
                        <div className="bg-muted p-4 rounded-lg max-h-40 overflow-y-auto text-sm">
                          {upload.content.substring(0, 300)}
                          {upload.content.length > 300 && '...'}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          setSelectedUpload(upload);
                          setAdminNotes('');
                        }}
                        variant="default"
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Approve
                      </Button>
                      <Button
                        onClick={() => {
                          setSelectedUpload(upload);
                          setAdminNotes('');
                        }}
                        variant="destructive"
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Reject
                      </Button>
                      <Button
                        onClick={() => {
                          setUploadToDelete(upload);
                          setDeleteDialogOpen(true);
                        }}
                        variant="outline"
                        size="sm"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
                      <div>
                        <CardTitle>{upload.title}</CardTitle>
                        <CardDescription>
                          Submitted by {upload.uploader?.full_name}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge>
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Approved
                        </Badge>
                        <Button
                          onClick={() => {
                            setUploadToDelete(upload);
                            setDeleteDialogOpen(true);
                          }}
                          variant="outline"
                          size="sm"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
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
                      <div>
                        <CardTitle>{upload.title}</CardTitle>
                        <CardDescription>
                          Submitted by {upload.uploader?.full_name}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="destructive">
                          <XCircle className="mr-1 h-3 w-3" />
                          Rejected
                        </Badge>
                        <Button
                          onClick={() => {
                            setUploadToDelete(upload);
                            setDeleteDialogOpen(true);
                          }}
                          variant="outline"
                          size="sm"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  {upload.admin_notes && (
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Reason:</span> {upload.admin_notes}
                      </p>
                    </CardContent>
                  )}
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            {usersLoading ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">Loading users...</p>
                </CardContent>
              </Card>
            ) : allUsers.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">No users found</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Total: {allUsers.length} users
                  </p>
                  <Button onClick={fetchUsers} variant="outline" size="sm">
                    Refresh
                  </Button>
                </div>
                <div className="grid gap-4">
                  {allUsers.map((userProfile) => (
                    <Card key={userProfile.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="flex items-center gap-2">
                              {userProfile.full_name}
                              {userProfile.id === user?.id && (
                                <Badge variant="outline" className="text-xs">You</Badge>
                              )}
                            </CardTitle>
                            <CardDescription>{userProfile.email}</CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={
                                userProfile.role === 'admin'
                                  ? 'default'
                                  : userProfile.role === 'moderator'
                                  ? 'secondary'
                                  : userProfile.role === 'teacher'
                                  ? 'outline'
                                  : 'outline'
                              }
                              className="capitalize"
                            >
                              {userProfile.role}
                            </Badge>
                            {userProfile.is_active === false && (
                              <Badge variant="destructive">Inactive</Badge>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-muted-foreground">
                            Joined: {format(new Date(userProfile.created_at), 'MMM d, yyyy')}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedUser(userProfile);
                                setNewRole(userProfile.role);
                                setRoleDialogOpen(true);
                              }}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Change Role
                            </Button>
                            <Button
                              variant={userProfile.is_active ? 'destructive' : 'default'}
                              size="sm"
                              onClick={() => handleToggleUserStatus(userProfile)}
                              disabled={userProfile.id === user?.id}
                            >
                              {userProfile.is_active ? (
                                <>
                                  <UserX className="mr-2 h-4 w-4" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <UserCheck className="mr-2 h-4 w-4" />
                                  Activate
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {isAdmin && (
              <TabsContent value="faculties" className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-semibold">Manage Faculties</h2>
                    <p className="text-sm text-muted-foreground">Create, organize, and manage educational faculties with lessons</p>
                  </div>
                  <Button onClick={() => setShowNewSubjectDialog(true)}>
                    + New Faculty
                  </Button>
                </div>

                {subjectsLoading ? (
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-center text-muted-foreground">Loading faculties...</p>
                    </CardContent>
                  </Card>
                ) : subjects.length === 0 ? (
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-center text-muted-foreground">No faculties yet. Create one to get started.</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {subjects.map((subject) => (
                      <Card 
                        key={subject.id}
                        className="cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => handleSelectSubject(subject)}
                      >
                        <CardHeader>
                          <CardTitle className="text-lg">{subject.name}</CardTitle>
                          <CardDescription>{subject.description || 'No description'}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="text-sm text-muted-foreground">
                            Order: <Badge>{subject.order_index}</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {selectedSubject && (
                  <Card className="mt-6 border-2 border-blue-200 bg-blue-50">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>{selectedSubject.name} - Lessons</CardTitle>
                          <CardDescription>Manage lessons for this faculty in W3Schools order</CardDescription>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setSelectedSubject(null)}
                        >
                          ✕
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {lessons.length === 0 ? (
                        <p className="text-center text-muted-foreground py-4">No lessons in this faculty yet</p>
                      ) : (
                        <div className="space-y-3">
                          {lessons.map((lesson, idx) => (
                            <div key={lesson.id} className="flex items-center gap-3 p-3 bg-white rounded border">
                              <div className="flex-1">
                                <p className="font-medium">{lesson.title}</p>
                                <p className="text-sm text-muted-foreground">Order: {lesson.order_index}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleUpdateLessonOrder(lesson.id, Math.max(0, lesson.order_index - 1))}
                                  disabled={lesson.order_index === 0}
                                >
                                  ↑
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleUpdateLessonOrder(lesson.id, lesson.order_index + 1)}
                                  disabled={lesson.order_index === lessons.length - 1}
                                >
                                  ↓
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={showNewSubjectDialog} onOpenChange={setShowNewSubjectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Faculty</DialogTitle>
            <DialogDescription>
              Add a new faculty to your platform. You can add lessons to it later.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="subject-name">Faculty Name</Label>
              <Input
                id="subject-name"
                placeholder="e.g., Computer Science, Mathematics, Biology"
                value={newSubjectName}
                onChange={(e) => setNewSubjectName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCreateSubject()}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject-desc">Description (Optional)</Label>
              <Textarea
                id="subject-desc"
                placeholder="Brief description of this faculty..."
                value={newSubjectDescription}
                onChange={(e) => setNewSubjectDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowNewSubjectDialog(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateSubject}
              disabled={actionLoading || !newSubjectName.trim()}
            >
              {actionLoading ? 'Creating...' : 'Create Faculty'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedUpload} onOpenChange={() => setSelectedUpload(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Submission</DialogTitle>
            <DialogDescription>
              Add notes for this {selectedUpload?.status} decision (optional)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="notes">Admin Notes</Label>
              <Textarea
                id="notes"
                placeholder="Add any notes or feedback..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSelectedUpload(null)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedUpload && handleReject(selectedUpload)}
              disabled={actionLoading}
            >
              Reject
            </Button>
            <Button
              onClick={() => selectedUpload && handleApprove(selectedUpload)}
              disabled={actionLoading}
            >
              Approve & Publish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Upload</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{uploadToDelete?.title}&quot;? This action cannot be undone.
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

      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
            <DialogDescription>
              Change role for {selectedUser?.full_name} ({selectedUser?.email})
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="role">New Role</Label>
              <Select value={newRole} onValueChange={(v) => setNewRole(v as 'student' | 'teacher' | 'moderator' | 'admin')}>
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="teacher">Teacher</SelectItem>
                  <SelectItem value="moderator">Moderator</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {newRole === 'moderator' && 'Moderators can approve/reject/delete uploads'}
                {newRole === 'teacher' && 'Teachers can create lessons'}
                {newRole === 'admin' && 'Admins have full access including user management'}
                {newRole === 'student' && 'Students can upload content for review'}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRoleDialogOpen(false);
                setSelectedUser(null);
              }}
              disabled={updatingRole}
            >
              Cancel
            </Button>
            <Button onClick={handleRoleChange} disabled={updatingRole || newRole === selectedUser?.role}>
              {updatingRole ? 'Updating...' : 'Update Role'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}


