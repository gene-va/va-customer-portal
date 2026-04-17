import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { isServiceType } from '@/lib/services/registry';

export async function POST(request: NextRequest) {
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
  const { client_id, service_type, requirements_data } = body as {
    client_id?: string;
    service_type?: string;
    requirements_data?: Record<string, unknown>;
  };

  if (!client_id || !service_type || !isServiceType(service_type)) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const service = createServiceClient();
  const { data, error } = await service
    .from('client_services')
    .insert({
      client_id,
      service_type,
      requirements_data: requirements_data ?? {},
      requirements_updated_at: requirements_data ? new Date().toISOString() : null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await service.from('audit_log').insert({
    admin_user_id: user.id,
    action_type: 'client_service_created',
    target_table: 'client_services',
    target_id: data.id,
    details: { client_id, service_type },
  });

  return NextResponse.json({ client_service: data });
}
