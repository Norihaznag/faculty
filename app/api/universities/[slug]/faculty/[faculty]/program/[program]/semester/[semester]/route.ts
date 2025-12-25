import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { slug: string; faculty: string; program: string; semester: string } }
) {
  try {
    // Convert semester name (e.g., 's1' or 's-1') to proper case (e.g., 'S1')
    const semesterName = params.semester.toUpperCase().replace('-', '');

    const semesterData = await prisma.semester.findFirst({
      where: {
        name: semesterName,
        program: {
          slug: params.program,
          faculty: {
            slug: params.faculty,
            university: {
              slug: params.slug,
            },
          },
        },
      },
      include: {
        subjects: {
          select: {
            id: true,
            name: true,
            slug: true,
            color: true,
            icon: true,
            _count: {
              select: {
                lessons: true,
              },
            },
          },
          orderBy: {
            name: "asc",
          },
        },
        program: {
          select: {
            name: true,
            slug: true,
            faculty: {
              select: {
                name: true,
                slug: true,
                university: {
                  select: {
                    name: true,
                    slug: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!semesterData) {
      return NextResponse.json(
        { error: "Semester not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(semesterData);
  } catch (error) {
    console.error("Error fetching semester:", error);
    return NextResponse.json(
      { error: "Failed to fetch semester" },
      { status: 500 }
    );
  }
}
