-- SQL Migration for Smart School Fees System
-- Institution: Solid Foundation Comprehensive High School

-- Create extensions
create extension if not exists "uuid-ossp";

-- 1. Profiles table (extends auth.users)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role text not null check (role in ('super_admin','bursar','parent','student')),
  phone text,
  created_at timestamptz default now()
);

-- 2. Classes table
create table if not exists classes (
  id uuid primary key default gen_random_uuid(),
  name text not null,        -- e.g. 'JSS1', 'SS2'
  arm text,                  -- e.g. 'A', 'B', 'Science'
  created_at timestamptz default now()
);

-- 3. Sessions & Terms table
create table if not exists session_terms (
  id uuid primary key default gen_random_uuid(),
  session text not null,     -- e.g. '2025/2026'
  term text not null check (term in ('First','Second','Third')),
  is_current boolean default false,
  created_at timestamptz default now()
);

-- 4. Guardians table
create table if not exists guardians (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete set null,
  full_name text not null,
  phone text,
  email text,
  relationship text,
  created_at timestamptz default now()
);

-- 5. Students table
create table if not exists students (
  id uuid primary key default gen_random_uuid(),
  admission_no text unique not null,
  full_name text not null,
  class_id uuid references classes(id) on delete set null,
  guardian_id uuid references guardians(id) on delete set null,
  status text default 'active' check (status in ('active','graduated','withdrawn')),
  photo_url text,
  created_at timestamptz default now()
);

-- 6. Fee structures table
create table if not exists fee_structures (
  id uuid primary key default gen_random_uuid(),
  class_id uuid references classes(id) on delete cascade,
  session_term_id uuid references session_terms(id) on delete cascade,
  fee_item text not null,     -- e.g. 'Tuition', 'Development Levy', 'PTA Levy', 'Exam Fee'
  amount numeric not null check (amount >= 0),
  is_compulsory boolean default true,
  created_at timestamptz default now()
);

-- 7. Payments table
create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references students(id) on delete cascade,
  fee_structure_id uuid references fee_structures(id) on delete set null,
  amount numeric not null check (amount > 0),
  method text check (method in ('paystack','cash','bank_transfer')),
  reference text unique not null,
  status text default 'pending' check (status in ('pending','success','failed')),
  recorded_by uuid references profiles(id) on delete set null,  -- null if paid online by parent
  paid_at timestamptz default now()
);

-- 8. Receipts table
create table if not exists receipts (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid references payments(id) on delete cascade,
  receipt_no text unique not null,
  pdf_url text,
  issued_at timestamptz default now()
);

-- Enable Row Level Security on all tables
alter table profiles enable row level security;
alter table classes enable row level security;
alter table session_terms enable row level security;
alter table guardians enable row level security;
alter table students enable row level security;
alter table fee_structures enable row level security;
alter table payments enable row level security;
alter table receipts enable row level security;

-- RLS POLICIES

-- Profiles policy
create policy "Users can read own profile" on profiles
  for select using (auth.uid() = id);

create policy "Admins and Bursars can read all profiles" on profiles
  for select using (
    exists (
      select 1 from profiles where id = auth.uid() and role in ('super_admin', 'bursar')
    )
  );

-- Classes policy
create policy "Anyone authenticated can view classes" on classes
  for select using (auth.role() = 'authenticated');

create policy "Admins and Bursars can modify classes" on classes
  for all using (
    exists (
      select 1 from profiles where id = auth.uid() and role in ('super_admin', 'bursar')
    )
  );

-- Session Terms policy
create policy "Anyone authenticated can view session terms" on session_terms
  for select using (auth.role() = 'authenticated');

create policy "Admins and Bursars can modify session terms" on session_terms
  for all using (
    exists (
      select 1 from profiles where id = auth.uid() and role in ('super_admin', 'bursar')
    )
  );

-- Guardians policy
create policy "Admins and Bursars full access on guardians" on guardians
  for all using (
    exists (
      select 1 from profiles where id = auth.uid() and role in ('super_admin', 'bursar')
    )
  );

create policy "Parents can view own guardian profile" on guardians
  for select using (profile_id = auth.uid());

-- Students policy
create policy "Admins and Bursars full access on students" on students
  for all using (
    exists (
      select 1 from profiles where id = auth.uid() and role in ('super_admin', 'bursar')
    )
  );

create policy "Parents can view their linked wards" on students
  for select using (
    exists (
      select 1 from guardians where guardians.id = students.guardian_id and guardians.profile_id = auth.uid()
    )
  );

-- Fee structures policy
create policy "Anyone authenticated can view fee structures" on fee_structures
  for select using (auth.role() = 'authenticated');

create policy "Admins and Bursars can modify fee structures" on fee_structures
  for all using (
    exists (
      select 1 from profiles where id = auth.uid() and role in ('super_admin', 'bursar')
    )
  );

-- Payments policy
create policy "Admins and Bursars full access on payments" on payments
  for all using (
    exists (
      select 1 from profiles where id = auth.uid() and role in ('super_admin', 'bursar')
    )
  );

create policy "Parents can view payments for their wards" on payments
  for select using (
    exists (
      select 1 from students s
      join guardians g on s.guardian_id = g.id
      where s.id = payments.student_id and g.profile_id = auth.uid()
    )
  );

create policy "Parents can insert payment transactions for their wards" on payments
  for insert with check (
    exists (
      select 1 from students s
      join guardians g on s.guardian_id = g.id
      where s.id = payments.student_id and g.profile_id = auth.uid()
    )
  );

-- Receipts policy
create policy "Admins and Bursars full access on receipts" on receipts
  for all using (
    exists (
      select 1 from profiles where id = auth.uid() and role in ('super_admin', 'bursar')
    )
  );

create policy "Parents can view receipts for their payments" on receipts
  for select using (
    exists (
      select 1 from payments p
      join students s on p.student_id = s.id
      join guardians g on s.guardian_id = g.id
      where p.id = receipts.payment_id and g.profile_id = auth.uid()
    )
  );
