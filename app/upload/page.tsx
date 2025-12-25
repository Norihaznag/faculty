'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/lib/auth-context';
import { Upload, CheckCircle, AlertCircle } from 'lucide-react';

interface University {
  id: string;
  name: string;
  slug: string;
}

interface Faculty {
  id: string;
  name: string;
  slug: string;
}

interface Program {
  id: string;
  name: string;
  slug: string;
}

interface Semester {
  id: string;
  name: string;
  order: number;
}

interface Subject {
  id: string;
  name: string;
  slug: string;
}

export default function UploadPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  // Hierarchical state
  const [universities, setUniversities] = useState<University[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  // Form selections
  const [selectedUni, setSelectedUni] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [selectedProgram, setSelectedProgram] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [subjectId, setSubjectId] = useState('');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load universities on mount
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
      return;
    }

    const fetchUniversities = async () => {
      try {
        const res = await fetch('/api/universities');
        const data = await res.json();
        setUniversities(data || []);
      } catch (err) {
        console.error('Failed to fetch universities');
      }
    };

    fetchUniversities();
  }, [user, authLoading, router]);

  // Load faculties when university changes
  useEffect(() => {
    if (!selectedUni) {
      setFaculties([]);
      setSelectedFaculty('');
      return;
    }

    const fetchFaculties = async () => {
      try {
        const res = await fetch(`/api/universities/${selectedUni}`);
        const data = await res.json();
        setFaculties(data.faculties || []);
      } catch (err) {
        console.error('Failed to fetch faculties');
      }
    };

    fetchFaculties();
  }, [selectedUni]);

  // Load programs when faculty changes
  useEffect(() => {
    if (!selectedUni || !selectedFaculty) {
      setPrograms([]);
      setSelectedProgram('');
      return;
    }

    const fetchPrograms = async () => {
      try {
        const res = await fetch(`/api/universities/${selectedUni}/faculty/${selectedFaculty}`);
        const data = await res.json();
        setPrograms(data.programs || []);
      } catch (err) {
        console.error('Failed to fetch programs');
      }
    };

    fetchPrograms();
  }, [selectedUni, selectedFaculty]);

  // Load semesters when program changes
  useEffect(() => {
    if (!selectedUni || !selectedFaculty || !selectedProgram) {
      setSemesters([]);
      setSelectedSemester('');
      return;
    }

    const fetchSemesters = async () => {
      try {
        const res = await fetch(`/api/universities/${selectedUni}/faculty/${selectedFaculty}/program/${selectedProgram}`);
        const data = await res.json();
        setSemesters(data.semesters || []);
      } catch (err) {
        console.error('Failed to fetch semesters');
      }
    };

    fetchSemesters();
  }, [selectedUni, selectedFaculty, selectedProgram]);

  // Load subjects when semester changes
  useEffect(() => {
    if (!selectedUni || !selectedFaculty || !selectedProgram || !selectedSemester) {
      setSubjects([]);
      setSubjectId('');
      return;
    }

    const fetchSubjects = async () => {
      try {
        const res = await fetch(
          `/api/universities/${selectedUni}/faculty/${selectedFaculty}/program/${selectedProgram}/semester/${selectedSemester}`
        );
        const data = await res.json();
        setSubjects(data.subjects || []);
      } catch (err) {
        console.error('Failed to fetch subjects');
      }
    };

    fetchSubjects();
  }, [selectedUni, selectedFaculty, selectedProgram, selectedSemester]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!title.trim()) {
      setError('Title is required');
      setLoading(false);
      return;
    }

    if (!subjectId) {
      setError('Please select a subject');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          subjectId,
          published: false,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to upload');
      }

      setSuccess(true);
      setTitle('');
      setDescription('');
      setSubjectId('');
      setSelectedUni('');
      setSelectedFaculty('');
      setSelectedProgram('');
      setSelectedSemester('');

      setTimeout(() => {
        setSuccess(false);
        router.push('/my-uploads');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
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

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto py-8 px-4">
        <div className="flex items-center gap-2 mb-8">
          <Upload className="h-6 w-6 text-blue-600" />
          <h1 className="text-3xl font-bold">Upload Lesson</h1>
        </div>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl">Share Your Knowledge</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Lesson uploaded! Redirecting...
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="university" className="text-base font-semibold">
                  University *
                </Label>
                <Select value={selectedUni} onValueChange={setSelectedUni} disabled={loading}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select a university..." />
                  </SelectTrigger>
                  <SelectContent>
                    {universities.map((uni) => (
                      <SelectItem key={uni.id} value={uni.slug}>
                        {uni.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedUni && (
                <div className="space-y-2">
                  <Label htmlFor="faculty" className="text-base font-semibold">
                    Faculty *
                  </Label>
                  <Select value={selectedFaculty} onValueChange={setSelectedFaculty} disabled={loading || !selectedUni}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select a faculty..." />
                    </SelectTrigger>
                    <SelectContent>
                      {faculties.map((fac) => (
                        <SelectItem key={fac.id} value={fac.slug}>
                          {fac.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {selectedFaculty && (
                <div className="space-y-2">
                  <Label htmlFor="program" className="text-base font-semibold">
                    Program *
                  </Label>
                  <Select value={selectedProgram} onValueChange={setSelectedProgram} disabled={loading || !selectedFaculty}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select a program..." />
                    </SelectTrigger>
                    <SelectContent>
                      {programs.map((prog) => (
                        <SelectItem key={prog.id} value={prog.slug}>
                          {prog.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {selectedProgram && (
                <div className="space-y-2">
                  <Label htmlFor="semester" className="text-base font-semibold">
                    Semester *
                  </Label>
                  <Select value={selectedSemester} onValueChange={setSelectedSemester} disabled={loading || !selectedProgram}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select a semester..." />
                    </SelectTrigger>
                    <SelectContent>
                      {semesters.map((sem) => (
                        <SelectItem key={sem.id} value={sem.name.toLowerCase().replace(/\s+/g, '-')}>
                          {sem.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {selectedSemester && (
                <div className="space-y-2">
                  <Label htmlFor="subject" className="text-base font-semibold">
                    Subject *
                  </Label>
                  <Select value={subjectId} onValueChange={setSubjectId} disabled={loading || !selectedSemester}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select a subject..." />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="title" className="text-base font-semibold">
                  Lesson Title *
                </Label>
                <Input
                  id="title"
                  type="text"
                  placeholder="e.g., Introduction to React"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  disabled={loading}
                  className="h-10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-base font-semibold">
                  Content / Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="Write your lesson content, description, or paste content here..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={8}
                  disabled={loading}
                  className="text-base resize-none"
                />
              </div>

              <Button
                type="submit"
                disabled={loading || !subjectId}
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base"
              >
                {loading ? 'Uploading...' : 'Upload Lesson'}
              </Button>

              <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                Your lesson will be reviewed before publishing
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}

