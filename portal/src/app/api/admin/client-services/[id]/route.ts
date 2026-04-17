import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: role } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single();
  if (role?.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  const body = await request.json();
  const { requirements_data, active, is_primary } = body as {
    requirements_data?: Record<string, unknown>;
    active?: boolean;
    is_primary?: boolean;
  };

  const service = createServiceClient();

  if (is_primary === true) {
    const { data: target, error: targetErr } = await service
      .from('client_services')
      .select('client_id, active')
      .eq('id', id)
      .single();
    if (targetErr || !target) {
      return NextResponse.json({ error: targetErr?.message ?? 'Not found' }, { status: 404 });
    }
    if (!target.active) {
      return NextResponse.json({ error: 'Cannot mark inactive service as primary' }, { status: 400 });
    }

    const { error: unsetErr } = await service
      .from('client_services')
      .update({ is_primary: false })
      .eq('client_id', target.client_id)
      .neq('id', id);
    if (unsetErr) {
      return NextResponse.json({ error: unsetErr.message }, { status: 400 });
    }

    const { data: updated, error: setErr } = await service
      .from('client_services')
      .update({ is_primary: true })
      .eq('id', id)
      .select()
      .single();
    if (setErr || !updated) {
      return NextResponse.json({ error: setErr?.message ?? 'Update failed' }, { status: 400 });
    }

    await service.from('audit_log').insert({
      admin_user_id: user.id,
      action_type: 'client_service_primary_changed',
      target_table: 'client_services',
      target_id: id,
      details: { client_id: target.client_id },
    });

    return NextResponse.json({ client_service: updated });
  }

  const updates: Record<string, unknown> = {};
  if (requirements_data !== undefined) {
    updates.requirements_data = requirements_data;
    updates.requirements_updated_at = new Date().toISOString();
  }
  if (active !== undefined) {
    updates.active = active;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
  }

  const { data, error } = await service
    .from('client_services')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? 'Update failed' }, { status: 400 });
  }

  await service.from('audit_log').insert({
    admin_user_id: user.id,
    action_type: 'client_service_updated',
    target_table: 'client_services',
    target_id: id,
    details: { changed_fields: Object.keys(updates) },
  });

  return NextResponse.json({ client_service: data });
}
