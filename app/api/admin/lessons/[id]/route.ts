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

// GET: Get single lesson details
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await checkAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized - Admin only' }, { status: 401 });
    }

    const lesson = await prisma.lesson.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        content: true,
        published: true,
        difficulty: true,
        views: true,
        createdAt: true,
        updatedAt: true,
        author: { select: { id: true, name: true, email: true } },
        subject: { select: { id: true, name: true } },
      },
    });

    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    return NextResponse.json({ lesson });
  } catch (error) {
    console.error('Error fetching lesson:', error);
    return NextResponse.json({ error: 'Failed to fetch lesson' }, { status: 500 });
  }
}

// PATCH: Update lesson (publish, edit, etc.)
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await checkAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized - Admin only' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, content, difficulty, published } = body;

    const updatedLesson = await prisma.lesson.update({
      where: { id: params.id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(content && { content }),
        ...(difficulty && { difficulty }),
        ...(published !== undefined && { published }),
      },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        published: true,
        difficulty: true,
        views: true,
        createdAt: true,
        author: { select: { id: true, name: true } },
        subject: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ lesson: updatedLesson });
  } catch (error: any) {
    console.error('Error updating lesson:', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to update lesson' }, { status: 500 });
  }
}

// DELETE: Delete lesson
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await checkAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized - Admin only' }, { status: 401 });
    }

    const lesson = await prisma.lesson.findUnique({
      where: { id: params.id },
      select: { id: true },
    });

    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    // Delete lesson (cascade deletes bookmarks, etc. if configured)
    await prisma.lesson.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Lesson deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting lesson:', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to delete lesson' }, { status: 500 });
  }
}
