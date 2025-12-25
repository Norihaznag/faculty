import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/nextauth';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get stats
    const [userCount, lessonCount, subjectCount, uploadCount] = await Promise.all([
      prisma.user.count(),
      prisma.lesson.count({ where: { published: true } }),
      prisma.subject.count(),
      prisma.upload.count(),
    ]);

    return NextResponse.json({
      stats: {
        users: userCount,
        lessons: lessonCount,
        subjects: subjectCount,
        uploads: uploadCount,
      },
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
