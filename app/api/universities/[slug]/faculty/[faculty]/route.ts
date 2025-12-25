import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string; faculty: string } }
) {
  try {
    const faculty = await prisma.faculty.findFirst({
      where: {
        slug: params.faculty,
        university: { slug: params.slug },
      },
      include: {
        university: { select: { name: true, slug: true } },
        programs: {
          select: {
            id: true,
            name: true,
            slug: true,
            _count: { select: { semesters: true } },
          },
          orderBy: { name: 'asc' },
        },
      },
    });

    if (!faculty) {
      return NextResponse.json({ error: 'Faculty not found' }, { status: 404 });
    }

    return NextResponse.json(faculty);
  } catch (error) {
    console.error('Error fetching faculty:', error);
    return NextResponse.json({ error: 'Failed to fetch faculty' }, { status: 500 });
  }
}
