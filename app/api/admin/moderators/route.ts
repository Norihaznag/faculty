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

// GET: List all moderators
export async function GET(request: NextRequest) {
  try {
    const admin = await checkAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized - Admin only' }, { status: 401 });
    }

    const moderators = await prisma.user.findMany({
      where: { role: 'moderator' },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        image: true,
        _count: { select: { uploads: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ moderators });
  } catch (error) {
    console.error('Error fetching moderators:', error);
    return NextResponse.json({ error: 'Failed to fetch moderators' }, { status: 500 });
  }
}

// POST: Create new moderator (promote user or create new)
export async function POST(request: NextRequest) {
  try {
    const admin = await checkAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized - Admin only' }, { status: 401 });
    }

    const { userId, email, name } = await request.json();

    // If userId provided, promote existing user
    if (userId) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      const updated = await prisma.user.update({
        where: { id: userId },
        data: { role: 'moderator' },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
        },
      });

      return NextResponse.json(
        { moderator: updated, message: 'User promoted to moderator' },
        { status: 201 }
      );
    }

    // Otherwise create new moderator
    if (!email || !name) {
      return NextResponse.json({ error: 'Email and name required for new moderator' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    }

    const moderator = await prisma.user.create({
      data: {
        email,
        name,
        role: 'moderator',
        password: '',
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ moderator }, { status: 201 });
  } catch (error) {
    console.error('Error creating moderator:', error);
    return NextResponse.json({ error: 'Failed to create moderator' }, { status: 500 });
  }
}
