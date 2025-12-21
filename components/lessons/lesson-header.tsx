'use client';

import React from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Eye, Clock, User } from 'lucide-react';
import { cn } from '@/lib/utils';

type LessonHeaderProps = {
  title: string;
  author?: {
    full_name?: string;
  } | null;
  views?: number;
  semester?: string | null;
  tags?: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  className?: string;
};

export function LessonHeader({
  title,
  author,
  views = 0,
  semester,
  tags = [],
  className,
}: LessonHeaderProps) {
  const readingTime = Math.ceil((title.length + 500) / 200); // Rough estimate

  return (
    <header className={cn('mb-12 pb-8 border-b border-slate-800', className)}>
      {/* Title */}
      <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
        {title}
      </h1>

      {/* Metadata Row */}
      <div className="flex flex-wrap items-center gap-6 text-slate-400 text-sm mb-6">
        {author?.full_name && (
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            <span>By {author.full_name}</span>
          </div>
        )}

        {views > 0 && (
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-primary" />
            <span>{views.toLocaleString()} views</span>
          </div>
        )}

        {readingTime > 0 && (
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            <span>{readingTime} min read</span>
          </div>
        )}

        {semester && (
          <div className="flex items-center gap-2">
            <span className="capitalize">
              {semester}
            </span>
          </div>
        )}
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Link
              key={tag.id}
              href={`/search?tag=${encodeURIComponent(tag.slug)}`}
              passHref
            >
              <Badge variant="outline" className="cursor-pointer hover:bg-primary/20 transition-colors">
                {tag.name}
              </Badge>
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
