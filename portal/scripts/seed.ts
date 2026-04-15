import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// Sample report data for Precision NeuroMed
const reportData = {
  company: {
    name: 'Precision NeuroMed',
    tagline: 'Neuro-Oncology | Convection-Enhanced Delivery',
    location: 'Redwood City, CA',
    lead_asset: 'IL13-PE38 (cintredekin besudotox)',
    indication: 'Glioblastoma (GBM)',
    fda_status: 'Orphan Drug Designation (Oct 2025)',
    prior_clinical: 'Phase 3 (PRECISE trial)',
    target_raise: 'TBD — Clarify in demo',
  },
  summary: {
    total_investors: 2,
    warm_leads: 4,
    avg_fit_score: 0.81,
    geographic_match: 'Bay Area',
  },
  warm_leads: [
    {
      name: 'Maha Radhakrishnan',
      role: 'Executive Partner, Sofinnova',
      connected_via: 'Helena, Jonas',
    },
    {
      name: 'Jakob Dupont',
      role: 'Executive Partner, Sofinnova',
      connected_via: 'Helena, Krishna',
    },
    {
      name: 'Peng Li',
      role: 'Healthcare Investor, Sofinnova',
      connected_via: 'Helena, Jonas',
    },
    {
      name: 'Ariel Kantor',
      role: 'Principal, Versant',
      connected_via: 'Helena',
    },
  ],
  investors: [
    {
      name: 'Sofinnova Investments',
      segment: 'Clinical-Stage Specialist',
      segment_type: 'clinical',
      location: 'Menlo Park, CA',
      aum: '$3B AUM',
      fit_score: 0.7,
      tier: 'Priority Target',
      score_breakdown: [
        { category: 'Investment Activity', weight: 35, score: 26.3 },
        { category: 'Financial Capacity', weight: 30, score: 25.5 },
        { category: 'Therapeutic Understanding', weight: 25, score: 13.8 },
        { category: 'Value-Add Signals', weight: 10, score: 4.0 },
      ],
      company_info: {
        Founded: '1976 (nearly 50 years)',
        'Focus Areas': 'Oncology, Neurology, Immunology',
        'Investment Stage': 'Clinical-stage, Public equity',
        'Geographic Fit': '15 min from PNM (Redwood City)',
      },
      portfolio: [
        {
          name: 'Marinus Pharma (MRNS)',
          detail: 'Neurological disorders | Ganaxolone',
          tag: 'CNS/Neuro',
          tag_type: 'default',
        },
        {
          name: 'Principia → Sanofi',
          detail: 'Autoimmune/oncology | 15x',
          tag: '$3.7B Exit',
          tag_type: 'success',
        },
        {
          name: 'NuCana (NCNA)',
          detail: 'Oncology therapeutics',
          tag: 'Oncology',
          tag_type: 'default',
        },
      ],
      fit_analysis: {
        headline:
          'Perfect positioning: Clinical-stage specialist with rare oncology + neurology dual expertise. Bay Area proximity enables close partnership.',
        points: [
          'Oncology + Neurology combo matches GBM indication',
          'Clinical-stage focus aligns with prior Phase 3 data',
          '15-minute drive from PNM headquarters',
          '$3B AUM provides follow-on capacity',
          '3 warm leads at Executive Partner level',
        ],
        investment_capacity: 'Clinical-stage investments',
      },
      pitch: {
        target_label: 'For Sofinnova Investments (Clinical-Stage)',
        intro:
          'Precision NeuroMed represents a unique clinical-stage opportunity in neuro-oncology — the founders re-acquired a Phase 3-tested asset with improved delivery technology.',
        bullets: [
          'World-class founders: Bankiewicz (CED pioneer), Lonser (NIH), Kunwar (PRECISE trial PI)',
          'Prior Phase 3 showed efficacy in optimally-treated patients — delivery was the issue',
          'Improved CED technology addresses PRECISE trial delivery failures',
          'FDA Orphan Drug Designation (October 2025) — regulatory de-risking',
          'Bay Area proximity enables hands-on partnership',
        ],
      },
    },
    {
      name: 'Versant Ventures',
      segment: 'CNS/Neurology + Brain Tumor',
      segment_type: 'cns',
      location: 'San Francisco, CA',
      aum: '$5.3B AUM',
      fit_score: 0.92,
      tier: 'Priority Target',
      score_breakdown: [
        { category: 'Investment Activity', weight: 35, score: 33.3 },
        { category: 'Financial Capacity', weight: 30, score: 28.5 },
        { category: 'Therapeutic Understanding', weight: 25, score: 22.5 },
        { category: 'Value-Add Signals', weight: 10, score: 8.0 },
      ],
      company_info: {
        'Check Size': '$20-50M',
        'Focus Areas': 'CNS/Neurology, Oncology, Rare Diseases',
        'Investment Stage': 'Series A, Series B',
        'Notable Exit': 'Kate Therapeutics → Novartis ($1.1B)',
      },
      portfolio: [
        {
          name: 'Monteris Medical',
          detail: 'MRI-guided laser for brain tumors',
          tag: 'Brain Tumor',
          tag_type: 'highlight',
        },
        {
          name: 'Kate Therapeutics → Novartis',
          detail: 'CNS gene therapy | Nov 2024',
          tag: '$1.1B Exit',
          tag_type: 'success',
        },
        {
          name: 'Passage Bio',
          detail: 'CNS gene therapy | 5+ programs',
          tag: '$115M Series A',
          tag_type: 'default',
        },
      ],
      fit_analysis: {
        headline:
          'Proven CNS investor: $1.1B Kate Therapeutics exit demonstrates ability to build and exit CNS companies. Series A lead capacity.',
        points: [
          'Explicit CNS/Neurology investment thesis',
          '$1.1B Kate Therapeutics exit to Novartis',
          '$20-50M check size fits Series A lead',
          'San Francisco base — Bay Area synergy',
          '25+ years healthcare investing experience',
        ],
        investment_capacity: '$20-50M',
      },
      pitch: {
        target_label: 'For Versant Ventures (CNS Focus)',
        intro:
          'Following your Kate Therapeutics success, PNM offers another CNS platform opportunity — this time in neuro-oncology with a differentiated delivery approach.',
        bullets: [
          'CED platform technology — applicable beyond GBM to other CNS indications',
          'De-risked clinical path: prior Phase 3 data informs improved trial design',
          'Orphan Drug economics: smaller trials, faster path, premium pricing',
          'Founder team with 20+ years CED expertise and successful track records',
          'Series A lead opportunity in high-unmet-need CNS indication',
        ],
      },
    },
  ],
  synergies: {
    insight_title: 'Critical Synergy: Brain Tumor Experience',
    insight_body:
      "Versant's Monteris Medical is directly relevant — they invested in MRI-guided laser therapy for brain tumors. This means the Versant team has existing diligence knowledge on brain tumor treatment modalities. Combined with Kate Therapeutics CNS gene therapy exit ($1.1B) and Sofinnova's Marinus neuro expertise, both firms can evaluate PNM's CED platform with informed perspective.",
    cards: [
      {
        investor_name: 'Sofinnova Portfolio',
        headline_stat: '32 Exits | 25-30% IRR',
        summary:
          'CNS + Oncology expertise: Direct neuro-oncology relevant experience with major pharma exits.',
        portfolio: [
          {
            name: 'Marinus Pharma (NASDAQ: MRNS)',
            detail: 'Neurological & psychiatric disorders | Ganaxolone',
            tag: 'CNS/Neuro',
            tag_type: 'default',
          },
          {
            name: 'Principia Biopharma → Sanofi',
            detail: 'Autoimmune & oncology | 15x multiple',
            tag: '$3.7B Exit',
            tag_type: 'success',
          },
          {
            name: 'NextWave → Pfizer',
            detail: 'Pediatric ADHD (CNS) | 12x multiple',
            tag: '$700M Exit',
            tag_type: 'success',
          },
        ],
        track_record: '65% portfolio success rate | $15-35M typical check',
      },
      {
        investor_name: 'Versant Portfolio',
        headline_stat: '95+ Exits | $5.3B AUM',
        summary:
          'Deep CNS + Brain Tumor expertise: Monteris Medical (brain tumors) + multiple CNS gene therapy exits.',
        portfolio: [
          {
            name: 'Monteris Medical',
            detail: 'MRI-guided laser therapy for BRAIN TUMORS',
            tag: 'Brain Tumor!',
            tag_type: 'highlight',
          },
          {
            name: 'Kate Therapeutics → Novartis',
            detail: 'CNS gene therapy | DMD, myotonic dystrophy',
            tag: '$1.1B Exit',
            tag_type: 'success',
          },
          {
            name: 'Passage Bio',
            detail: 'CNS gene therapy | 5+ rare monogenic CNS programs',
            tag: '$115M Series A',
            tag_type: 'default',
          },
        ],
        track_record: 'Discovery Engines: Inception Sciences (San Diego) + Blueline (Toronto) + Basel office',
      },
    ],
  },
  decision_makers: [
    {
      investor_name: 'Sofinnova Investments',
      name: 'Maha Radhakrishnan',
      title: 'Executive Partner',
      bio: 'Senior investment professional focused on clinical-stage therapeutics. Key decision maker for oncology and neurology investments.',
      connected: true,
      connected_via: 'Helena, Jonas',
      segment_type: 'clinical',
    },
    {
      investor_name: 'Sofinnova Investments',
      name: 'Jakob Dupont, MD MA',
      title: 'Executive Partner',
      bio: 'Physician-investor with deep clinical development expertise. Evaluates clinical-stage opportunities.',
      connected: true,
      connected_via: 'Helena, Krishna',
      segment_type: 'clinical',
    },
    {
      investor_name: 'Sofinnova Investments',
      name: 'Peng Li, PhD',
      title: 'Healthcare Investor',
      bio: 'Investment professional covering therapeutic investments. Active in deal sourcing and evaluation.',
      connected: true,
      connected_via: 'Helena, Jonas',
      segment_type: 'clinical',
    },
    {
      investor_name: 'Versant Ventures',
      name: 'Ariel Kantor, PhD',
      title: 'Principal',
      bio: 'Investment professional at leading healthcare VC. Involved in CNS/neurology deal evaluation and portfolio support.',
      connected: true,
      connected_via: 'Helena',
      segment_type: 'cns',
    },
  ],
  strategy: {
    title: 'Recommended Engagement Strategy',
    steps: [
      {
        week: 'Week 1',
        title: 'Priority Outreach — Versant (92% fit)',
        details:
          'Via Helena: Intro to Ariel Kantor (Principal) — Versant has Monteris Medical (brain tumor) in portfolio, highest relevance. Key angle: Reference brain tumor investment experience and Kate Therapeutics CNS exit.',
      },
      {
        week: 'Week 2',
        title: 'Sofinnova Outreach (70% fit)',
        details:
          'Via Helena/Jonas: Intro to Maha Radhakrishnan (Executive Partner). Key angle: Clinical-stage specialist, Bay Area proximity (15 min from PNM), Marinus Pharma neuro experience.',
      },
      {
        week: 'Week 3-4',
        title: 'Initial Meetings & Deep Dives',
        details:
          'Schedule 30-min virtual introductions. Present CED platform, founder credentials, and improved delivery thesis. Arrange founder calls with investment teams. Share PRECISE trial analysis.',
      },
      {
        week: 'Week 5+',
        title: 'Diligence & Term Sheet',
        details:
          'Facilitate data room access. Coordinate KOL calls if needed. Target lead investor term sheet by end of Q1 2026.',
      },
    ],
  },
  platform_capabilities: [
    {
      title: 'Investor Database',
      points: [
        '2500+ scored investors matching your profile',
        'Portfolio company analysis',
        'Continuous database enrichment',
      ],
    },
    {
      title: 'Warm Lead Identification',
      points: [
        'LinkedIn connection mapping',
        'Partner-level contact identification',
        'Investment team intelligence',
      ],
    },
    {
      title: 'Custom Scoring',
      points: [
        'Tailored to your therapeutic focus',
        '4-factor weighted model',
        'Stage and geography matching',
      ],
    },
  ],
  metadata: {
    generated_date: '2026-01-30',
    prepared_for: 'Precision NeuroMed Demo',
    attendees: [
      'Sandeep Kunwar',
      'Purvi Kunwar',
      'John Geschke',
      'Stephan Mittermeyer',
      'Jayden Kunwar',
      'Kristi LaRock',
    ],
  },
};

