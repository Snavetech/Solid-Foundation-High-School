# MASTER PROMPT — Smart School Fees Payment System
### For use with an AI web-app builder (Bolt.new, Lovable, v0, Cursor, Antigravity, etc.)

---

## ROLE

You are a senior full-stack engineer and product architect. Build a complete, production-quality web application from this single prompt. Do not ask clarifying questions unless something below is genuinely ambiguous — make sensible, documented assumptions and proceed. Work sequentially through the **Build Plan** at the end of this prompt, and confirm completion of each phase before moving to the next.

---

## 1. PROJECT OVERVIEW

**Product name:** Smart School Fees System
**Client / Case study institution:** Solid Foundation Comprehensive High School
**Institution type:** Private Secondary School
**Motto:** "Knowledge is Wealth"
**Address:** Ishikpe Quarters, Issele-Uku, Along Onicha-Uku Road, Delta State, Nigeria

Solid Foundation Comprehensive High School currently manages fee collection manually — cash/bank-teller payments, paper receipts, and manual reconciliation in a ledger. This creates delays, lost records, disputes over payment status, and slow financial reporting.

This system digitizes the entire fee lifecycle: fee structure setup, parent/guardian online payment, automatic receipting, payment-status tracking, and financial reporting — branded end-to-end for the school (name, motto, and address appear on the login page, dashboards, receipts, and report headers).

---

## 2. GOALS & OBJECTIVES

1. Allow parents/guardians to pay school fees online from anywhere, in Naira (₦).
2. Give parents/students real-time visibility into payment status and balance owed.
3. Give school administration (Bursar/Admin) a single dashboard to manage fee structures, monitor collections, and generate reports.
4. Auto-generate a receipt for every successful payment — no manual receipt writing.
5. Replace the manual ledger with an auditable digital record.
6. Be mobile-friendly, since most parents will access it from a phone.

---

## 3. USER ROLES

| Role | Description | Access |
|---|---|---|
| **Super Admin** | School proprietor / ICT officer | Full system access — manage users, classes, sessions, fee structures, all payments, all reports |
| **Bursar / Accountant** | Manages finances day-to-day | Manage fee structures, view/record all payments, generate reports, manage receipts |
| **Parent / Guardian** | Pays fees, tracks status | View only their own ward(s)' fee status, make payments, download receipts |
| **Student** *(optional, read-only)* | Views own record | View own fee status and payment history only |

---

## 4. PRODUCT REQUIREMENTS DOCUMENT (PRD)

### 4.1 Functional Requirements

**A. Authentication & Access**
- Supabase Auth (email + password) for Admin, Bursar, and Parent accounts.
- Role-based access control enforced via Supabase Row Level Security (RLS) — not just hidden in the UI.
- Parents are onboarded by the school (Admin/Bursar creates the guardian record and links it to their ward(s)); parent then sets a password via an invite/reset link, OR self-registers and is matched to a student record via admission number + surname verification.

**B. Student & Guardian Management (Admin/Bursar)**
- CRUD for students: admission number, full name, class, arm, session, status (active/graduated/withdrawn), passport photo (optional).
- CRUD for guardians: full name, phone, email, relationship to student, linked student(s).
- Bulk import students via CSV (nice-to-have, Phase 2).

**C. Academic Structure**
- Manage **Classes** (e.g., JSS1–JSS3, SS1–SS3, with arms like A/B/C).
- Manage **Sessions & Terms** (e.g., "2025/2026", "First Term").

**D. Fee Structure Management (Admin/Bursar)**
- Define fee items per class per term (e.g., Tuition, Development Levy, PTA Levy, Exam Fee, Uniform).
- Set amount per fee item; support optional/compulsory flag.
- Ability to edit/deactivate a fee structure for future terms without altering historical records.

**E. Payments**
- Parent selects student, sees itemized fees due for the current term, and total balance.
- Pay online via **Paystack** (NGN, cards/bank transfer/USSD) — Flutterwave as a documented alternative if Paystack integration isn't available.
- Support partial payments (installments) against the total fee balance.
- Admin/Bursar can also record manual/offline payments (cash, bank teller) for parents who pay in person, with the same receipt flow.
- Every payment produces a transaction record: reference number, amount, method, status (pending/success/failed), timestamp.

