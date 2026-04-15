import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/server';
import { reportSchema } from '@/lib/schemas/report';

export async function POST(request: NextRequest) {
  try {
    // Verify admin
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

    // Parse request
    const body = await request.json();
    const { client_id, title, report_data, status = 'draft' } = body;

    // Validate input
    if (!client_id || !title) {
      return NextResponse.json(
        { error: 'Missing required fields: client_id, title' },
        { status: 400 }
      );
    }

    // Validate report_data with Zod
    let validatedData = {};
    if (report_data) {
      try {
        validatedData = reportSchema.parse(report_data);
      } catch (err) {
        return NextResponse.json(
          { error: 'Invalid report data format' },
          { status: 400 }
        );
      }
    }

    // Create report
    const serviceClient = createServiceClient();
    const { data: report, error } = await serviceClient
      .from('reports')
      .insert({
        client_id,
        title,
        report_data: validatedData,
        status,
      })
      .select()
      .single();

    if (error || !report) {
      console.error('Report creation error:', error);
      return NextResponse.json(
        { error: error?.message || 'Failed to create report' },
        { status: 400 }
      );
    }

    // Log audit entry
    await serviceClient.from('audit_log').insert({
      admin_user_id: currentUser.id,
      action_type: 'report_created',
      target_table: 'reports',
      target_id: report.id,
      details: {
        title,
        client_id,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Report created successfully',
        report,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating report:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
