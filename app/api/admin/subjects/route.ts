import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    // Get auth header for server-side auth
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // For now, allow authenticated requests
    // In production, verify the token properly

    // Get all subjects
    const { data: subjects, error } = await supabase
      .from('subjects')
      .select('*')
      .order('order_index');

    if (error) throw error;

    return NextResponse.json(subjects);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch subjects' },
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
    const { name, slug, description, icon, order_index } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      );
    }

    // Create subject
    const { data: subject, error } = await supabase
      .from('subjects')
      .insert({
        name,
        slug,
        description,
        icon,
        order_index: order_index || 0,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(subject, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create subject' },
      { status: 500 }
    );
  }
}