**F. Receipts**
- On successful payment, auto-generate a receipt with: unique receipt number, school name/motto/address/logo, student name & admission no., fee item(s) paid, amount, date, payment method, and running balance.
- Receipt downloadable as PDF and viewable in-app.

**G. Dashboards**
- **Admin/Bursar dashboard:** total fees expected vs. collected (this term), outstanding balance by class, recent transactions, quick filters by session/term/class.
- **Parent dashboard:** each linked ward's fee summary, balance, payment history, "Pay Now" button.

**H. Reports (Admin/Bursar)**
- Termly collection report by class.
- Outstanding-balance report (defaulters list).
- Exportable to PDF/CSV.

**I. Notifications** *(Phase 2)*
- Email receipt copy on successful payment (Supabase Edge Function + email provider).
- Optional SMS reminder for outstanding balances.

### 4.2 Non-Functional Requirements
- **Security:** RLS on every table; parents can never query another student's data; secrets (Paystack keys) stored server-side/in Edge Functions, never exposed client-side.
- **Performance:** Dashboard queries should load in under 2 seconds for a school with up to ~2,000 students.
- **Responsiveness:** Fully usable on mobile (parents), tablet, and desktop (admin/bursar).
- **Currency & locale:** All amounts in Naira (₦), Nigerian date format, Africa/Lagos timezone.
- **Branding:** School name, motto, and address appear on login page, dashboard header, receipts, and report headers throughout.
- **Auditability:** Payment and fee-structure changes should be timestamped and attributable to the user who made them.

---

## 5. MVP SCOPE (build this first)

**In scope for MVP:**
1. Supabase Auth login for Admin/Bursar and Parent roles.
2. Student, Guardian, Class, Session/Term CRUD (Admin).
3. Fee structure setup per class/term (Admin).
4. Parent view of ward's fees due + balance.
5. Online payment via Paystack (full payment or partial/installment).
6. Manual payment entry by Admin/Bursar (for in-person payments).
7. Auto-generated receipt (in-app view + PDF download) branded with school info.
8. Admin dashboard: total collected vs. expected, outstanding balance by class.
9. Basic termly collection report (view + export to PDF/CSV).
10. Mobile-responsive UI throughout.

**Explicitly out of scope for MVP (Phase 2):**
- Student self-service login/portal.
- Email/SMS notifications and reminders.
- Bulk CSV student import.
- Multi-school / multi-branch support.
- Advanced analytics/charts beyond basic totals.
- Audit log UI (data can still be timestamped in the schema).

---

## 6. TECH STACK

- **Frontend:** React + Vite + TypeScript, TailwindCSS for styling, React Router for navigation.
- **Backend:** Supabase (Postgres database, Auth, Row Level Security, Storage for receipt PDFs/logo, Edge Functions for payment verification webhook).
- **Payments:** Paystack (test mode keys during development; document how to swap to live keys).
- **PDF generation:** Generate receipts client-side (e.g., a lightweight PDF library) or via a Supabase Edge Function — either is acceptable, but the receipt must be a real downloadable PDF, not just an on-screen div.
- **Charts (dashboard):** Recharts.
- **Hosting:** Any static host compatible with a Vite build (Vercel/Netlify) — connect to the Supabase project via environment variables.

---

## 7. DATABASE SCHEMA (Supabase / Postgres)

