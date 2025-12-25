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

// GET: List all subjects
export async function GET(request: NextRequest) {
  try {
    const admin = await checkAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized - Admin only' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    const where: any = {};
    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    const subjects = await prisma.subject.findMany({
      where,
      select: {
        id: true,
        name: true,
        slug: true,
        _count: { select: { lessons: true } },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ subjects });
  } catch (error) {
    console.error('Error fetching subjects:', error);
    return NextResponse.json({ error: 'Failed to fetch subjects' }, { status: 500 });
  }
}

// POST: Create new subject
export async function POST(request: NextRequest) {
  try {
    const admin = await checkAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized - Admin only' }, { status: 401 });
    }

    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json({ error: 'Subject name required' }, { status: 400 });
    }

    // Check if subject already exists
    const existing = await prisma.subject.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } },
    });

    if (existing) {
      return NextResponse.json({ error: 'Subject already exists' }, { status: 409 });
    }

    // Generate slug
    const slug = name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '');

    const subject = await prisma.subject.create({
      data: {
        name,
        slug,
      },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });

    return NextResponse.json({ subject }, { status: 201 });
  } catch (error) {
    console.error('Error creating subject:', error);
    return NextResponse.json({ error: 'Failed to create subject' }, { status: 500 });
  }
}

