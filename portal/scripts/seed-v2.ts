import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// --- V2 Deal Room report data ---
const reportData = {
  version: 'v2' as const,

  company: {
    name: 'NovaCell Therapeutics',
    tagline: 'Next-gen CAR-T for solid tumors',
    location: 'Stockholm, Sweden',
    target_raise: '$35M Series B',
    stage: 'Phase 1b/2 — first patient dosed Q1 2026',
    lead_asset: 'NC-201 (mesothelin-targeted CAR-T)',
  },

  headline:
    '3 investors matched, 5 warm intros identified. Target: lead investor term sheet by end of Q2 2026.',

  pipeline_summary: {
    total: 3,
    with_warm_intros: 3,
    meetings_scheduled: 1,
    in_diligence: 0,
  },

  weekly_actions: [
    {
      priority: 'high' as const,
      investor_name: 'HealthCap',
      action: 'Kristi to intro you to Johan Christenson (Partner) — meeting confirmed for April 18',
      context:
        'Johan led their Immunicum investment (CAR-T adjacent, solid tumor focus). Open with your Phase 1b tolerability data — he will ask about manufacturing scale.',
      due: 'This week',
      completed: false,
    },
    {
      priority: 'high' as const,
      investor_name: 'Forbion',
      action: 'Helena to intro you to Sander Slootweg (Managing Partner)',
      context:
        'Forbion exited Kite Pharma to Gilead for $11.9B — the defining CAR-T deal. Your solid tumor angle is the next frontier they are actively looking for.',
      due: 'This week',
      completed: false,
    },
    {
      priority: 'medium' as const,
      investor_name: 'Novo Holdings',
      action: 'Prepare tailored deck for Novo — emphasize Nordic manufacturing advantage',
      context:
        'Novo prefers companies with European manufacturing. Highlight your CDMO partnership with Karolinska Cell Therapy Center.',
      due: 'Next week',
      completed: false,
    },
  ],

  investors: [
    {
      name: 'HealthCap',
      location: 'Stockholm, Sweden',
      aum: '$2.1B',
      segment: 'Nordic Life Science Specialist',
      pipeline_stage: 'meeting_scheduled' as const,
      why_they_fit:
        'HealthCap is the dominant Nordic life science VC. They led Immunicum\'s Series B ($45M) — a Swedish cell therapy company targeting solid tumors with a different modality. They understand the regulatory path through Swedish MPA and EMA, and their portfolio companies share your CDMO network. Their Stockholm base means they can sit on your board without flying.',
      portfolio_proof:
        'They backed Immunicum (solid tumor immunotherapy, $45M Series B) and exited Cormorant Pharma to AstraZeneca for $800M. Your CAR-T platform for solid tumors is the natural next bet in their cell therapy thesis.',
      contacts: [
        {
          name: 'Johan Christenson',
          title: 'Partner — led Immunicum investment',
          connected_via: 'Kristi',
          is_warm: true,
        },
        {
          name: 'Staffan Lindstrand',
          title: 'Senior Partner',
          connected_via: 'Helena',
          is_warm: true,
        },
      ],
      pitch_angle:
        'Following your Immunicum success, NovaCell represents the next generation of solid tumor cell therapy — this time with a CAR-T approach that addresses the tumor microenvironment directly.',
      pitch_points: [
        'Phase 1b data shows 40% ORR in mesothelioma — first CAR-T to crack solid tumor efficacy',
        'Swedish MPA fast-track designation granted February 2026',
        'Karolinska CDMO partnership solves the manufacturing bottleneck that killed other CAR-T solid tumor programs',
        'Founder team from Karolinska Institutet with 15+ years in T-cell engineering',
      ],
      check_size: '$15-25M lead',
      next_step: 'Meeting confirmed April 18 — Johan Christenson',
      notes: 'Johan specifically mentioned interest in solid tumor cell therapy at Bio-Europe. He knows your CSO from Karolinska.',
    },
    {
      name: 'Forbion',
      location: 'Naarden, Netherlands',
      aum: '$3.5B',
      segment: 'European Cell & Gene Therapy',
      pipeline_stage: 'intro_requested' as const,
      why_they_fit:
        'Forbion was an early investor in Kite Pharma, which Gilead acquired for $11.9B — the landmark CAR-T deal. They\'ve been publicly stating they want to back the next CAR-T wave targeting solid tumors. Their Forbion V fund ($830M, 2024) has explicit cell therapy allocation. They have deep FDA and EMA regulatory expertise from their CGT portfolio.',
      portfolio_proof:
        'Kite Pharma to Gilead for $11.9B defined the CAR-T category. They also backed MiNT Therapeutics (bispecific T-cell engagers, €80M Series A). Your solid tumor CAR-T is exactly the "next frontier" Sander described at JPM 2026.',
      contacts: [
        {
          name: 'Sander Slootweg',
          title: 'Managing Partner — led Kite Pharma investment',
          connected_via: 'Helena',
          is_warm: true,
        },
        {
          name: 'Roel Bulthuis',
          title: 'Partner, Cell & Gene Therapy',
          connected_via: null,
          is_warm: false,
        },
      ],
      pitch_angle:
        'After Kite defined CAR-T for blood cancers, the $40B question is solid tumors. NovaCell\'s Phase 1b data suggests we\'ve cracked it — and we need a partner who understands the CAR-T playbook.',
      pitch_points: [
        'First CAR-T to show meaningful ORR in a solid tumor indication (mesothelioma)',
        'Proprietary armored CAR construct overcomes tumor microenvironment suppression',
        'Clear regulatory path: Swedish MPA fast-track + FDA orphan drug application filed',
        'Series B will fund Phase 2 pivotal and second indication (ovarian) IND',
      ],
      check_size: '$20-40M co-lead',
      next_step: 'Helena sending intro email to Sander this week',
    },
    {
      name: 'Novo Holdings',
      location: 'Copenhagen, Denmark',
      aum: '$115B (Novo Nordisk Foundation)',
      segment: 'Nordics Anchor Investor',
      pipeline_stage: 'identified' as const,
      why_they_fit:
        'Novo Holdings is the single largest life science investor in the Nordics. Their Novo Ventures arm writes $20-50M checks into clinical-stage biotechs. They have a stated preference for Nordic companies with European manufacturing — which matches your Karolinska CDMO setup perfectly. Having Novo on your cap table signals credibility to every other European investor.',
      portfolio_proof:
        'Novo Ventures backed Cellectis ($228M, CAR-T for AML) and more recently Verve Therapeutics ($350M, gene editing). Their cell therapy conviction is clear. A NovaCell investment would be their first solid tumor CAR-T bet.',
      contacts: [
        {
          name: 'Søren Møller',
          title: 'Senior Partner, Novo Ventures',
          connected_via: 'Jonas',
          is_warm: true,
        },
      ],
      pitch_angle:
        'NovaCell is a Stockholm-based CAR-T company with Karolinska-manufactured product, Swedish MPA fast-track, and Phase 1b efficacy data in solid tumors — a Novo Ventures sweet spot.',
      pitch_points: [
        'Nordic-headquartered with European manufacturing — Novo\'s stated preference',
        'Phase 1b data de-risks the biology — Phase 2 pivotal is the value inflection',
        '$35M raise funds through Phase 2 interim readout, the next major catalyst',
        'Novo on cap table accelerates European KOL network and EMA regulatory strategy',
      ],
      check_size: '$20-50M (can anchor)',
      next_step: 'Prepare tailored deck emphasizing Nordic manufacturing — intro via Jonas next week',
    },
  ],

  strategy_narrative: `The fundraise strategy is sequenced to build momentum. HealthCap goes first — they're local, they know the space, and a term sheet from Stockholm's top VC de-risks the round for everyone else.\n\nForbion is the strategic co-lead. Their Kite Pharma pedigree gives your CAR-T story instant credibility with US investors down the line. Sander has been vocal about wanting the "next Kite" — your data gives him the excuse to move.\n\nNovo Holdings is the anchor play. They write the biggest checks in the Nordics and their brand on your cap table changes the conversation with pharma partners. But they move slower — get HealthCap and Forbion warm first, then bring Novo the momentum.\n\nTarget timeline: HealthCap term sheet by May, Forbion co-lead by June, Novo anchor commitment by end of Q2. First close July 2026.`,

  metadata: {
    generated_date: '2026-04-13',
    prepared_for: 'NovaCell Therapeutics — Series B',
    va_lead: 'Helena Lindqvist',
  },
};