```sql
-- Profiles (extends Supabase auth.users)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role text not null check (role in ('super_admin','bursar','parent','student')),
  phone text,
  created_at timestamptz default now()
);

-- Classes
create table classes (
  id uuid primary key default gen_random_uuid(),
  name text not null,        -- e.g. 'JSS1', 'SS2'
  arm text,                  -- e.g. 'A', 'B'
  created_at timestamptz default now()
);

-- Sessions & Terms
create table session_terms (
  id uuid primary key default gen_random_uuid(),
  session text not null,     -- e.g. '2025/2026'
  term text not null check (term in ('First','Second','Third')),
  is_current boolean default false,
  created_at timestamptz default now()
);

-- Guardians
create table guardians (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id),  -- null until they create a login
  full_name text not null,
  phone text,
  email text,
  relationship text,
  created_at timestamptz default now()
);

-- Students
create table students (
  id uuid primary key default gen_random_uuid(),
  admission_no text unique not null,
  full_name text not null,
  class_id uuid references classes(id),
  guardian_id uuid references guardians(id),
  status text default 'active' check (status in ('active','graduated','withdrawn')),
  photo_url text,
  created_at timestamptz default now()
);

-- Fee structures
create table fee_structures (
  id uuid primary key default gen_random_uuid(),
  class_id uuid references classes(id),
  session_term_id uuid references session_terms(id),
  fee_item text not null,     -- e.g. 'Tuition', 'PTA Levy'
  amount numeric not null,
  is_compulsory boolean default true,
  created_at timestamptz default now()
);

-- Payments
create table payments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references students(id),
  fee_structure_id uuid references fee_structures(id),
  amount numeric not null,
  method text check (method in ('paystack','cash','bank_transfer')),
  reference text unique,
  status text default 'pending' check (status in ('pending','success','failed')),
  recorded_by uuid references profiles(id),  -- null if paid online by parent
  paid_at timestamptz default now()
);

-- Receipts
create table receipts (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid references payments(id),
  receipt_no text unique not null,
  pdf_url text,
  issued_at timestamptz default now()
);
```

### Row Level Security (enable on every table)

- `profiles`: user can read their own row; `super_admin`/`bursar` can read all.
- `students`, `guardians`: `super_admin`/`bursar` full access; `parent` role can only `select` rows where `guardians.profile_id = auth.uid()` (via join/policy).
- `fee_structures`, `classes`, `session_terms`: readable by everyone authenticated; writable only by `super_admin`/`bursar`.
- `payments`, `receipts`: `parent` can only `select` rows tied to their own student(s); `super_admin`/`bursar` full access; inserts from the client restricted appropriately, with payment status updates coming only from the verified Paystack webhook (Edge Function using the service role key, not the client).

---

## 8. UI / UX REQUIREMENTS

- **Login page:** School name, motto, and address displayed prominently above the login form.
- **Admin/Bursar dashboard:** Sidebar nav (Students, Guardians, Classes, Fee Structures, Payments, Reports). Top cards: Total Expected, Total Collected, Outstanding Balance.
- **Parent dashboard:** Card per ward showing class, term, fee breakdown, balance, and a "Pay Now" button; payment history list below.
- **Receipts:** Formatted like a real school receipt — school header (name, motto, address), receipt number, student details, itemized fees, amount paid, balance remaining, date, "Powered by Smart School Fees System" footer.
- Clean, professional color palette suitable for a school (avoid neon/playful colors); clear typography; fully responsive.

---

## 9. BUILD PLAN (execute in this order)

1. **Scaffold** the React + Vite + TypeScript + Tailwind project; set up Supabase client and environment variables.
2. **Database:** Create all tables and RLS policies above in Supabase.
3. **Auth:** Build login/signup flows for Admin, Bursar, and Parent roles; role-based route protection.
4. **Admin core:** Classes, Session/Terms, Students, Guardians CRUD screens.
5. **Fee structures:** Build the fee-structure management screen tied to class + term.
6. **Parent view:** Ward selector, fee breakdown, balance display.
7. **Payments:** Integrate Paystack checkout (test mode) for parent payments; build the manual-payment entry form for Admin/Bursar; build the Edge Function that verifies Paystack webhooks and updates `payments.status`.
8. **Receipts:** Auto-generate a receipt record + PDF on successful payment; add download/view UI.
9. **Dashboards:** Build Admin dashboard totals/cards and Parent dashboard summary.
10. **Reports:** Termly collection report and outstanding-balance report, with PDF/CSV export.
11. **Polish:** Responsive QA on mobile, empty states, loading states, error handling, and school branding applied consistently across every screen.
12. **Seed data:** Populate with Solid Foundation Comprehensive High School as the school profile, a few sample classes, a current session/term, and a handful of demo students/guardians/fee structures for demonstration purposes.

---

## 10. DELIVERABLES

- Working web app matching the MVP scope above, connected to a live Supabase project.
- SQL migration file(s) reflecting the schema and RLS policies.
- A short README covering environment variables needed (Supabase URL/anon key, Paystack public/secret key) and how to run the project locally.
