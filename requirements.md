# VA Customer Portal — Platform Requirements

**Version:** 1.0  
**Date:** April 9, 2026  
**Stack:** Next.js (React) + Supabase (Auth + PostgreSQL)

---

## 1. Overview

A secure, client-facing portal where biotech companies can log in and view their personalized investor matching reports. Admins at VA can upload report data as JSON, manage client accounts, and edit report content through the platform. The portal replaces the current static HTML report delivery with a dynamic, polished web experience.

---

## 2. User Roles

### 2.1 Client (Read-Only)
- Logs in with email + password (or magic link)
- Sees only their own reports
- Can view, scroll, and navigate their investor matching report
- Can download/export their report as PDF
- Cannot edit any data

### 2.2 Admin (VA Internal)
- Full access to all client accounts and reports
- Can create, disable, and manage client accounts
- Can upload JSON to create or overwrite report data
- Can edit report data directly on the platform (inline or form-based)
- Can preview reports as the client would see them
- Can manage which reports are visible/published to clients

---

## 3. Authentication & Security

Since security is a priority, the following measures apply:

### 3.1 Supabase Auth
- Email + password authentication with enforced password strength (min 12 chars, mixed case, numbers, symbols)
- Optional magic link (passwordless) login for clients
- Email verification required before first access
- Password reset flow via email

### 3.2 Row-Level Security (RLS)
- Supabase RLS policies ensure clients can only query their own data at the database level — not just the application level
- Admin role verified via a `user_roles` table (not just a frontend flag)
- All API routes validate session tokens server-side

### 3.3 Additional Security
- All traffic over HTTPS (enforced by hosting)
- Session tokens with short expiry + refresh tokens
- Rate limiting on login attempts (lockout after 5 failed tries)
- Audit log for admin actions (account creation, JSON uploads, data edits)
- No sensitive data in URL parameters
- CSP headers to prevent XSS
- Option for IP allowlisting if needed in the future

---

## 4. Data Model

### 4.1 Core Tables

**`users`** (managed by Supabase Auth)
- id, email, created_at, last_sign_in

**`user_roles`**
- user_id (FK → users), role (`client` | `admin`), created_at

**`clients`**
- id, user_id (FK → users), company_name, contact_name, contact_email, created_at, updated_at

**`reports`**
- id, client_id (FK → clients), title, status (`draft` | `published` | `archived`), report_data (JSONB), created_at, updated_at, published_at

**`audit_log`**
- id, admin_user_id, action_type, target_table, target_id, details (JSONB), created_at

### 4.2 Report JSON Structure

The `report_data` JSONB column stores the full report payload. Based on the existing HTML report, the schema should support:

