import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/nextauth';
import prisma from '@/lib/db';

// Check if user is admin
async function checkAdmin(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return null;
  }
  const user = await prisma.user.findUnique({
    where: { id: (session.user as any).id },
  });
  if (user?.role !== 'admin') {
    return null;
  }
  return user;
}

// GET: List all lessons with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const admin = await checkAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized - Admin only' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const published = searchParams.get('published');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'newest';

    const skip = (page - 1) * limit;
    const where: any = {};

    if (published === 'true') {
      where.published = true;
    } else if (published === 'false') {
      where.published = false;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const orderBy: any = {};
    switch (sort) {
      case 'views':
        orderBy.views = 'desc';
        break;
      case 'oldest':
        orderBy.createdAt = 'asc';
        break;
      default:
        orderBy.createdAt = 'desc';
    }

    const [lessons, total] = await Promise.all([
      prisma.lesson.findMany({
        where,
        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
          published: true,
          difficulty: true,
          views: true,
          createdAt: true,
          author: { select: { id: true, name: true, email: true } },
          subject: { select: { id: true, name: true } },
        },
        skip,
        take: limit,
        orderBy,
      }),
      prisma.lesson.count({ where }),
    ]);

    return NextResponse.json({
      lessons,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Error fetching lessons:', error);
    return NextResponse.json({ error: 'Failed to fetch lessons' }, { status: 500 });
  }
}
