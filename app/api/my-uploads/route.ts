import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const uploads = await prisma.lesson.findMany({
      where: { authorId: userId, published: false },
      select: {
        id: true,
        title: true,
        slug: true,
        published: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedUploads = uploads.map((u) => ({
      id: u.id,
      title: u.title,
      status: u.published ? 'published' : 'pending',
      createdAt: u.createdAt,
    }));

    return NextResponse.json(formattedUploads);
  } catch (error) {
    console.error('Error fetching uploads:', error);
    return NextResponse.json({ error: 'Failed to fetch uploads' }, { status: 500 });
  }
}
