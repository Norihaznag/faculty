'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { useAuth } from '@/lib/auth-context';
import { supabase, Subject } from '@/lib/supabase';
import { slugify } from '@/lib/utils/slug';
import { Upload, CheckCircle, ChevronDown, Zap, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

type ContentType = 'lesson' | 'pdf' | 'book' | 'module' | 'link';

export default function UploadPage() {
  const router = useRouter();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [suggestedSubjectName, setSuggestedSubjectName] = useState('');
  const [subjectSearchOpen, setSubjectSearchOpen] = useState(false);
  const [contentType, setContentType] = useState<ContentType>('lesson');
  const [semester, setSemester] = useState('');
  const [tags, setTags] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [advancedMode, setAdvancedMode] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [seoTitle, setSeoTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');

  useEffect(() => {
    const fetchSubjects = async () => {
      const { data } = await supabase
        .from('subjects')
        .select('*')
        .order('order_index');

      if (data) {
        setSubjects(data);
      }
    };
    
    if (!authLoading && !user) {
      router.push('/auth/login');
    } else {
      fetchSubjects();
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setAiError('');
    setLoading(true);

    if (!title.trim()) {
      setError('Please provide a title');
      setLoading(false);
      return;
    }

    if (!subjectId && !suggestedSubjectName.trim()) {
      setError('Please select or enter a faculty');
      setLoading(false);
      return;
    }

    // Prepare content based on type
    let finalContent: string | null = null;
    let pdfUrl: string | null = null;
    let externalLink: string | null = null;

    if (contentType === 'lesson' || contentType === 'module') {
      finalContent = content.trim() || null;
    } else if (contentType === 'pdf' || contentType === 'book') {
      pdfUrl = content.trim() || null;
    } else if (contentType === 'link') {
      externalLink = content.trim() || null;
    }

    const tagsArray = tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    // If admin, publish directly as lesson. Otherwise, create upload for review.
    if (isAdmin) {
      // Admin uploads go directly to lessons
      let finalSubjectId = subjectId;

      // If there's a suggested subject name but no subject_id, create the subject
      if (suggestedSubjectName.trim() && !subjectId) {
        const subjectSlug = slugify(suggestedSubjectName.trim());
        const { data: newSubject, error: subjectError } = await supabase
          .from('subjects')
          .insert({
            name: suggestedSubjectName.trim(),
            slug: subjectSlug,
            order_index: 0,
          })
          .select()
          .single();

        if (!subjectError && newSubject) {
          finalSubjectId = newSubject.id;
        }
      }

      if (!finalSubjectId) {
        setError('Please select or enter a subject');
        setLoading(false);
        return;
      }

      const slug = slugify((seoTitle || title).trim());
      const { error: lessonError } = await supabase.from('lessons').insert({
        title: seoTitle.trim() || title.trim(),
        slug: slug,
        content: finalContent,
        subject_id: finalSubjectId,
        semester: advancedMode && semester.trim() ? semester.trim() : null,
        pdf_url: pdfUrl,
        external_link: externalLink,
        author_id: user?.id,
        is_published: true,
        is_premium: false,
      });

      if (lessonError) {
        setError(lessonError.message);
        setLoading(false);
      } else {
        setSuccess(true);
        setTitle('');
        setContent('');
        setSubjectId('');
        setSuggestedSubjectName('');
        setSemester('');
        setTags('');
        setSeoTitle('');
        setMetaDescription('');
        setLoading(false);

        setTimeout(() => {
          setSuccess(false);
        }, 5000);
      }
    } else {
      // Regular users: create upload for review
      const uploadData: any = {
        title: seoTitle.trim() || title.trim(),
        content: finalContent,
        pdf_url: pdfUrl,
        external_link: externalLink,
        semester: advancedMode && semester.trim() ? semester.trim() : null,
        tags: advancedMode && tagsArray.length > 0 ? tagsArray : [],
        uploader_id: user?.id,
        status: 'pending',
      };

      // If subject exists, use subject_id, otherwise use suggested_subject_name
      if (subjectId) {
        uploadData.subject_id = subjectId;
      } else if (suggestedSubjectName.trim()) {
        uploadData.suggested_subject_name = suggestedSubjectName.trim();
      }

      const { error: uploadError } = await supabase.from('uploads').insert(uploadData);

      if (uploadError) {
        setError(uploadError.message);
        setLoading(false);
      } else {
        setSuccess(true);
        setTitle('');
        setContent('');
        setSubjectId('');
        setSuggestedSubjectName('');
        setSemester('');
        setTags('');
        setSeoTitle('');
        setMetaDescription('');
        setLoading(false);

        setTimeout(() => {
          setSuccess(false);
        }, 5000);
      }
    }
  };

  const handleAiFromFile = async () => {
    if (!uploadFile) {
      setAiError('Please choose a .txt or .docx file first');
      return;
    }

    setAiError('');
    setAiLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', uploadFile);

      const res = await fetch('/api/ai/analyze-upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || 'Failed to analyze file');
      }

      if (data.snippet && typeof data.snippet === 'string' && !content) {
        setContent(data.snippet);
      }

      if (Array.isArray(data.tags) && data.tags.length > 0) {
        setTags(data.tags.join(', '));
      }

      if (data.seoTitle && !seoTitle) {
        setSeoTitle(data.seoTitle);
      }

      if (data.metaDescription && !metaDescription) {
        setMetaDescription(data.metaDescription);
      }
    } catch (err: any) {
      setAiError(err?.message || 'Failed to analyze file with AI');
    } finally {
      setAiLoading(false);
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

  const selectedSubject = subjects.find((s) => s.id === subjectId);
  const subjectDisplayValue = selectedSubject?.name || suggestedSubjectName;

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Upload className="h-6 w-6" />
            <h1 className="text-3xl font-bold">Upload Content</h1>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setAdvancedMode(!advancedMode)}
            className="gap-2"
          >
            {advancedMode ? <Zap className="h-4 w-4" /> : <Settings className="h-4 w-4" />}
            {advancedMode ? 'Quick Mode' : 'Advanced'}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {advancedMode ? (
                <>
                  <Settings className="h-5 w-5" />
                  Advanced Upload
                </>
              ) : (
                <>
                  <Zap className="h-5 w-5" />
                  Quick Upload
                </>
              )}
            </CardTitle>
            <CardDescription>
              {advancedMode
                ? 'Share educational content with all options available.'
                : 'Fast and simple way to upload content. Just fill the essentials!'}
              <br />
              Your submission will be reviewed by an admin before publishing.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {aiError && (
                <Alert variant="destructive">
                  <AlertDescription>{aiError}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    {isAdmin ? (
                      <>Your lesson has been published successfully!</>
                    ) : (
                      <>
                        Your submission has been received and is pending admin approval!
                        {suggestedSubjectName && !subjectId && (
                          <span className="block mt-1 text-xs">
                            Note: You suggested a new faculty &quot;{suggestedSubjectName}&quot;. Admin will review and create it if approved.
                          </span>
                        )}
                      </>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  type="text"
                  placeholder="e.g., Introduction to React Hooks"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  disabled={loading}
                  className="text-base"
                />
              </div>

              {advancedMode && (
                <div className="space-y-2">
                  <Label htmlFor="seoTitle">SEO Title (Optional, AI suggested)</Label>
                  <Input
                    id="seoTitle"
                    type="text"
                    placeholder="Short, search-friendly title"
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    disabled={loading}
                    className="text-base"
                  />
                  <Label htmlFor="metaDescription" className="mt-2 block">
                    Meta Description (Optional, AI suggested)
                  </Label>
                  <Textarea
                    id="metaDescription"
                    placeholder="Short summary that will show in search results."
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    disabled={loading}
                    rows={3}
                    className="text-base"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="subject">Faculty *</Label>
                <Popover open={subjectSearchOpen} onOpenChange={setSubjectSearchOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={subjectSearchOpen}
                      className="w-full justify-between"
                      disabled={loading}
                    >
                      {subjectDisplayValue || 'Select or type a faculty...'}
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                    <Command>
                      <CommandInput
                        placeholder="Search or type new faculty..."
                        value={suggestedSubjectName}
                        onValueChange={(value) => {
                          setSuggestedSubjectName(value);
                          // Check if value matches an existing subject
                          const found = subjects.find(
                            (s) => s.name.toLowerCase() === value.toLowerCase()
                          );
                          if (found) {
                            setSubjectId(found.id);
                            setSuggestedSubjectName('');
                          } else {
                            setSubjectId('');
                          }
                        }}
                      />
                      <CommandList>
                        <CommandEmpty>
                          <p className="py-2 text-center text-sm text-muted-foreground">
                            No faculty found
                          </p>
                        </CommandEmpty>

                        {/* Suggest creating a new faculty based on what the user is typing */}
                        {suggestedSubjectName.trim() &&
                          !subjects.some(
                            (s) =>
                              s.name.toLowerCase() === suggestedSubjectName.trim().toLowerCase()
                          ) && (
                            <CommandGroup>
                              <CommandItem
                                value={suggestedSubjectName}
                                onSelect={() => {
                                  // Clear any selected subject id so we treat this as a new faculty
                                  setSubjectId('');
                                  setSubjectSearchOpen(false);
                                }}
                              >
                                <span className="mr-2 text-primary font-medium">+</span>
                                Use &quot;{suggestedSubjectName}&quot; as a new faculty
                              </CommandItem>
                            </CommandGroup>
                          )}

                        <CommandGroup>
                          {subjects.map((subject) => (
                            <CommandItem
                              key={subject.id}
                              value={subject.name}
                              onSelect={() => {
                                setSubjectId(subject.id);
                                setSuggestedSubjectName('');
                                setSubjectSearchOpen(false);
                              }}
                            >
                              <CheckCircle
                                className={cn(
                                  'mr-2 h-4 w-4',
                                  subjectId === subject.id ? 'opacity-100' : 'opacity-0'
                                )}
                              />
                              {subject.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                {suggestedSubjectName && !subjectId && (
                  <p className="text-xs text-muted-foreground">
                    ✓ New faculty &quot;{suggestedSubjectName}&quot; will be suggested to admin
                  </p>
                )}
              </div>

              {advancedMode && (
                <div className="space-y-2">
                  <Label htmlFor="semester">Semester (Optional)</Label>
                  <Input
                    id="semester"
                    type="text"
                    placeholder="e.g., Fall 2024, Semester 1"
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    disabled={loading}
                  />
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="content">
                    {contentType === 'lesson' && 'Lesson Content'}
                    {contentType === 'module' && 'Module Content'}
                    {contentType === 'pdf' && 'PDF URL'}
                    {contentType === 'book' && 'Book/Reference URL'}
                    {contentType === 'link' && 'External Link'}
                    {advancedMode && ' (Optional)'}
                  </Label>
                  {!advancedMode && (
                    <Select value={contentType} onValueChange={(v) => setContentType(v as ContentType)}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lesson">Lesson</SelectItem>
                        <SelectItem value="module">Module</SelectItem>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="book">Book</SelectItem>
                        <SelectItem value="link">Link</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
                {contentType === 'lesson' || contentType === 'module' ? (
                  <>
                    <Textarea
                      id="content"
                      placeholder={
                        advancedMode
                          ? 'Write or paste the content here. You can use HTML for formatting.'
                          : 'Paste your content here...'
                      }
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      rows={advancedMode ? 8 : 6}
                      disabled={loading}
                      className="text-base"
                    />
                    <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <Input
                        type="file"
                        accept=".txt,.md,.docx"
                        disabled={loading || aiLoading}
                        onChange={(e) => {
                          setUploadFile(e.target.files?.[0] || null);
                          setAiError('');
                        }}
                        className="text-sm"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAiFromFile}
                        disabled={aiLoading || !uploadFile}
                        className="mt-2 sm:mt-0"
                      >
                        {aiLoading ? 'Analyzing with AI...' : 'Generate tags & SEO from file'}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Upload a .txt or .docx file and let AI suggest tags and SEO fields for you.
                    </p>
                  </>
                ) : (
                  <Input
                    id="content"
                    type="url"
                    placeholder={
                      contentType === 'pdf'
                        ? 'https://example.com/file.pdf'
                        : 'https://example.com/resource'
                    }
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    disabled={loading}
                    className="text-base"
                  />
                )}
                {contentType === 'lesson' && advancedMode && (
                  <p className="text-xs text-muted-foreground">Supports HTML formatting</p>
                )}
              </div>

              {advancedMode && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="contentType">Content Type</Label>
                    <Select value={contentType} onValueChange={(v) => setContentType(v as ContentType)}>
                      <SelectTrigger id="contentType">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lesson">Lesson</SelectItem>
                        <SelectItem value="module">Module</SelectItem>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="book">Book</SelectItem>
                        <SelectItem value="link">External Link</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags (Optional)</Label>
                    <Input
                      id="tags"
                      type="text"
                      placeholder="programming, tutorial, beginner"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      disabled={loading}
                    />
                    <p className="text-xs text-muted-foreground">
                      Separate multiple tags with commas
                    </p>
                  </div>
                </>
              )}

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? 'Submitting...' : advancedMode ? 'Submit for Review' : 'Quick Submit'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}

