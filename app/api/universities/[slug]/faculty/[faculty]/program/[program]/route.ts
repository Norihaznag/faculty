import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { slug: string; faculty: string; program: string } }
) {
  try {
    const programData = await prisma.program.findFirst({
      where: {
        slug: params.program,
        faculty: {
          slug: params.faculty,
          university: {
            slug: params.slug,
          },
        },
      },
      include: {
        semesters: {
          select: {
            id: true,
            name: true,
            order: true,
            _count: {
              select: {
                subjects: true,
              },
            },
          },
          orderBy: {
            order: "asc",
          },
        },
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
    });

    if (!programData) {
      return NextResponse.json(
        { error: "Program not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(programData);
  } catch (error) {
    console.error("Error fetching program:", error);
    return NextResponse.json(
      { error: "Failed to fetch program" },
      { status: 500 }
    );
  }
}