```json
{
  "company": {
    "name": "Precision NeuroMed",
    "tagline": "Neuro-Oncology | Convection-Enhanced Delivery",
    "location": "Redwood City, CA",
    "lead_asset": "IL13-PE38 (cintredekin besudotox)",
    "indication": "Glioblastoma (GBM)",
    "fda_status": "Orphan Drug Designation (Oct 2025)",
    "prior_clinical": "Phase 3 (PRECISE trial)",
    "target_raise": "TBD"
  },
  "summary": {
    "total_investors": 2,
    "warm_leads": 4,
    "avg_fit_score": 0.81,
    "geographic_match": "Bay Area"
  },
  "warm_leads": [
    {
      "name": "Maha Radhakrishnan",
      "role": "Executive Partner, Sofinnova",
      "connected_via": "Helena, Jonas"
    }
  ],
  "investors": [
    {
      "name": "Sofinnova Investments",
      "segment": "Clinical-Stage Specialist",
      "segment_type": "clinical",
      "location": "Menlo Park, CA",
      "aum": "$3B",
      "fit_score": 0.70,
      "tier": "Priority Target",
      "score_breakdown": [
        { "category": "Investment Activity", "weight": 35, "score": 26.3 },
        { "category": "Financial Capacity", "weight": 30, "score": 25.5 },
        { "category": "Therapeutic Understanding", "weight": 25, "score": 13.8 },
        { "category": "Value-Add Signals", "weight": 10, "score": 4.0 }
      ],
      "company_info": {
        "founded": "1976",
        "focus_areas": "Oncology, Neurology, Immunology",
        "investment_stage": "Clinical-stage, Public equity",
        "geographic_fit": "15 min from PNM (Redwood City)",
        "check_size": null,
        "notable_exit": null
      },
      "portfolio": [
        {
          "name": "Marinus Pharma (MRNS)",
          "detail": "Neurological disorders | Ganaxolone",
          "tag": "CNS/Neuro",
          "tag_type": "default"
        }
      ],
      "fit_analysis": {
        "headline": "Perfect positioning: Clinical-stage specialist...",
        "points": [
          "Oncology + Neurology combo matches GBM indication",
          "Clinical-stage focus aligns with prior Phase 3 data"
        ],
        "investment_capacity": "Clinical-stage investments"
      },
      "pitch": {
        "target_label": "For Sofinnova Investments (Clinical-Stage)",
        "intro": "Precision NeuroMed represents a unique clinical-stage opportunity...",
        "bullets": [
          "World-class founders: Bankiewicz (CED pioneer)...",
          "Prior Phase 3 showed efficacy in optimally-treated patients..."
        ]
      }
    }
  ],
  "synergies": {
    "insight_title": "Critical Synergy: Brain Tumor Experience",
    "insight_body": "Versant's Monteris Medical is directly relevant...",
    "cards": [
      {
        "investor_name": "Sofinnova Portfolio",
        "headline_stat": "32 Exits | 25-30% IRR",
        "summary": "CNS + Oncology expertise...",
        "portfolio": [],
        "track_record": "65% portfolio success rate | $15-35M typical check"
      }
    ]
  },
  "decision_makers": [
    {
      "investor_name": "Sofinnova Investments",
      "name": "Maha Radhakrishnan",
      "title": "Executive Partner",
      "bio": "Senior investment professional...",
      "connected": true,
      "connected_via": "Helena, Jonas",
      "segment_type": "clinical"
    }
  ],
  "strategy": {
    "title": "Recommended Engagement Strategy",
    "steps": [
      {
        "week": "Week 1",
        "title": "Priority Outreach — Versant (92% fit)",
        "details": "Via Helena: Intro to Ariel Kantor..."
      }
    ]
  },
  "platform_capabilities": [
    {
      "title": "Investor Database",
      "points": ["2500+ scored investors", "Portfolio company analysis"]
    }
  ],
  "metadata": {
    "generated_date": "2026-01-30",
    "prepared_for": "Precision NeuroMed Demo",
    "attendees": ["Sandeep Kunwar", "Purvi Kunwar", "John Geschke"]
  }
}
```

---

## 5. Admin Features

### 5.1 Client Management
- **Create client account:** Enter company name, contact name, email → generates invite email with temporary password or magic link
- **View all clients:** Searchable, sortable table with company name, contact, last login, number of reports, status
- **Disable/re-enable access:** Toggle a client's ability to log in without deleting their data
- **Reset password:** Trigger a password reset email for a client

### 5.2 Report Management
- **Upload JSON:** Drag-and-drop or file picker to upload a JSON file for a selected client. System validates the JSON against the expected schema before saving. Shows validation errors with line numbers if the JSON doesn't match.
- **Overwrite existing report:** Upload new JSON to replace the current report data. Previous version is kept in a `report_versions` history (soft archive, not overwritten).
- **Inline editing:** Form-based editor for report fields — admin can tweak scores, text, contacts, and strategy steps directly on the platform without needing to re-upload JSON.
- **Report status:** Toggle between `draft` (not visible to client), `published` (visible), and `archived` (hidden but preserved).
- **Preview as client:** Button that renders the report exactly as the client would see it.

### 5.3 Audit Trail
- Every admin action (create client, upload JSON, edit field, change status) is logged with timestamp, admin user, action type, and before/after values.

---

## 6. Client Features

### 6.1 Dashboard
- After login, client sees a clean dashboard with their report(s)
- If only one published report exists, go directly to the report view
- If multiple reports exist (future), show a list with titles and dates

