import { supabase } from '@/lib/supabase';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com';

  const { data: lessons } = await supabase
    .from('lessons')
    .select('slug, updated_at')
    .eq('is_published', true)
    .order('updated_at', { ascending: false });

  const { data: subjects } = await supabase
    .from('subjects')
    .select('slug')
    .order('order_index');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>

  ${subjects
    ?.map(
      (subject) => `
  <url>
    <loc>${baseUrl}/subjects/${subject.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
    )
    .join('')}

  ${lessons
    ?.map(
      (lesson) => `
  <url>
    <loc>${baseUrl}/lessons/${lesson.slug}</loc>
    <lastmod>${new Date(lesson.updated_at).toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`
    )
    .join('')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}

