import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password required' },
        { status: 400 }
      );
    }

    // Authenticate with Supabase
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email: email.toLowerCase(),
      password: password,
    });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }

    // Get user profile
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id, email, full_name, role')
      .eq('id', data.user.id)
      .single();

    return NextResponse.json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        name: profile?.full_name,
        role: profile?.role,
      },
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Sign in failed' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  return NextResponse.json({
    error: 'Use POST method',
  }, { status: 405 });
}
