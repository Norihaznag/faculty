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

// PATCH: Update subject
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const subject = await prisma.subject.update({
      where: { id: params.id },
      data: { name },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });

    return NextResponse.json({ subject });
  } catch (error: any) {
    console.error('Error updating subject:', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Subject not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to update subject' }, { status: 500 });
  }
}

// DELETE: Delete subject
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await checkAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized - Admin only' }, { status: 401 });
    }

    const subject = await prisma.subject.findUnique({
      where: { id: params.id },
      select: { _count: { select: { lessons: true } } },
    });

    if (!subject) {
      return NextResponse.json({ error: 'Subject not found' }, { status: 404 });
    }

    if (subject._count.lessons > 0) {
      return NextResponse.json(
        { error: 'Cannot delete subject with existing lessons' },
        { status: 400 }
      );
    }

    await prisma.subject.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Subject deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting subject:', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Subject not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to delete subject' }, { status: 500 });
  }
}
