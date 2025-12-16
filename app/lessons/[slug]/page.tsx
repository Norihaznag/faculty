import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { LessonView } from '@/components/lessons/lesson-view';

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
    title: `${lesson.title} | EduHub`,
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

  await supabase
    .from('lessons')
    .update({ views: lesson.views + 1 })
    .eq('id', lesson.id);

  const { data: tags } = await supabase
    .from('lesson_tags')
    .select('tag:tags(*)')
    .eq('lesson_id', lesson.id);

  const lessonWithTags = {
    ...lesson,
    tags: tags?.map((t: any) => t.tag) || [],
  };

  return <LessonView lesson={lessonWithTags} />;
}
