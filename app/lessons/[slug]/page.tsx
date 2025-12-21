import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { LessonViewW3Style } from '@/components/lessons/lesson-view-w3style';

type Props = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { data: lesson } = await supabase
    .from('lessons')
    .select('*, subject:subjects(*)')
    .eq('slug', params.slug)
    .eq('is_published', true)
    .maybeSingle();

  if (!lesson) {
    return {
      title: 'Lesson Not Found',
    };
  }

  return {
    title: `${lesson.title} | ScholarHub`,
    description: lesson.content?.substring(0, 160) || `Learn about ${lesson.title} in ${lesson.subject?.name}`,
    openGraph: {
      title: lesson.title,
      description: lesson.content?.substring(0, 160) || `Learn about ${lesson.title}`,
      type: 'article',
    },
  };
}

export default async function LessonPage({ params }: Props) {
  const { data: lesson, error } = await supabase
    .from('lessons')
    .select('*, subject:subjects(*), author:profiles(*)')
    .eq('slug', params.slug)
    .eq('is_published', true)
    .maybeSingle();

  if (error || !lesson) {
    notFound();
  }

  // Increment view count (only once per render)
  const { error: viewError } = await supabase
    .from('lessons')
    .update({ views: (lesson.views || 0) + 1 })
    .eq('id', lesson.id);

  if (viewError) {
    console.error('Error incrementing view count:', viewError);
  }

  // Fetch tags
  const { data: tags } = await supabase
    .from('lesson_tags')
    .select('tag:tags(*)')
    .eq('lesson_id', lesson.id);

  // Fetch adjacent lessons for navigation (only if lesson has a subject)
  let previousLesson = null;
  let nextLesson = null;

  if (lesson.subject_id) {
    const { data: allLessons, error: lessonsError } = await supabase
      .from('lessons')
      .select('*, subject:subjects(*), author:profiles(*)')
      .eq('subject_id', lesson.subject_id)
      .eq('is_published', true)
      .order('created_at', { ascending: true });

    if (lessonsError) {
      console.error('Error fetching adjacent lessons:', lessonsError);
    }

    if (allLessons && allLessons.length > 0) {
      const currentIndex = allLessons.findIndex((l) => l.id === lesson.id);
      if (currentIndex > 0) {
        previousLesson = allLessons[currentIndex - 1];
      }
      if (currentIndex < allLessons.length - 1) {
        nextLesson = allLessons[currentIndex + 1];
      }
    }
  } else {
    console.warn(`Lesson "${lesson.title}" has no subject_id assigned`);
  }

  const lessonWithTags = {
    ...lesson,
    tags: tags?.map((t: any) => t.tag) || [],
  };

  return <LessonViewW3Style lesson={lessonWithTags} previousLesson={previousLesson} nextLesson={nextLesson} />;
}
