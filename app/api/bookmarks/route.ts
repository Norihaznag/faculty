import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const bookmarks = await prisma.bookmark.findMany({
      where: { userId },
      select: {
        lesson: {
          select: {
            id: true,
            title: true,
            slug: true,
            views: true,
            subject: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const lessons = bookmarks.map((b) => b.lesson).filter(Boolean);
    return NextResponse.json(lessons);
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    return NextResponse.json({ error: 'Failed to fetch bookmarks' }, { status: 500 });
  }
}