async function seed() {
  try {
    console.log('Starting seed...\n');

    // 1. Check if admin user exists, create if not
    console.log('1. Setting up admin user...');
    const adminEmail = 'admin@va-platform.com';
    const adminPassword = 'AdminPass123!';

    let adminUserId: string;
    const { data: adminData, error: adminSignUpError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
    });

    if (adminSignUpError?.message?.includes('already exists')) {
      console.log(`  ✓ Admin user already exists: ${adminEmail}`);
      // Get existing user
      const { data: adminListData } = await supabase.auth.admin.listUsers();
      const existingAdmin = adminListData?.users?.find((u) => u.email === adminEmail);
      adminUserId = existingAdmin?.id || '';
    } else if (adminSignUpError) {
      throw new Error(`Failed to create admin user: ${adminSignUpError.message}`);
    } else {
      adminUserId = adminData?.user?.id || '';
      console.log(`  ✓ Admin user created: ${adminEmail}`);
    }

    // Create admin user_role
    const { error: adminRoleError } = await supabase
      .from('user_roles')
      .upsert(
        { user_id: adminUserId, role: 'admin' },
        { onConflict: 'user_id' },
      );

    if (adminRoleError) {
      throw new Error(`Failed to create admin role: ${adminRoleError.message}`);
    }
    console.log('  ✓ Admin role created');

    // 2. Create client user
    console.log('\n2. Setting up client user...');
    const clientEmail = 'demo@precisioneuromed.com';
    const clientPassword = 'ClientDemo123!';

    let clientUserId: string;
    const { data: clientData, error: clientSignUpError } = await supabase.auth.admin.createUser({
      email: clientEmail,
      password: clientPassword,
      email_confirm: true,
    });

    if (clientSignUpError?.message?.includes('already exists')) {
      console.log(`  ✓ Client user already exists: ${clientEmail}`);
      const { data: clientListData } = await supabase.auth.admin.listUsers();
      const existingClient = clientListData?.users?.find((u) => u.email === clientEmail);
      clientUserId = existingClient?.id || '';
    } else if (clientSignUpError) {
      throw new Error(`Failed to create client user: ${clientSignUpError.message}`);
    } else {
      clientUserId = clientData?.user?.id || '';
      console.log(`  ✓ Client user created: ${clientEmail}`);
    }

    // Create client user_role
    const { error: clientRoleError } = await supabase
      .from('user_roles')
      .upsert(
        { user_id: clientUserId, role: 'client' },
        { onConflict: 'user_id' },
      );

    if (clientRoleError) {
      throw new Error(`Failed to create client role: ${clientRoleError.message}`);
    }
    console.log('  ✓ Client role created');

    // 3. Create client record
    console.log('\n3. Setting up client record...');
    const { data: existingClient, error: existingClientError } = await supabase
      .from('clients')
      .select('id')
      .eq('user_id', clientUserId)
      .single();

    let clientRecordId: string;
    if (existingClient) {
      clientRecordId = existingClient.id;
      console.log('  ✓ Client record already exists');
    } else if (existingClientError?.code === 'PGRST116') {
      // No rows returned, create new
      const { data: newClient, error: createClientError } = await supabase
        .from('clients')
        .insert({
          user_id: clientUserId,
          company_name: 'Precision NeuroMed',
          contact_name: 'Sandeep Kunwar',
          contact_email: clientEmail,
          is_active: true,
        })
        .select('id')
        .single();

      if (createClientError) {
        throw new Error(`Failed to create client: ${createClientError.message}`);
      }
      clientRecordId = newClient?.id || '';
      console.log('  ✓ Client record created');
    } else {
      throw new Error(`Failed to check client: ${existingClientError?.message}`);
    }

    // 4. Create report
    console.log('\n4. Setting up report...');
    const { data: existingReport, error: existingReportError } = await supabase
      .from('reports')
      .select('id')
      .eq('client_id', clientRecordId)
      .single();

    if (existingReport) {
      console.log('  ✓ Report already exists');
    } else if (existingReportError?.code === 'PGRST116') {
      // No rows returned, create new
      const { error: createReportError } = await supabase
        .from('reports')
        .insert({
          client_id: clientRecordId,
          title: 'Investor Matching Report',
          status: 'published',
          report_data: reportData,
          published_at: new Date().toISOString(),
        });

      if (createReportError) {
        throw new Error(`Failed to create report: ${createReportError.message}`);
      }
      console.log('  ✓ Report created and published');
    } else {
      throw new Error(`Failed to check report: ${existingReportError?.message}`);
    }

    console.log('\n✅ Seed completed successfully!\n');
    console.log('Test credentials:');
    console.log(`  Admin: ${adminEmail} / ${adminPassword}`);
    console.log(`  Client: ${clientEmail} / ${clientPassword}`);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
}

seed();
