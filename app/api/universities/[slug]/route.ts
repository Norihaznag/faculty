import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const university = await prisma.university.findUnique({
      where: { slug: params.slug },
      include: {
        faculties: {
          select: {
            id: true,
            name: true,
            slug: true,
            _count: { select: { programs: true } },
          },
          orderBy: { name: 'asc' },
        },
      },
    });

    if (!university) {
      return NextResponse.json({ error: 'University not found' }, { status: 404 });
    }

    return NextResponse.json(university);
  } catch (error) {
    console.error('Error fetching university:', error);
    return NextResponse.json({ error: 'Failed to fetch university' }, { status: 500 });
  }
}
