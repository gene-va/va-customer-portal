import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// Run from the `portal/` directory — resolves to ../reports/...
const HTML_PATH = path.resolve(
  process.cwd(),
  '..',
  'reports',
  'evotec_interphex_prospects_20260410_1921.html'
);

function extractDataArray(html: string): unknown[] {
  const marker = 'const DATA = ';
  const start = html.indexOf(marker);
  if (start === -1) throw new Error('Could not locate DATA array in HTML');
  const arrayStart = html.indexOf('[', start);
  if (arrayStart === -1) throw new Error('Could not find DATA array opening bracket');

  // Walk brackets to find the matching close
  let depth = 0;
  let inString: string | null = null;
  let escape = false;
  for (let i = arrayStart; i < html.length; i++) {
    const ch = html[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (inString) {
      if (ch === '\\') escape = true;
      else if (ch === inString) inString = null;
      continue;
    }
    if (ch === '"' || ch === "'") {
      inString = ch;
      continue;
    }
    if (ch === '[') depth++;
    else if (ch === ']') {
      depth--;
      if (depth === 0) {
        const raw = html.slice(arrayStart, i + 1);
        return JSON.parse(raw);
      }
    }
  }
  throw new Error('Unterminated DATA array');
}

async function main() {
  const [, , clientIdArg] = process.argv;
  if (!clientIdArg) {
    console.error('Usage: ts-node scripts/seed-v3.ts <client_id>');
    process.exit(1);
  }

  const html = fs.readFileSync(HTML_PATH, 'utf8');
  const prospects = extractDataArray(html);
  console.log(`Parsed ${prospects.length} prospects from HTML.`);

  const reportData = {
    version: 'v3' as const,
    event: {
      name: 'InterPhex 2026',
      date: '2026-04-14',
      location: 'New York, NY',
    },
    company: {
      name: 'Just - Evotec Biologics',
      tagline: 'Continuous bioprocessing & J.POD manufacturing',
    },
    weights: {
      cost_scale_fit: 0.25,
      program_fit: 0.2,
      manufacturing_infrastructure: 0.18,
      urgency_signals: 0.15,
      development_stage: 0.14,
      meeting_accessibility: 0.08,
    },
    prospects,
    metadata: {
      generated_date: '2026-04-10',
      prepared_for: 'Just - Evotec Biologics',
      va_lead: 'VA Research',
    },
  };

  // Ensure the client has an Asset Matching subscription
  const { data: existing } = await supabase
    .from('client_services')
    .select('id')
    .eq('client_id', clientIdArg)
    .eq('service_type', 'asset_matching')
    .maybeSingle();

  let clientServiceId = existing?.id;
  if (!clientServiceId) {
    const { data: created, error: csError } = await supabase
      .from('client_services')
      .insert({ client_id: clientIdArg, service_type: 'asset_matching' })
      .select()
      .single();
    if (csError || !created) {
      console.error('Failed to create client_service:', csError);
      process.exit(1);
    }
    clientServiceId = created.id;
    console.log(`Created client_services row ${clientServiceId} (asset_matching).`);
  } else {
    console.log(`Using existing client_services row ${clientServiceId}.`);
  }

  const { data, error } = await supabase
    .from('reports')
    .insert({
      client_id: clientIdArg,
      client_service_id: clientServiceId,
      title: 'Evotec — InterPhex 2026 Prospects',
      status: 'published',
      phase: 'review',
      campaign_type: 'event',
      event_name: 'InterPhex 2026',
      report_data: reportData,
      published_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error || !data) {
    console.error('Insert failed:', error);
    process.exit(1);
  }

  console.log(`Created V3 report ${data.id} (client ${clientIdArg}).`);
  console.log(`Client view: /report/${data.id}`);
  console.log(`Admin view:  /admin/reports/${data.id}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
