# Smart School Fees System
## Software Requirements Specification, System Design Analysis & Page Inventory

**Case study institution:** Solid Foundation Comprehensive High School
**Address:** Ishikpe Quarters, Issele-Uku, Along Onicha-Uku Road, Delta State, Nigeria
**Motto:** "Knowledge is Wealth"

---

# PART A — PRODUCT REQUIREMENTS DOCUMENT (PRD)

## A.1 Introduction

### A.1.1 Purpose
This document specifies the functional and non-functional requirements for the **Smart School Fees System**, a web-based application that digitizes fee collection, tracking, and reporting for Solid Foundation Comprehensive High School. It is intended to guide design, development, and evaluation of the system, and to serve as the requirements reference within the project's documentation.

### A.1.2 Problem Statement
Solid Foundation Comprehensive High School currently collects fees manually — parents pay in person or via bank deposit, and the bursary reconciles payments against a paper or spreadsheet ledger. This causes:
- Delays in confirming payment, since reconciliation is manual.
- Disputes over payment status (parents cannot independently verify what they've paid).
- Loss or damage of physical receipt records.
- Slow, error-prone generation of termly financial reports.
- No independent audit trail of who recorded what payment and when.

### A.1.3 Scope
The system covers the full fee lifecycle: defining fee structures per class/term, parents making online or in-person payments, automatic receipt generation, real-time payment-status visibility, and financial reporting for school administration. It does not cover payroll, academic result management, or attendance — these are out of scope.

### A.1.4 Definitions & Acronyms
| Term | Meaning |
|---|---|
| PRD | Product Requirements Document |
| MVP | Minimum Viable Product |
| RLS | Row Level Security (Postgres/Supabase access control mechanism) |
| Guardian | Parent or legal guardian responsible for a student's fees |
| Session | Academic year (e.g. 2025/2026) |
| Term | One of three academic periods within a session |
| Fee Item | A single billable component of fees (e.g. Tuition, PTA Levy) |

---

## A.2 Overall Description

### A.2.1 Product Perspective
The system is a new, standalone web application, not a replacement module within an existing system. It is built on a modern web stack with Supabase providing authentication, database, and backend logic, so no dedicated server infrastructure needs to be managed by the school.

### A.2.2 User Classes and Characteristics
| User Class | Technical Proficiency | Primary Needs |
|---|---|---|
| Super Admin (Proprietor/ICT) | Moderate–High | Full oversight, user & structure management |
| Bursar/Accountant | Low–Moderate | Fast, reliable fee & payment management, accurate reports |
| Parent/Guardian | Low–Moderate, mostly mobile users | Simple, trustworthy way to pay and confirm payment |
| Student *(optional)* | Low–Moderate | Quick view of own fee status |

### A.2.3 Operating Environment
- **Client side:** Any modern browser (Chrome, Safari, Edge, Firefox) on desktop, tablet, or mobile. Majority of parent traffic is expected to be mobile.
- **Server side:** Supabase-hosted Postgres database, Auth, and Edge Functions (serverless — no dedicated server to provision).
- **Network:** Designed to remain usable on the moderate/variable mobile data speeds common in the deployment region.

### A.2.4 Assumptions and Dependencies
- Parents/guardians have access to a phone or computer with internet access.
- The school will designate at least one Bursar/Admin account holder to maintain fee structures each term.
- Online payment depends on the availability of a third-party payment gateway (Paystack), which is a dependency the school does not control.

---

## A.3 Functional Requirements

Requirements are grouped by module and numbered for traceability.

### FR-1: Authentication & Access Control
- FR-1.1: The system shall allow Admin, Bursar, and Parent users to log in with email and password.
- FR-1.2: The system shall enforce role-based access so each user only sees data and actions permitted for their role.
- FR-1.3: The system shall support a "forgot password" self-service reset flow.
- FR-1.4: Parent accounts shall be linked to one or more student records via the Guardian record, either created by Admin/Bursar or verified via admission number + surname at self-registration.

### FR-2: Student & Guardian Management
- FR-2.1: Admin/Bursar shall be able to create, view, edit, and deactivate student records (admission no., name, class, guardian, status).
- FR-2.2: Admin/Bursar shall be able to create, view, and edit guardian records and link them to one or more students.
- FR-2.3: The system shall prevent duplicate admission numbers.

### FR-3: Academic Structure Management
- FR-3.1: Admin/Bursar shall be able to create and manage classes (e.g., JSS1–SS3, with arms).
- FR-3.2: Admin/Bursar shall be able to create sessions and terms, and mark exactly one as the "current" term used for default views.

### FR-4: Fee Structure Management
- FR-4.1: Admin/Bursar shall be able to define fee items and amounts per class, per term.
- FR-4.2: Admin/Bursar shall be able to mark a fee item as compulsory or optional.
- FR-4.3: Editing a fee structure shall not alter the amount already recorded against historical payments.

### FR-5: Payments
- FR-5.1: A parent shall be able to view the itemized fees due and total balance for each linked student.
- FR-5.2: A parent shall be able to pay fees online via the integrated payment gateway, in full or in part (installments).
- FR-5.3: Admin/Bursar shall be able to record a manual payment (cash/bank transfer) against a student's account.
- FR-5.4: The system shall update a student's balance automatically after any successful payment, whether online or manually recorded.
- FR-5.5: The system shall record, for every payment: amount, method, status, timestamp, and (for manual entries) which staff member recorded it.

### FR-6: Receipts
- FR-6.1: The system shall automatically generate a receipt for every successful payment.
- FR-6.2: Each receipt shall display the school's name, motto, and address; the student's name and admission number; itemized fees paid; amount; date; payment method; and remaining balance.
- FR-6.3: A receipt shall be viewable in-app and downloadable as a PDF.

### FR-7: Dashboards
- FR-7.1: The Admin/Bursar dashboard shall display total fees expected, total collected, and outstanding balance for the current term, with the ability to filter by class.
- FR-7.2: The Parent dashboard shall display, for each linked ward, their class, current term, fee breakdown, balance due, and a payment action.

### FR-8: Reporting
- FR-8.1: Admin/Bursar shall be able to generate a termly collection report by class.
- FR-8.2: Admin/Bursar shall be able to generate an outstanding-balance ("defaulters") report.
- FR-8.3: Reports shall be exportable as PDF and/or CSV.

---

## A.4 Non-Functional Requirements

| Category | Requirement |
|---|---|
| **Security** | All data access enforced by Row Level Security at the database level, not just hidden in the UI. Payment gateway secret keys are never exposed to the client. |
| **Performance** | Dashboard and list views should load within ~2 seconds under normal conditions for a school of up to ~2,000 students. |
| **Usability** | Interface must be simple enough for low-to-moderate-tech-proficiency parents to complete a payment without assistance. |
| **Availability** | Reliant on Supabase and Paystack uptime; no additional infrastructure for the school to maintain. |
| **Responsiveness** | Fully functional on mobile, tablet, and desktop screen sizes. |
| **Localization** | All currency shown in Naira (₦); dates in Nigerian format; timezone Africa/Lagos. |
| **Auditability** | Every payment and fee-structure change is timestamped and, where applicable, attributed to the staff member who made it. |
| **Branding** | School name, motto, and address consistently displayed on login, dashboards, receipts, and report headers. |

---

## A.5 MVP vs. Future Scope

**MVP (Phase 1):** Auth for Admin/Bursar/Parent · Student/Guardian/Class/Term CRUD · Fee structure setup · Parent fee view · Online payment (Paystack) · Manual payment entry · Auto-generated PDF receipts · Admin dashboard totals · Termly collection & outstanding-balance reports · Mobile-responsive UI.

**Phase 2 (future scope):** Student self-service login · Email/SMS payment notifications and reminders · Bulk CSV student import · Multi-school/multi-branch support · Advanced analytics/trend charts · Full audit-log UI · Staff/user management screen for creating additional Bursar accounts.

## A.6 Success / Acceptance Criteria
- A parent can log in, view their ward's balance, pay online, and immediately see an updated balance and downloadable receipt.
- An Admin/Bursar can set up a new term's fee structure and see it correctly reflected in every parent's balance without manual recalculation.
- The termly collection report total reconciles exactly with the sum of successful payment records for that term.
- No user can view or modify data belonging to a student/guardian they are not linked to (verified via RLS testing).

---
---

# PART B — SYSTEM DESIGN ANALYSIS

## B.1 System Architecture Overview

The system follows a **three-tier architecture**:

```
┌─────────────────────────────┐
│      PRESENTATION TIER       │
│  React + Vite + TypeScript   │
│  (Admin, Bursar, Parent UI)  │
└──────────────┬───────────────┘
               │ HTTPS (REST/Realtime via Supabase client)
┌──────────────▼───────────────┐
│      APPLICATION TIER         │
│  Supabase Auth                │
│  Supabase Edge Functions       │
│   - Paystack webhook verifier │
│   - Receipt/PDF generation     │
└──────────────┬───────────────┘
               │
┌──────────────▼───────────────┐
│         DATA TIER              │
│  Supabase Postgres Database    │
│  Row Level Security policies   │
│  Supabase Storage (receipt PDFs)│
└─────────────────────────────┘
               │
      ┌────────▼────────┐
      │  Paystack (external│
      │  payment gateway)  │
      └────────────────────┘
```

**Rationale:** Using Supabase for the application and data tiers removes the need for the school to provision or maintain its own server, reduces the attack surface (RLS is enforced at the database layer, so even a compromised client cannot read/write data outside its permissions), and keeps hosting costs low — appropriate for a single private secondary school's budget and scale.

## B.2 Use Case Analysis

**Actors:** Super Admin, Bursar, Parent/Guardian, Student *(Phase 2)*, Paystack (external system).

| Actor | Key Use Cases |
|---|---|
| Super Admin | Manage staff accounts, manage classes/sessions, oversee all fee structures and payments, view all reports |
| Bursar | Manage fee structures, record manual payments, view payments, generate reports |
| Parent/Guardian | View ward's fee status, make online payment, view payment history, download receipt |
| Student *(Phase 2)* | View own fee status (read-only) |
| Paystack | Process payment, send webhook confirmation to the system |

**Primary use case — "Pay Fees Online":**
1. Parent logs in and selects a ward.
2. System displays itemized fees due and balance for the current term.
3. Parent enters an amount (full or partial) and initiates payment.
4. System redirects to Paystack checkout.
5. Parent completes payment on Paystack.
6. Paystack sends a webhook to a Supabase Edge Function.
7. Edge Function verifies the transaction signature and amount, then updates the payment record to `success`.
8. System generates a receipt and updates the student's balance.
9. Parent is redirected back and sees the updated balance and receipt.

**Alternate flow:** If Paystack reports failure, the payment record is marked `failed`, balance is unchanged, and the parent is prompted to retry.

## B.3 Data Flow (Level 0)

```
[Parent] --fee inquiry--> [System] --query balance--> [Database]
[Parent] --payment--> [System] --initiate charge--> [Paystack]
[Paystack] --webhook confirmation--> [System] --update record--> [Database]
[System] --generate--> [Receipt PDF] --store--> [Storage]
[Bursar] --define fees--> [System] --write--> [Database]
[Bursar] --request report--> [System] --aggregate query--> [Database] --report--> [Bursar]
```

## B.4 Database Design (Entity-Relationship Summary)

| Entity | Key Relationships |
|---|---|
| `profiles` | Extends `auth.users`; one profile per staff/parent account |
| `guardians` | Optionally linked to a `profile` (once they have login access); one guardian → many students |
| `students` | Belongs to one `class`; belongs to one `guardian` |
| `classes` | One class → many students; one class → many fee structures |
| `session_terms` | One session/term → many fee structures |
| `fee_structures` | Belongs to one class + one session/term; one fee structure → many payments |
| `payments` | Belongs to one student and one fee structure; recorded by a profile (nullable, for online payments) |
| `receipts` | Belongs to one payment (1:1) |

*(Full SQL schema with column types and RLS policies is provided in the accompanying master build prompt document.)*

## B.5 Module Design

1. **Authentication Module** — login, password reset, role resolution, route protection.
2. **Academic Structure Module** — classes, sessions/terms management.
3. **People Module** — student and guardian records and linkage.
4. **Fee Management Module** — fee structure definition per class/term.
5. **Payment Module** — online (Paystack) and manual payment recording, balance calculation.
6. **Receipt Module** — receipt generation and PDF rendering/storage.
7. **Dashboard Module** — role-specific summary views.
8. **Reporting Module** — collection and outstanding-balance reports with export.

## B.6 Security Design
- **Row Level Security** on every table: parents can only query rows tied to their own `guardian_id`; Admin/Bursar roles have broader access defined by their `profiles.role`.
- **Payment integrity:** the client never marks a payment as successful — only the server-side Edge Function, after verifying Paystack's webhook signature, updates `payments.status`. This prevents a malicious client from faking a successful payment.
- **Secrets management:** Paystack secret key lives only in the Edge Function environment, never shipped to the browser.
- **Password handling:** delegated entirely to Supabase Auth (hashed, industry-standard storage) — the application never stores raw passwords.

## B.7 System Requirements

| | Minimum |
|---|---|
| **Client device** | Any smartphone/tablet/PC with a modern browser and internet access |
| **Server/hosting** | Supabase project (free/pro tier depending on scale); static hosting for the frontend build (e.g. Vercel/Netlify) |
| **Third-party services** | Paystack merchant account (test + live keys) |

---
---

# PART C — WEBSITE PAGE INVENTORY

Every page below is described with its purpose, access role, and key on-screen elements.

## C.1 Public / Authentication Pages

**1. Login Page** — `/login`
Entry point for all roles. Displays the school name, motto, and address above an email/password form. Role is resolved automatically after login and the user is routed to the correct dashboard. Includes a "Forgot password?" link.

**2. Parent Self-Registration Page** — `/register`
For parents without a school-issued account. Collects email, password, and admission number + student surname to verify and link to the correct student/guardian record before granting access.

**3. Forgot / Reset Password Page** — `/reset-password`
Standard email-link password reset flow via Supabase Auth.

**4. Unauthorized / Access Denied Page** — `/403`
Shown when a logged-in user attempts to access a route outside their role's permissions, with a link back to their own dashboard.

**5. Not Found Page** — `/404`
Generic fallback for invalid routes, branded consistently with the rest of the app.

## C.2 Admin / Bursar Pages

**6. Admin Dashboard** — `/admin/dashboard`
Landing page after Admin/Bursar login. Summary cards: Total Expected, Total Collected, Outstanding Balance (current term); a recent-transactions list; class filter.

**7. Students List Page** — `/admin/students`
Searchable, filterable (by class/status) table of all students, with actions to view/edit or add a new student.

**8. Student Detail / Edit Page** — `/admin/students/:id`
Full student record: bio-data, class, guardian link, fee balance summary, and payment history for that student.

**9. Add Student Page** — `/admin/students/new`
Form to register a new student, including linking to an existing guardian or creating a new one inline.

**10. Guardians List Page** — `/admin/guardians`
Table of all guardians with contact info and linked student(s); search and add/edit actions.

**11. Guardian Detail / Edit Page** — `/admin/guardians/:id`
Guardian's contact details and a list of all linked students with quick links to each.

**12. Classes Management Page** — `/admin/classes`
List/add/edit classes and arms (e.g. JSS1A, JSS1B).

**13. Sessions & Terms Management Page** — `/admin/sessions`
List/add sessions and terms; toggle which term is "current" (drives default views app-wide).

**14. Fee Structures Management Page** — `/admin/fee-structures`
Table of fee items by class and term, with amount and compulsory/optional flag; add/edit/deactivate actions.

**15. Payments List Page** — `/admin/payments`
All payment transactions (online + manual), filterable by class, term, status, and method; links to each student's record and receipt.

**16. Record Manual Payment Page** — `/admin/payments/new`
Form to log an in-person cash/bank-transfer payment against a selected student and fee item, generating a receipt on submission.

**17. Reports Page** — `/admin/reports`
Generate and export the termly collection report and outstanding-balance ("defaulters") report as PDF/CSV, filterable by class and term.

**18. Receipt View Page (Admin)** — `/admin/receipts/:id`
Read-only formatted view of any receipt in the system, with a re-download PDF option.

**19. Staff/User Management Page** *(Phase 2)* — `/admin/users`
Super Admin–only: create/deactivate Bursar accounts and assign roles.

**20. Profile / Settings Page (Admin/Bursar)** — `/admin/settings`
Update own name, phone, and password.

## C.3 Parent Pages

**21. Parent Dashboard** — `/parent/dashboard`
Landing page after parent login. One card per linked ward showing class, term, balance due, and a "Pay Now" button.

**22. Ward Fee Details Page** — `/parent/students/:id`
Itemized breakdown of fees due for the selected ward this term, total balance, and payment history for that ward.

**23. Make Payment Page** — `/parent/students/:id/pay`
Select amount (full balance or partial), review, and proceed to Paystack checkout; shows a pending/confirmation state while awaiting webhook confirmation.

**24. Payment History Page** — `/parent/payments`
Chronological list of all payments made across all of the parent's linked wards, each linking to its receipt.

**25. Receipt View / Download Page (Parent)** — `/parent/receipts/:id`
Formatted receipt for a specific payment, with a "Download PDF" action.

**26. Profile / Settings Page (Parent)** — `/parent/settings`
Update own contact details and password.

## C.4 Student Pages *(Phase 2 — optional)*

**27. Student Dashboard** — `/student/dashboard`
Read-only view of own fee status and payment history — no payment action.

---

*This document, together with the master build prompt, forms the complete specification for implementing the Smart School Fees System for Solid Foundation Comprehensive High School.*