### 6.2 Report View
- Full rendered report with all sections from the JSON data
- Smooth navigation between sections (sticky sidebar or top nav)
- Responsive — works on desktop, tablet, and mobile

### 6.3 Export
- "Download as PDF" button that generates a styled PDF of the report
- Optional: "Share link" for a time-limited, read-only URL (for the client to forward to their team)

---

## 7. UX Improvements Over Current Report

The existing HTML report has all the right information but has several UX issues. Here's what to fix:

### 7.1 Navigation & Structure
- **Problem:** The current report is one long scrolling page with no way to jump between sections. On a data-dense report, users get lost.
- **Solution:** Add a **sticky sidebar navigation** (desktop) or **collapsible top nav** (mobile) with section anchors: Company Overview, Summary, Warm Leads, Investors, Synergies, Decision Makers, Fit Analysis, Pitches, Strategy. Highlight the active section as the user scrolls.

### 7.2 Information Hierarchy
- **Problem:** Everything is given equal visual weight. The most important data (fit scores, warm leads, recommended next steps) doesn't stand out from supporting detail.
- **Solution:** Use a **progressive disclosure** pattern. Show key metrics and scores upfront in a compact summary. Investor cards should default to a **collapsed view** showing name, score, segment, and AUM — with an "Expand" to reveal score breakdowns, portfolio, and detailed analysis. This reduces overwhelm significantly.

### 7.3 Investor Comparison
- **Problem:** Investor cards are placed side by side but can't be easily compared. Users have to scroll back and forth between cards.
- **Solution:** Add a **comparison table view** toggle that shows all investors in a table with columns for key metrics (fit score, AUM, check size, focus areas, warm leads count). Users can switch between card view and table view.

### 7.4 Warm Leads — Make Them Actionable
- **Problem:** Warm leads are shown in a banner but feel static. There's no clear call-to-action.
- **Solution:** Move warm leads into each investor's card as a dedicated section. Add a clear **"Request Intro"** button (or similar CTA) that links to a contact action (email template, calendar booking, or in-platform request). Group warm leads by investor so the connection path is obvious.

### 7.5 Score Breakdown Clarity
- **Problem:** Score categories show both a percentage weight and a percentage score (e.g., "Investment Activity (35%) → 26.3%"), which is confusing. Is 26.3% good or bad?
- **Solution:** Show each category as a **score out of its maximum weight** (e.g., "Investment Activity: 26.3 / 35") with a progress bar that fills relative to the max. Add a color scale: green (>80% of max), yellow (50-80%), red (<50%). Add a brief tooltip or hover explanation for what each category means.

### 7.6 Mobile Experience
- **Problem:** The current report has basic responsive CSS but the two-column investor grid becomes cramped. Font sizes don't adapt well.
- **Solution:** Implement a true **mobile-first layout**. Single-column on mobile. Cards become full-width, collapsible accordion items. Touch-friendly tap targets (min 44px). Swipeable investor cards. Bottom sheet navigation instead of sidebar.

### 7.7 Visual Polish
- **Problem:** The dark theme is decent but feels heavy for a professional deliverable. Some text contrast is low (muted text on dark backgrounds).
- **Solution:** Offer a **light theme** as the default (more professional for investor-facing content), with dark mode as a toggle. Ensure all text meets **WCAG AA contrast ratios** (4.5:1 for body text). Use the brand gradient sparingly — only on key accents and CTAs, not on every section header.

### 7.8 Engagement Strategy — Make It Interactive
- **Problem:** The strategy timeline is plain text. It reads well but doesn't feel actionable.
- **Solution:** Turn the timeline into an **interactive checklist** with status indicators (not started / in progress / completed). Admin can update the status. Client sees where they are in the engagement process. Optional: link each step to the relevant investor card.

### 7.9 Data Freshness Indicator
- **Problem:** The report footer shows a generation date but it's easy to miss. Clients may not know if data is current.
- **Solution:** Add a visible **"Last updated: [date]"** badge near the top of the report. If data is older than 30 days, show a subtle "Update available — contact your VA team" indicator.

