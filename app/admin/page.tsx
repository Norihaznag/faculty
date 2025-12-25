'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/lib/auth-context';
import { AdminLayout } from '@/components/layout/admin-layout';
import {
  Shield,
  Users,
  BookOpen,
  BarChart3,
  Trash2,
  Edit2,
  Plus,
  Search,
  AlertCircle,
  CheckIcon,
  XIcon,
  LogOut,
  Menu,
} from 'lucide-react';

type Stats = {
  users: number;
  lessons: number;
  subjects: number;
  uploads: number;
};

type User = {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
  image?: string;
  _count: { uploads: number; bookmarks: number };
};

type Lesson = {
  id: string;
  title: string;
  slug: string;
  description?: string;
  published: boolean;
  difficulty: string;
  views: number;
  subject?: { id: string; name: string };
  author?: { id: string; name: string; email: string };
};

type Subject = {
  id: string;
  name: string;
  slug: string;
  _count?: { lessons: number };
};

type Upload = {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  user: { id: string; name: string; email: string };
  lesson?: { subject?: { id: string; name: string } };
  reason?: string;
};

export default function AdminPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  // Check if user is admin
  const isAdmin = user && (user as any).role === 'admin';

  const [stats, setStats] = useState<Stats>({ users: 0, lessons: 0, subjects: 0, uploads: 0 });

  // User Management State
  const [users, setUsers] = useState<User[]>([]);
  const [moderators, setModerators] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [searchUser, setSearchUser] = useState('');
  const [filterRole, setFilterRole] = useState('');

  // Lesson Management State
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loadingLessons, setLoadingLessons] = useState(true);
  const [searchLesson, setSearchLesson] = useState('');
  const [filterPublished, setFilterPublished] = useState('');

  // Upload Moderation State
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [loadingUploads, setLoadingUploads] = useState(true);
  const [uploadFilter, setUploadFilter] = useState('pending');

  // Subject Management State
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [searchSubject, setSearchSubject] = useState('');
  const [showNewSubjectForm, setShowNewSubjectForm] = useState(false);
  const [newSubjectForm, setNewSubjectForm] = useState({ name: '' });
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  // Forms
  const [showNewUserForm, setShowNewUserForm] = useState(false);
  const [newUserForm, setNewUserForm] = useState({ email: '', name: '', role: 'student' });
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [newModeratorForm, setNewModeratorForm] = useState({ email: '', name: '' });
  const [showNewModeratorForm, setShowNewModeratorForm] = useState(false);

  const [showModerationForm, setShowModerationForm] = useState(false);
  const [selectedUpload, setSelectedUpload] = useState<Upload | null>(null);
  const [moderationReason, setModerationReason] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Authorization check
  useEffect(() => {
    // Only redirect if we're done loading AND user exists AND is definitely not admin
    if (!authLoading && user && !isAdmin) {
      console.log('Not admin, redirecting to home. User role:', (user as any).role);
      router.push('/');
    }
  }, [isAdmin, authLoading, router, user]);

  // Fetch stats
  useEffect(() => {
    if (isAdmin && user) {
      console.log('User is admin, fetching data. User:', user);
      fetchStats();
      fetchUsers();
      fetchLessons();
      fetchModerators();
      fetchUploads();
      fetchSubjects();
    }
  }, [isAdmin, user]);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      setStats(data.stats || { users: 0, lessons: 0, subjects: 0, uploads: 0 });
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const res = await fetch(`/api/admin/users?search=${searchUser}&role=${filterRole}`);
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err) {
      setError('Failed to fetch users');
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchModerators = async () => {
    try {
      const res = await fetch('/api/admin/moderators');
      const data = await res.json();
      setModerators(data.moderators || []);
    } catch (err) {
      console.error('Failed to fetch moderators:', err);
    }
  };

  const fetchLessons = async () => {
    try {
      setLoadingLessons(true);
      const url = new URL('/api/admin/lessons', window.location.origin);
      if (searchLesson) url.searchParams.set('search', searchLesson);
      if (filterPublished) url.searchParams.set('published', filterPublished);

      const res = await fetch(url);
      const data = await res.json();
      setLessons(data.lessons || []);
    } catch (err) {
      setError('Failed to fetch lessons');
    } finally {
      setLoadingLessons(false);
    }
  };

  const fetchUploads = async () => {
    try {
      setLoadingUploads(true);
      const res = await fetch(`/api/admin/uploads?status=${uploadFilter}`);
      const data = await res.json();
      setUploads(data.uploads || []);
    } catch (err) {
      setError('Failed to fetch uploads');
    } finally {
      setLoadingUploads(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      setLoadingSubjects(true);
      const url = new URL('/api/admin/subjects', window.location.origin);
      if (searchSubject) url.searchParams.set('search', searchSubject);

      const res = await fetch(url);
      const data = await res.json();
      setSubjects(data.subjects || []);
    } catch (err) {
      setError('Failed to fetch subjects');
    } finally {
      setLoadingSubjects(false);
    }
  };

  // USER CRUD OPERATIONS
  const handleCreateUser = async () => {
    try {
      setError('');
      if (!newUserForm.email || !newUserForm.name) {
        setError('Email and name required');
        return;
      }

      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUserForm),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create user');
      }

      setSuccess('User created successfully');
      setNewUserForm({ email: '', name: '', role: 'student' });
      setShowNewUserForm(false);
      fetchUsers();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleUpdateUser = async () => {
    try {
      setError('');
      if (!editingUser) return;

      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingUser),
      });

      if (!res.ok) throw new Error('Failed to update user');

      setSuccess('User updated successfully');
      setEditingUser(null);
      fetchUsers();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      if (!confirm('Delete this user? This cannot be undone.')) return;

      setError('');
      const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' });

      if (!res.ok) throw new Error('Failed to delete user');

      setSuccess('User deleted successfully');
      fetchUsers();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // MODERATOR OPERATIONS
  const handleCreateModerator = async () => {
    try {
      setError('');
      if (!newModeratorForm.email || !newModeratorForm.name) {
        setError('Email and name required');
        return;
      }

      const res = await fetch('/api/admin/moderators', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newModeratorForm),
      });

      if (!res.ok) throw new Error('Failed to create moderator');

      setSuccess('Moderator added successfully');
      setNewModeratorForm({ email: '', name: '' });
      setShowNewModeratorForm(false);
      fetchModerators();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleRemoveModerator = async (id: string) => {
    try {
      if (!confirm('Remove moderator role from this user?')) return;

      setError('');
      const res = await fetch(`/api/admin/moderators/${id}`, { method: 'DELETE' });

      if (!res.ok) throw new Error('Failed to remove moderator');

      setSuccess('Moderator role removed');
      fetchModerators();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // LESSON OPERATIONS
  const handleDeleteLesson = async (lessonId: string) => {
    try {
      if (!confirm('Delete this lesson? This cannot be undone.')) return;

      setError('');
      const res = await fetch(`/api/admin/lessons/${lessonId}`, { method: 'DELETE' });

      if (!res.ok) throw new Error('Failed to delete lesson');

      setSuccess('Lesson deleted successfully');
      fetchLessons();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handlePublishLesson = async (lessonId: string, published: boolean) => {
    try {
      setError('');
      const res = await fetch(`/api/admin/lessons/${lessonId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: !published }),
      });

      if (!res.ok) throw new Error('Failed to update lesson');

      setSuccess(published ? 'Lesson unpublished' : 'Lesson published');
      fetchLessons();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // UPLOAD MODERATION
  const handleModerateUpload = async (status: 'approved' | 'rejected') => {
    try {
      setError('');
      if (!selectedUpload) return;

      const res = await fetch(`/api/admin/uploads/${selectedUpload.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, reason: moderationReason }),
      });

      if (!res.ok) throw new Error('Failed to moderate upload');

      setSuccess(`Upload ${status}` + (moderationReason ? ' with reason' : ''));
      setShowModerationForm(false);
      setSelectedUpload(null);
      setModerationReason('');
      fetchUploads();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // SUBJECT OPERATIONS
  const handleCreateSubject = async () => {
    try {
      setError('');
      if (!newSubjectForm.name.trim()) {
        setError('Subject name required');
        return;
      }

      const res = await fetch('/api/admin/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSubjectForm),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create subject');
      }

      setSuccess('Subject created successfully');
      setNewSubjectForm({ name: '' });
      setShowNewSubjectForm(false);
      fetchSubjects();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleUpdateSubject = async () => {
    try {
      setError('');
      if (!editingSubject || !editingSubject.name.trim()) {
        setError('Subject name required');
        return;
      }

      const res = await fetch(`/api/admin/subjects/${editingSubject.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editingSubject.name }),
      });

      if (!res.ok) throw new Error('Failed to update subject');

      setSuccess('Subject updated successfully');
      setEditingSubject(null);
      fetchSubjects();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteSubject = async (subjectId: string) => {
    try {
      if (!confirm('Delete this subject? This cannot be undone.')) return;

      setError('');
      const res = await fetch(`/api/admin/subjects/${subjectId}`, { method: 'DELETE' });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to delete subject');
      }

      setSuccess('Subject deleted successfully');
      fetchSubjects();
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (authLoading) {
    return (
      <AdminLayout>
        <div className="text-center py-12">Loading...</div>
      </AdminLayout>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-8 pb-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-lg bg-blue-100 dark:bg-blue-900 mb-4">
            <Shield className="h-7 w-7 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-3">
            Admin Dashboard
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Manage users, moderators, content, and uploads
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <Alert className="border-red-500 bg-red-50 dark:bg-red-900/20">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-600 dark:text-red-400">{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="border-green-500 bg-green-50 dark:bg-green-900/20">
            <CheckIcon className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-600 dark:text-green-400">{success}</AlertDescription>
          </Alert>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 border-0 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">{stats.users}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 border-0 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Total Lessons</CardTitle>
                <BookOpen className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-green-600 dark:text-green-400">{stats.lessons}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 border-0 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Subjects</CardTitle>
                <BookOpen className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-purple-600 dark:text-purple-400">{stats.subjects}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900 dark:to-orange-800 border-0 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <BarChart3 className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-orange-600 dark:text-orange-400">{stats.uploads}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="uploads" className="space-y-6">
          <TabsList className="grid w-full grid-cols-1 md:grid-cols-5 gap-2">
            <TabsTrigger value="uploads">Content Moderation</TabsTrigger>
            <TabsTrigger value="subjects">Subjects</TabsTrigger>
            <TabsTrigger value="lessons">Lessons</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="moderators">Moderators</TabsTrigger>
          </TabsList>

          {/* UPLOADS MODERATION TAB */}
          <TabsContent value="uploads" className="space-y-4">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Upload Moderation</CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Review and approve/reject pending uploads
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Filter */}
                <div className="flex gap-2">
                  <Button
                    variant={uploadFilter === 'pending' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setUploadFilter('pending');
                      fetchUploads();
                    }}
                  >
                    Pending
                  </Button>
                  <Button
                    variant={uploadFilter === 'approved' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setUploadFilter('approved');
                      fetchUploads();
                    }}
                  >
                    Approved
                  </Button>
                  <Button
                    variant={uploadFilter === 'rejected' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setUploadFilter('rejected');
                      fetchUploads();
                    }}
                  >
                    Rejected
                  </Button>
                </div>

                {loadingUploads ? (
                  <p>Loading...</p>
                ) : uploads.length === 0 ? (
                  <p className="text-gray-600 dark:text-gray-400">No uploads found</p>
                ) : (
                  <div className="space-y-3">
                    {uploads.map((upload) => (
                      <div key={upload.id} className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-lg">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-semibold">{upload.title}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{upload.description}</p>
                            <div className="flex items-center gap-3 mt-2 text-xs text-gray-600 dark:text-gray-400">
                              <span>{upload.user.name}</span>
                              <span>•</span>
                              <span>{upload.lesson?.subject?.name || 'No subject'}</span>
                            </div>
                          </div>
                          <Badge
                            className={
                              upload.status === 'pending'
                                ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                                : upload.status === 'approved'
                                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                  : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                            }
                          >
                            {upload.status}
                          </Badge>
                        </div>

                        {upload.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => {
                                setSelectedUpload(upload);
                                setShowModerationForm(true);
                              }}
                            >
                              <CheckIcon className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                setSelectedUpload(upload);
                                setShowModerationForm(true);
                              }}
                            >
                              <XIcon className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        )}

                        {upload.reason && (
                          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            <strong>Reason:</strong> {upload.reason}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Moderation Form Modal */}
            {showModerationForm && selectedUpload && (
              <Card className="border-2 border-blue-500 bg-blue-50 dark:bg-blue-900/20">
                <CardHeader>
                  <CardTitle>Moderate Upload: {selectedUpload.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Reason (optional)</Label>
                    <Textarea
                      placeholder="Provide feedback or reason for rejection..."
                      value={moderationReason}
                      onChange={(e) => setModerationReason(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      onClick={() => handleModerateUpload('approved')}
                    >
                      <CheckIcon className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      className="flex-1"
                      variant="destructive"
                      onClick={() => handleModerateUpload('rejected')}
                    >
                      <XIcon className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                    <Button
                      className="flex-1"
                      variant="outline"
                      onClick={() => {
                        setShowModerationForm(false);
                        setSelectedUpload(null);
                        setModerationReason('');
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* SUBJECTS TAB */}
          <TabsContent value="subjects" className="space-y-4">
            <Card className="border-0 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Manage Subjects</CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    Create, edit, or delete subjects
                  </p>
                </div>
                <Button
                  onClick={() => setShowNewSubjectForm(!showNewSubjectForm)}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  New Subject
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Create Subject Form */}
                {showNewSubjectForm && (
                  <Card className="border-2 border-green-500 bg-green-50 dark:bg-green-900/20">
                    <CardHeader>
                      <CardTitle className="text-lg">Create New Subject</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="subject-name">Subject Name</Label>
                        <Input
                          id="subject-name"
                          placeholder="e.g., Mathematics, Physics, Chemistry"
                          value={newSubjectForm.name}
                          onChange={(e) =>
                            setNewSubjectForm({ ...newSubjectForm, name: e.target.value })
                          }
                          className="mt-2"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          className="flex-1"
                          onClick={handleCreateSubject}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Create Subject
                        </Button>
                        <Button
                          className="flex-1"
                          variant="outline"
                          onClick={() => {
                            setShowNewSubjectForm(false);
                            setNewSubjectForm({ name: '' });
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Edit Subject Form */}
                {editingSubject && (
                  <Card className="border-2 border-orange-500 bg-orange-50 dark:bg-orange-900/20">
                    <CardHeader>
                      <CardTitle className="text-lg">Edit Subject</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="edit-subject-name">Subject Name</Label>
                        <Input
                          id="edit-subject-name"
                          placeholder="Subject name"
                          value={editingSubject.name}
                          onChange={(e) =>
                            setEditingSubject({ ...editingSubject, name: e.target.value })
                          }
                          className="mt-2"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          className="flex-1"
                          onClick={handleUpdateSubject}
                        >
                          <Edit2 className="h-4 w-4 mr-2" />
                          Save Changes
                        </Button>
                        <Button
                          className="flex-1"
                          variant="outline"
                          onClick={() => setEditingSubject(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Search */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Search subjects..."
                    value={searchSubject}
                    onChange={(e) => setSearchSubject(e.target.value)}
                    onKeyUp={(e) => {
                      if (e.key === 'Enter') fetchSubjects();
                    }}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchSubject('');
                      fetchSubjects();
                    }}
                  >
                    Clear
                  </Button>
                </div>

                {/* Subjects List */}
                {loadingSubjects ? (
                  <p className="text-center text-gray-500">Loading subjects...</p>
                ) : subjects.length === 0 ? (
                  <p className="text-gray-600 dark:text-gray-400">No subjects found</p>
                ) : (
                  <div className="space-y-2">
                    {subjects.map((subject) => (
                      <div
                        key={subject.id}
                        className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-lg flex items-center justify-between"
                      >
                        <div className="flex-1">
                          <h4 className="font-semibold">{subject.name}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Slug: {subject.slug}
                          </p>
                          {subject._count && (
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                              {subject._count.lessons} lesson{subject._count.lessons !== 1 ? 's' : ''}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingSubject(subject)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteSubject(subject.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* LESSONS TAB */}
          <TabsContent value="lessons" className="space-y-4">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Manage Lessons</CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Edit, publish, or delete lessons
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search and Filter */}
                <div className="flex flex-col md:flex-row gap-2">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search lessons..."
                      value={searchLesson}
                      onChange={(e) => setSearchLesson(e.target.value)}
                      onBlur={fetchLessons}
                      className="pl-10"
                    />
                  </div>
                  <Select value={filterPublished} onValueChange={(v) => setFilterPublished(v)}>
                    <SelectTrigger className="md:w-40">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All</SelectItem>
                      <SelectItem value="true">Published</SelectItem>
                      <SelectItem value="false">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={fetchLessons}>Filter</Button>
                </div>

                {loadingLessons ? (
                  <p>Loading...</p>
                ) : lessons.length === 0 ? (
                  <p className="text-gray-600 dark:text-gray-400">No lessons found</p>
                ) : (
                  <div className="space-y-3">
                    {lessons.map((lesson) => (
                      <div key={lesson.id} className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-lg">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <h4 className="font-semibold">{lesson.title}</h4>
                            <div className="flex items-center gap-2 mt-2 text-xs text-gray-600 dark:text-gray-400">
                              <span>{lesson.subject?.name || 'No subject'}</span>
                              <span>•</span>
                              <span>{lesson.views} views</span>
                              <span>•</span>
                              <Badge className="text-xs capitalize">{lesson.difficulty}</Badge>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Badge
                              className={
                                lesson.published
                                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                  : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                              }
                            >
                              {lesson.published ? 'Published' : 'Draft'}
                            </Badge>
                          </div>
                        </div>

                        <div className="flex gap-2 mt-3">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePublishLesson(lesson.id, lesson.published)}
                          >
                            {lesson.published ? 'Unpublish' : 'Publish'}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteLesson(lesson.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* USERS TAB */}
          <TabsContent value="users" className="space-y-4">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>User Management</CardTitle>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      Create, edit, and delete users
                    </p>
                  </div>
                  <Button
                    onClick={() => setShowNewUserForm(!showNewUserForm)}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    New User
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* New User Form */}
                {showNewUserForm && (
                  <Card className="border-2 border-blue-500 bg-blue-50 dark:bg-blue-900/20">
                    <CardContent className="pt-6 space-y-4">
                      <div>
                        <Label>Email</Label>
                        <Input
                          type="email"
                          placeholder="user@example.com"
                          value={newUserForm.email}
                          onChange={(e) =>
                            setNewUserForm({ ...newUserForm, email: e.target.value })
                          }
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label>Name</Label>
                        <Input
                          placeholder="Full Name"
                          value={newUserForm.name}
                          onChange={(e) =>
                            setNewUserForm({ ...newUserForm, name: e.target.value })
                          }
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label>Role</Label>
                        <Select
                          value={newUserForm.role}
                          onValueChange={(value) =>
                            setNewUserForm({ ...newUserForm, role: value })
                          }
                        >
                          <SelectTrigger className="mt-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="student">Student</SelectItem>
                            <SelectItem value="teacher">Teacher</SelectItem>
                            <SelectItem value="moderator">Moderator</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex gap-2">
                        <Button className="flex-1" onClick={handleCreateUser}>
                          Create User
                        </Button>
                        <Button
                          className="flex-1"
                          variant="outline"
                          onClick={() => setShowNewUserForm(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Search and Filter */}
                <div className="flex flex-col md:flex-row gap-2">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search by name or email..."
                      value={searchUser}
                      onChange={(e) => setSearchUser(e.target.value)}
                      onBlur={fetchUsers}
                      className="pl-10"
                    />
                  </div>
                  <Select value={filterRole} onValueChange={(v) => setFilterRole(v)}>
                    <SelectTrigger className="md:w-40">
                      <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Roles</SelectItem>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="teacher">Teacher</SelectItem>
                      <SelectItem value="moderator">Moderator</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={fetchUsers}>Filter</Button>
                </div>

                {/* Edit User Form */}
                {editingUser && (
                  <Card className="border-2 border-purple-500 bg-purple-50 dark:bg-purple-900/20">
                    <CardHeader>
                      <CardTitle>Edit User: {editingUser.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>Name</Label>
                        <Input
                          value={editingUser.name}
                          onChange={(e) =>
                            setEditingUser({ ...editingUser, name: e.target.value })
                          }
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label>Role</Label>
                        <Select
                          value={editingUser.role}
                          onValueChange={(value) =>
                            setEditingUser({ ...editingUser, role: value })
                          }
                        >
                          <SelectTrigger className="mt-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="student">Student</SelectItem>
                            <SelectItem value="teacher">Teacher</SelectItem>
                            <SelectItem value="moderator">Moderator</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex gap-2">
                        <Button className="flex-1" onClick={handleUpdateUser}>
                          Save Changes
                        </Button>
                        <Button
                          className="flex-1"
                          variant="outline"
                          onClick={() => setEditingUser(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Users List */}
                {loadingUsers ? (
                  <p>Loading...</p>
                ) : users.length === 0 ? (
                  <p className="text-gray-600 dark:text-gray-400">No users found</p>
                ) : (
                  <div className="space-y-3">
                    {users.map((u) => (
                      <div key={u.id} className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-lg">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <h4 className="font-semibold">{u.name}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{u.email}</p>
                            <div className="flex items-center gap-2 mt-2 text-xs text-gray-600 dark:text-gray-400">
                              <Badge variant="outline" className="capitalize">
                                {u.role}
                              </Badge>
                              <span>{u._count.uploads} uploads</span>
                              <span>•</span>
                              <span>{u._count.bookmarks} bookmarks</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2 mt-3">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingUser(u)}
                          >
                            <Edit2 className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteUser(u.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* MODERATORS TAB */}
          <TabsContent value="moderators" className="space-y-4">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Moderator Management</CardTitle>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      Add and remove moderators
                    </p>
                  </div>
                  <Button
                    onClick={() => setShowNewModeratorForm(!showNewModeratorForm)}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Moderator
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* New Moderator Form */}
                {showNewModeratorForm && (
                  <Card className="border-2 border-blue-500 bg-blue-50 dark:bg-blue-900/20">
                    <CardContent className="pt-6 space-y-4">
                      <div>
                        <Label>Email</Label>
                        <Input
                          type="email"
                          placeholder="moderator@example.com"
                          value={newModeratorForm.email}
                          onChange={(e) =>
                            setNewModeratorForm({
                              ...newModeratorForm,
                              email: e.target.value,
                            })
                          }
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label>Name</Label>
                        <Input
                          placeholder="Moderator Name"
                          value={newModeratorForm.name}
                          onChange={(e) =>
                            setNewModeratorForm({
                              ...newModeratorForm,
                              name: e.target.value,
                            })
                          }
                          className="mt-2"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button className="flex-1" onClick={handleCreateModerator}>
                          Add Moderator
                        </Button>
                        <Button
                          className="flex-1"
                          variant="outline"
                          onClick={() => setShowNewModeratorForm(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Moderators List */}
                {moderators.length === 0 ? (
                  <p className="text-gray-600 dark:text-gray-400">No moderators yet</p>
                ) : (
                  <div className="space-y-3">
                    {moderators.map((mod) => (
                      <div key={mod.id} className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-lg">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <h4 className="font-semibold">{mod.name}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{mod.email}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                              Joined{' '}
                              {new Date(mod.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <div className="mt-3">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRemoveModerator(mod.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Remove Role
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
