# VA Customer Portal — Setup Guide

## Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works): https://supabase.com

---

## Step 1: Create a Supabase Project

1. Go to https://supabase.com and create a new project
2. Choose a name (e.g., "va-customer-portal"), set a database password, select a region
3. Wait for the project to be provisioned (~2 minutes)

## Step 2: Run the Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Open the file `supabase/schema.sql` from this project
3. Copy the entire contents and paste it into the SQL Editor
4. Click **Run** — this creates all tables, RLS policies, and functions

## Step 3: Get Your Supabase Keys

1. In Supabase dashboard, go to **Settings → API**
2. Copy these values:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon / public key** (under "Project API keys")
   - **service_role key** (under "Project API keys" — click to reveal)

## Step 4: Configure Environment

```bash
cd portal
cp .env.local.example .env.local
```

Edit `.env.local` and fill in your Supabase values:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Step 5: Install Dependencies

```bash
npm install
```

## Step 6: Seed the Database

This creates test users and a sample report:

```bash
npm run seed
```

You should see:

```
Starting seed...

1. Setting up admin user...
  ✓ Admin user created: admin@va-platform.com
  ✓ Admin role created

2. Setting up client user...
  ✓ Client user created: demo@precisioneuromed.com
  ✓ Client role created

3. Setting up client record...
  ✓ Client record created

4. Setting up report...
  ✓ Report created and published

✅ Seed completed successfully!

Test credentials:
  Admin: admin@va-platform.com / AdminPass123!
  Client: demo@precisioneuromed.com / ClientDemo123!
```

## Step 7: Start the Dev Server

```bash
npm run dev
```

Open http://localhost:3000

---

## Test Accounts

| Role | Email | Password |
|---|---|---|
| Admin | admin@va-platform.com | AdminPass123! |
| Client | demo@precisioneuromed.com | ClientDemo123! |

---

## How It Works

### As a Client
1. Log in with client credentials
2. You'll see your dashboard with published reports
3. Click a report to view the full investor matching analysis
4. Use "Download PDF" (Ctrl+P) to export

### As an Admin
1. Log in with admin credentials
2. You'll see the admin dashboard with stats
3. **Clients** — View all clients, create new client accounts
4. **Reports** — View all reports, edit JSON data, change status (draft/published/archived)
5. **Audit Log** — See all admin actions

### Uploading Report Data
1. Go to Admin → Reports → click a report
2. Either drag-and-drop a `.json` file onto the upload area, or edit the JSON directly in the text editor
3. Click "Save Report"
4. Previous version is auto-archived

---

## Deploying to Production

### Vercel (Recommended)

1. Push this project to a GitHub repo
2. Go to https://vercel.com and import the repo
3. Set the **Root Directory** to `portal`
4. Add your environment variables (same as `.env.local`)
5. Deploy

Your portal will be live at `your-project.vercel.app`. Add a custom domain in Vercel settings.

### Security Checklist for Production

- [ ] Change all test passwords
- [ ] Remove seed data / test accounts
- [ ] Enable Supabase email confirmation (Settings → Auth)
- [ ] Set up a custom SMTP provider in Supabase for transactional emails
- [ ] Add your custom domain to Supabase auth redirect URLs
- [ ] Review RLS policies in Supabase dashboard
- [ ] Enable Supabase's built-in rate limiting
- [ ] Set `NEXT_PUBLIC_APP_URL` to your production domain

---

## Project Structure

```
portal/
├── package.json
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── .env.local.example
├── .gitignore
├── supabase/
│   └── schema.sql              # Database schema + RLS policies
├── scripts/
│   └── seed.ts                 # Seed script for test data
└── src/
    ├── middleware.ts            # Auth middleware (session refresh + route protection)
    ├── app/
    │   ├── globals.css          # Tailwind + print styles
    │   ├── layout.tsx           # Root layout
    │   ├── page.tsx             # Redirect based on role
    │   ├── login/page.tsx       # Login page
    │   ├── dashboard/
    │   │   ├── layout.tsx       # Client layout with top nav
    │   │   └── page.tsx         # Client dashboard
    │   ├── report/[id]/
    │   │   └── page.tsx         # Report view (client)
    │   ├── admin/
    │   │   ├── layout.tsx       # Admin layout with sidebar
    │   │   ├── page.tsx         # Admin dashboard
    │   │   ├── clients/
    │   │   │   ├── page.tsx     # Client list
    │   │   │   ├── new/page.tsx # Create client
    │   │   │   └── [id]/page.tsx# Client detail
    │   │   ├── reports/
    │   │   │   ├── page.tsx     # Reports list
    │   │   │   └── [id]/page.tsx# Report editor
    │   │   └── audit-log/page.tsx
    │   └── api/
    │       ├── auth/callback/   # Supabase auth callback
    │       ├── admin/
    │       │   ├── create-user/ # Create client user
    │       │   └── clients/[id]/# Delete client
    │       └── reports/
    │           ├── route.ts     # Create report
    │           └── update/      # Update report
    ├── components/
    │   ├── ui/                  # Reusable UI components
    │   │   ├── Button.tsx
    │   │   ├── Input.tsx
    │   │   ├── Card.tsx
    │   │   └── ClientNav.tsx
    │   ├── admin/
    │   │   ├── AdminSidebar.tsx
    │   │   ├── ClientActions.tsx
    │   │   └── ReportEditor.tsx
    │   └── report/              # Report renderer components
    │       ├── ReportRenderer.tsx
    │       ├── CompanyBriefing.tsx
    │       ├── ExecutiveSummary.tsx
    │       ├── WarmLeadsBanner.tsx
    │       ├── InvestorCard.tsx
    │       ├── SynergiesSection.tsx
    │       ├── DecisionMakers.tsx
    │       ├── FitAnalysis.tsx
    │       ├── PitchSection.tsx
    │       ├── StrategyTimeline.tsx
    │       ├── ReportHeader.tsx
    │       └── SidebarNav.tsx
    └── lib/
        ├── utils.ts             # cn(), formatDate(), getScoreColor()
        ├── schemas/
        │   └── report.ts        # Zod schema for report JSON validation
        └── supabase/
            ├── client.ts        # Browser Supabase client
            ├── server.ts        # Server Supabase client + service role client
            ├── middleware.ts     # Session refresh utility
            └── types.ts         # TypeScript database types
```

---

## JSON Report Format

See `requirements.md` for the full JSON schema, or look at the sample data in `scripts/seed.ts` for a working example.
