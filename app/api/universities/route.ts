import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

const MOROCCAN_UNIVERSITIES = [
  { name: 'Ibn Zohr University', slug: 'ibn-zohr', city: 'Agadir' },
  { name: 'Qadi Ayyad University', slug: 'qadi-ayyad', city: 'Marrakech' },
  { name: 'University of Fez', slug: 'university-of-fez', city: 'Fez' },
  { name: 'Hassan II University', slug: 'hassan-ii', city: 'Casablanca' },
  { name: 'Al Akhawayn University', slug: 'al-akhawayn', city: 'Ifrane' },
  { name: 'University of Rabat', slug: 'university-of-rabat', city: 'Rabat' },
  { name: 'Sultan Moulay Slimane University', slug: 'sultan-moulay-slimane', city: 'Beni Mellal' },
  { name: 'University of Tangier', slug: 'university-of-tangier', city: 'Tangier' },
];

export async function POST(request: NextRequest) {
  try {
    // Check for admin authorization
    const auth = request.headers.get('authorization');
    if (!auth?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Seed universities
    const created = await Promise.all(
      MOROCCAN_UNIVERSITIES.map((uni) =>
        prisma.university.upsert({
          where: { slug: uni.slug },
          update: {},
          create: {
            name: uni.name,
            slug: uni.slug,
            city: uni.city,
          },
        })
      )
    );

    return NextResponse.json({
      success: true,
      count: created.length,
      universities: created,
    });
  } catch (error) {
    console.error('Error seeding universities:', error);
    return NextResponse.json(
      { error: 'Failed to seed universities' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const universities = await prisma.university.findMany({
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(universities);
  } catch (error) {
    console.error('Error fetching universities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch universities' },
      { status: 500 }
    );
  }
}