async function seed() {
  try {
    console.log('Starting V2 seed (Deal Room)...\n');

    // 1. Create client user
    console.log('1. Setting up client user...');
    const clientEmail = 'ceo@novacell.se';
    const clientPassword = 'NovaDemo123!';

    let clientUserId: string;
    const { data: clientData, error: clientSignUpError } =
      await supabase.auth.admin.createUser({
        email: clientEmail,
        password: clientPassword,
        email_confirm: true,
      });

    if (clientSignUpError?.message?.includes('already exists')) {
      console.log(`  ✓ Client user already exists: ${clientEmail}`);
      const { data: listData } = await supabase.auth.admin.listUsers();
      const existing = listData?.users?.find((u) => u.email === clientEmail);
      clientUserId = existing?.id || '';
    } else if (clientSignUpError) {
      throw new Error(`Failed to create client user: ${clientSignUpError.message}`);
    } else {
      clientUserId = clientData?.user?.id || '';
      console.log(`  ✓ Client user created: ${clientEmail}`);
    }

    // Create client role
    await supabase
      .from('user_roles')
      .upsert({ user_id: clientUserId, role: 'client' }, { onConflict: 'user_id' });
    console.log('  ✓ Client role set');

    // 2. Create client record
    console.log('\n2. Setting up client record...');
    const { data: existingClient } = await supabase
      .from('clients')
      .select('id')
      .eq('user_id', clientUserId)
      .single();

    let clientRecordId: string;
    if (existingClient) {
      clientRecordId = existingClient.id;
      console.log('  ✓ Client record already exists');
    } else {
      const { data: newClient, error: createErr } = await supabase
        .from('clients')
        .insert({
          user_id: clientUserId,
          company_name: 'NovaCell Therapeutics',
          contact_name: 'Erik Nordström',
          contact_email: clientEmail,
          is_active: true,
        })
        .select('id')
        .single();

      if (createErr) throw new Error(`Failed to create client: ${createErr.message}`);
      clientRecordId = newClient?.id || '';
      console.log('  ✓ Client record created');
    }

    // 3. Create report
    console.log('\n3. Setting up Deal Room report...');
    const { data: existingReport } = await supabase
      .from('reports')
      .select('id')
      .eq('client_id', clientRecordId)
      .single();

    if (existingReport) {
      // Update with latest data
      await supabase
        .from('reports')
        .update({ report_data: reportData, title: 'Series B Deal Room' })
        .eq('id', existingReport.id);
      console.log('  ✓ Report updated');
    } else {
      const { error: createReportError } = await supabase.from('reports').insert({
        client_id: clientRecordId,
        title: 'Series B Deal Room',
        status: 'published',
        report_data: reportData,
        published_at: new Date().toISOString(),
      });

      if (createReportError)
        throw new Error(`Failed to create report: ${createReportError.message}`);
      console.log('  ✓ Report created and published');
    }

    console.log('\n✅ V2 seed completed!\n');
    console.log('Login:');
    console.log(`  Email: ${clientEmail}`);
    console.log(`  Password: ${clientPassword}`);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
}

seed();
