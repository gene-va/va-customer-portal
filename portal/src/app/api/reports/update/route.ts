import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/server';
import { reportSchema } from '@/lib/schemas/report';

export async function PUT(request: NextRequest) {
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
    const { report_id, report_data, title, status } = body;

    if (!report_id) {
      return NextResponse.json(
        { error: 'Missing required field: report_id' },
        { status: 400 }
      );
    }

    // Get current report
    const { data: currentReport } = await supabase
      .from('reports')
      .select('*')
      .eq('id', report_id)
      .single();

    if (!currentReport) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
    }

    const serviceClient = createServiceClient();
    const updates: any = {};

    // Handle report_data update - archive old version first
    if (report_data !== undefined) {
      try {
        const validatedData = reportSchema.parse(report_data);

        // Archive old version
        if (currentReport.report_data) {
          await serviceClient.from('report_versions').insert({
            report_id,
            report_data: currentReport.report_data,
            created_by: currentUser.id,
          });
        }

        updates.report_data = validatedData;
      } catch (err) {
        return NextResponse.json(
          { error: 'Invalid report data format' },
          { status: 400 }
        );
      }
    }

    // Handle other updates
    if (title !== undefined) {
      updates.title = title;
    }

    if (status !== undefined) {
      updates.status = status;
      // Set published_at if status is being changed to published
      if (status === 'published' && currentReport.status !== 'published') {
        updates.published_at = new Date().toISOString();
      }
    }

    // Update report
    const { data: updatedReport, error } = await serviceClient
      .from('reports')
      .update(updates)
      .eq('id', report_id)
      .select()
      .single();

    if (error || !updatedReport) {
      console.error('Report update error:', error);
      return NextResponse.json(
        { error: error?.message || 'Failed to update report' },
        { status: 400 }
      );
    }

    // Log audit entry
    await serviceClient.from('audit_log').insert({
      admin_user_id: currentUser.id,
      action_type: 'report_updated',
      target_table: 'reports',
      target_id: report_id,
      details: {
        title: updatedReport.title,
        status: updatedReport.status,
        changed_fields: Object.keys(updates),
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Report updated successfully',
        report: updatedReport,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating report:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
