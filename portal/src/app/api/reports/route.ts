import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/server';
import { reportSchema, isDealRoomData, isProspectResearchData } from '@/lib/schemas/report';

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
    const {
      client_id,
      client_service_id,
      title,
      report_data,
      status = 'draft',
      campaign_type = 'general',
      event_name = null,
    } = body;

    // Validate input
    if (!client_id || !client_service_id || !title) {
      return NextResponse.json(
        { error: 'Missing required fields: client_id, client_service_id, title' },
        { status: 400 }
      );
    }
    if (campaign_type !== 'event' && campaign_type !== 'general') {
      return NextResponse.json({ error: 'Invalid campaign_type' }, { status: 400 });
    }

    // Validate report_data — v2/v3 pass through; v1 uses strict schema; empty is fine for generic
    let validatedData: unknown = {};
    if (report_data) {
      try {
        if (isProspectResearchData(report_data) || isDealRoomData(report_data)) {
          validatedData = report_data;
        } else if (Object.keys(report_data).length > 0) {
          validatedData = reportSchema.parse(report_data);
        }
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
        client_service_id,
        title,
        report_data: validatedData as Record<string, unknown>,
        status,
        campaign_type,
        event_name,
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
        client_service_id,
        campaign_type,
        event_name,
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