### 7.10 Print / PDF Optimization
- **Problem:** The current dark-themed HTML doesn't print well (wastes ink, dark backgrounds clip).
- **Solution:** The PDF export should use a **light, print-optimized layout** regardless of the theme the user is viewing. Clean margins, appropriate page breaks between sections, company branding in header/footer.

---

## 8. Pages & Routes

| Route | Access | Description |
|---|---|---|
| `/login` | Public | Login page |
| `/forgot-password` | Public | Password reset request |
| `/dashboard` | Client | Client home — list of reports |
| `/report/[id]` | Client | Full report view |
| `/admin` | Admin | Admin dashboard — overview stats |
| `/admin/clients` | Admin | Client list with search/filter |
| `/admin/clients/[id]` | Admin | Client detail — edit info, see reports |
| `/admin/clients/new` | Admin | Create new client form |
| `/admin/reports` | Admin | All reports across all clients |
| `/admin/reports/[id]` | Admin | Report detail — edit, preview, status |
| `/admin/reports/[id]/upload` | Admin | JSON upload for this report |
| `/admin/audit-log` | Admin | Searchable audit trail |

---

## 9. Tech Architecture

### 9.1 Frontend
- **Next.js 14+** (App Router) with React Server Components where appropriate
- **Tailwind CSS** for styling
- **Shadcn/ui** component library for consistent, accessible UI
- **Framer Motion** for section transitions and card expand/collapse
- **React-PDF** or server-side PDF generation (Puppeteer) for export

### 9.2 Backend
- **Next.js API routes** (or Supabase Edge Functions) for server logic
- **Supabase** for auth, database (PostgreSQL), and RLS
- **Supabase Storage** for any file uploads (JSON source files, generated PDFs)
- **Zod** for JSON schema validation on upload

### 9.3 Deployment
- **Vercel** for Next.js hosting (pairs naturally, automatic previews)
- **Supabase Cloud** for managed database and auth
- Custom domain with SSL

### 9.4 Monitoring
- Error tracking (Sentry or similar)
- Basic analytics (page views, login frequency) — optional

---

## 10. JSON Upload Flow (Admin)

1. Admin selects a client from the client list
2. Clicks "Upload Report Data"
3. Drags/drops or selects a `.json` file
4. System validates the JSON against the expected schema (using Zod)
5. If validation fails: show clear error messages with the specific fields that are wrong or missing
6. If validation passes: show a preview of the parsed report
7. Admin reviews the preview and clicks "Save as Draft" or "Publish"
8. If overwriting: previous version is archived automatically with a timestamp
9. Audit log records the upload

---

## 11. MVP Scope vs. Future

### MVP (Phase 1)
- Client login (email + password via Supabase)
- Admin login with role-based access
- Admin: create client accounts
- Admin: upload JSON to create/overwrite reports
- Admin: set report status (draft / published)
- Client: view their published report(s)
- Report rendered with all existing sections + UX improvements (sidebar nav, collapsible cards, score clarity, light theme)
- PDF export
- Supabase RLS for data isolation
- Audit log for admin actions

### Phase 2
- Inline report editing (form-based, no JSON needed)
- Comparison table view for investors
- Interactive engagement strategy (checklist with status)
- Magic link login option
- Time-limited shareable report links
- Email notifications (report published, account created)
- Report versioning UI (admin can view/restore previous versions)

### Phase 3
- Client-facing request system ("Request Intro" button → triggers workflow)
- Multi-report dashboard with filtering
- Analytics dashboard for admin (which sections clients spend time on)
- IP allowlisting option
- API for programmatic report generation (JSON in → report out)

---

## 12. Open Questions

1. **Branding:** Should the portal use VA branding, or should it be white-labeled per client?
2. **Report sections:** Are all sections in the current report always present, or are some optional depending on the client?
3. **Concurrent admin users:** Will multiple admins be editing at the same time? (Impacts whether we need optimistic locking.)
4. **Data sensitivity:** Do any report fields need to be encrypted at rest beyond Supabase's default encryption?
5. **SLA:** What uptime expectations does the client portal need to meet?
