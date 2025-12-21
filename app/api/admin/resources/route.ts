import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const moduleId = searchParams.get('module_id');

    if (!moduleId) {
      return NextResponse.json(
        { error: 'module_id is required' },
        { status: 400 }
      );
    }

    // Get resources for module
    const { data: resources, error } = await supabase
      .from('resources')
      .select('*')
      .eq('module_id', moduleId)
      .order('order_index');

    if (error) throw error;

    return NextResponse.json(resources);
  } catch (error) {
    console.error('Error fetching resources:', error);
    return NextResponse.json(
      { error: 'Failed to fetch resources' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // Get auth header for server-side auth
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // For now, allow authenticated requests
    // In production, verify the token properly

    const body = await req.json();
    const {
      module_id,
      subject_id,
      title,
      slug,
      description,
      resource_type,
      content,
      pdf_url,
      external_link,
      is_published,
      is_premium,
      order_index,
      author_id,
    } = body;

    if (!module_id || !subject_id || !title || !slug || !author_id) {
      return NextResponse.json(
        { error: 'module_id, subject_id, title, slug, and author_id are required' },
        { status: 400 }
      );
    }

    // Create resource
    const { data: resource, error } = await supabase
      .from('resources')
      .insert({
        module_id,
        subject_id,
        title,
        slug,
        description,
        resource_type: resource_type || 'lesson',
        content,
        pdf_url,
        external_link,
        author_id,
        is_published: is_published || false,
        is_premium: is_premium || false,
        order_index: order_index || 0,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(resource, { status: 201 });
  } catch (error) {
    console.error('Error creating resource:', error);
    return NextResponse.json(
      { error: 'Failed to create resource' },
      { status: 500 }
    );
  }
}
