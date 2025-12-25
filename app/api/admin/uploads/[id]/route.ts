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

// PATCH: Approve or reject upload
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await checkAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized - Admin only' }, { status: 401 });
    }

    const body = await request.json();
    const { status, reason } = body; // status: 'approved' or 'rejected'

    if (!['approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const upload = await prisma.upload.findUnique({
      where: { id: params.id },
    });

    if (!upload) {
      return NextResponse.json({ error: 'Upload not found' }, { status: 404 });
    }

    if (upload.status !== 'pending') {
      return NextResponse.json(
        { error: 'Upload is already ' + upload.status },
        { status: 400 }
      );
    }

    // If approved, just update the upload status
    // The lesson should already exist (created by user during upload)
    if (status === 'approved') {
      // Update upload status
      const updatedUpload = await prisma.upload.update({
        where: { id: params.id },
        data: {
          status: 'approved',
          reason: reason || '',
        },
        select: {
          id: true,
          title: true,
          status: true,
          reason: true,
          createdAt: true,
          user: { select: { id: true, name: true, email: true } },
        },
      });

      return NextResponse.json({
        upload: updatedUpload,
        message: 'Upload approved',
      });
    } else {
      // If rejected, just update status with reason
      const updatedUpload = await prisma.upload.update({
        where: { id: params.id },
        data: {
          status: 'rejected',
          reason: reason || 'No reason provided',
        },
        select: {
          id: true,
          title: true,
          status: true,
          reason: true,
          createdAt: true,
          user: { select: { id: true, name: true, email: true } },
        },
      });

      return NextResponse.json({
        upload: updatedUpload,
        message: 'Upload rejected',
      });
    }
  } catch (error: any) {
    console.error('Error updating upload:', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Upload not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to update upload' }, { status: 500 });
  }
}

// DELETE: Delete upload
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await checkAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized - Admin only' }, { status: 401 });
    }

    const upload = await prisma.upload.findUnique({
      where: { id: params.id },
      select: { id: true },
    });

    if (!upload) {
      return NextResponse.json({ error: 'Upload not found' }, { status: 404 });
    }

    await prisma.upload.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Upload deleted' });
  } catch (error: any) {
    console.error('Error deleting upload:', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Upload not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to delete upload' }, { status: 500 });
  }
}
