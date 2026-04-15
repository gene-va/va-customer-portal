import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    // Get current user and verify they're admin
    const supabase = await createClient();
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', currentUser.id)
      .single();

    if (userRole?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { email, password, company_name, contact_name } = body;

    // Validate input
    if (!email || !password || !company_name) {
      return NextResponse.json(
        { error: 'Missing required fields: email, password, company_name' },
        { status: 400 }
      );
    }

    if (password.length < 12) {
      return NextResponse.json(
        { error: 'Password must be at least 12 characters' },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Use service role client to create auth user
    const serviceClient = createServiceClient();

    // Create auth user
    const { data: authData, error: authError } =
      await serviceClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

    if (authError || !authData.user) {
      console.error('Auth user creation error:', authError);
      return NextResponse.json(
        { error: authError?.message || 'Failed to create user account' },
        { status: 400 }
      );
    }

    const userId = authData.user.id;

    // Insert user role
    const { error: roleError } = await serviceClient
      .from('user_roles')
      .insert({
        user_id: userId,
        role: 'client',
      });

    if (roleError) {
      console.error('Role insert error:', roleError);
      return NextResponse.json(
        { error: 'Failed to set user role' },
        { status: 400 }
      );
    }

    // Insert into clients table
    const { data: clientData, error: clientError } = await serviceClient
      .from('clients')
      .insert({
        user_id: userId,
        company_name,
        contact_name: contact_name || null,
        contact_email: email,
        is_active: true,
      })
      .select()
      .single();

    if (clientError) {
      console.error('Client insert error:', clientError);
      return NextResponse.json(
        { error: 'Failed to create client record' },
        { status: 400 }
      );
    }

    // Insert audit log entry
    await serviceClient.from('audit_log').insert({
      admin_user_id: currentUser.id,
      action_type: 'client_created',
      target_table: 'clients',
      target_id: clientData.id,
      details: {
        company_name,
        contact_email: email,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Client created successfully',
        client: clientData,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
