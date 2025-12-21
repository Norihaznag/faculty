import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const subjectId = searchParams.get('subject_id');

    if (!subjectId) {
      return NextResponse.json(
        { error: 'subject_id is required' },
        { status: 400 }
      );
    }

    // Get modules for subject
    const { data: modules, error } = await supabase
      .from('modules')
      .select('*')
      .eq('subject_id', subjectId)
      .order('order_index');

    if (error) throw error;

    return NextResponse.json(modules);
  } catch (error) {
    console.error('Error fetching modules:', error);
    return NextResponse.json(
      { error: 'Failed to fetch modules' },
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
    const { subject_id, name, slug, description, order_index } = body;

    if (!subject_id || !name || !slug) {
      return NextResponse.json(
        { error: 'subject_id, name, and slug are required' },
        { status: 400 }
      );
    }

    // Create module
    const { data: module, error } = await supabase
      .from('modules')
      .insert({
        subject_id,
        name,
        slug,
        description,
        order_index: order_index || 0,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(module, { status: 201 });
  } catch (error) {
    console.error('Error creating module:', error);
    return NextResponse.json(
      { error: 'Failed to create module' },
      { status: 500 }
    );
  }
}
