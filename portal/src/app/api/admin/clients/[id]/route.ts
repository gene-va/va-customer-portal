import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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

    // Get client to delete
    const { data: client } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .single();

    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    const serviceClient = createServiceClient();

    // Delete reports and versions
    if (client.user_id) {
      // Get all reports for this client
      const { data: reports } = await serviceClient
        .from('reports')
        .select('id')
        .eq('client_id', id);

      // Delete report versions
      if (reports && reports.length > 0) {
        const reportIds = reports.map((r) => r.id);
        await serviceClient
          .from('report_versions')
          .delete()
          .in('report_id', reportIds);

        // Delete reports
        await serviceClient
          .from('reports')
          .delete()
          .in('id', reportIds);
      }

      // Delete user roles
      await serviceClient
        .from('user_roles')
        .delete()
        .eq('user_id', client.user_id);

      // Delete auth user
      await serviceClient.auth.admin.deleteUser(client.user_id);
    }

    // Delete client
    await serviceClient
      .from('clients')
      .delete()
      .eq('id', id);

    // Log audit entry
    await serviceClient.from('audit_log').insert({
      admin_user_id: currentUser.id,
      action_type: 'client_deleted',
      target_table: 'clients',
      target_id: id,
      details: {
        company_name: client.company_name,
      },
    });

    return NextResponse.json(
      { success: true, message: 'Client deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting client:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
