import { supabaseAdmin } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { email, password, fullName, role } = await req.json();

    // Validate inputs
    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Create user in Supabase Auth
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: email.toLowerCase(),
      password: password,
      email_confirm: true,
    });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    // Create user profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert([
        {
          id: data.user.id,
          email: email.toLowerCase(),
          full_name: fullName,
          role: role || 'student',
          is_active: true,
        },
      ])
      .select()
      .single();

    if (profileError) {
      return NextResponse.json(
        { error: profileError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, user: profile },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Signup failed' },
      { status: 500 }
    );
  }
}
