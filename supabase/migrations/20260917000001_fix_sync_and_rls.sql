-- ==============================================================================
-- SOLID FOUNDATION HIGH SCHOOL: SUPABASE REALTIME & CROSS-DEVICE SYNC MIGRATION
-- Run this script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/vufmlngnsrtyaaalnqor/sql/new
-- ==============================================================================

-- 1. DROP RECURSIVE & RESTRICTIVE POLICIES
-- Dropping all existing policies that cause the '42P17 infinite recursion' error
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Admins and Bursars can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Anyone authenticated can view classes" ON classes;
DROP POLICY IF EXISTS "Admins and Bursars can modify classes" ON classes;
DROP POLICY IF EXISTS "Anyone authenticated can view session_terms" ON session_terms;
DROP POLICY IF EXISTS "Admins and Bursars can modify session_terms" ON session_terms;
DROP POLICY IF EXISTS "Admins and Bursars full access on guardians" ON guardians;
DROP POLICY IF EXISTS "Parents can view own guardian profile" ON guardians;
DROP POLICY IF EXISTS "Admins and Bursars full access on students" ON students;
DROP POLICY IF EXISTS "Parents can view their linked wards" ON students;
DROP POLICY IF EXISTS "Anyone authenticated can view fee_structures" ON fee_structures;
DROP POLICY IF EXISTS "Admins and Bursars can modify fee_structures" ON fee_structures;
DROP POLICY IF EXISTS "Admins and Bursars full access on payments" ON payments;
DROP POLICY IF EXISTS "Parents can view payments for their wards" ON payments;
DROP POLICY IF EXISTS "Parents can insert payment transactions for their wards" ON payments;
DROP POLICY IF EXISTS "Admins and Bursars full access on receipts" ON receipts;
DROP POLICY IF EXISTS "Parents can view receipts for their payments" ON receipts;

-- 2. CREATE CLEAN TABLES (TEXT PRIMARY KEYS FOR COMPATIBILITY WITH WEB CLIENT STRINGS & UUIDs)
CREATE TABLE IF NOT EXISTS classes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  arm TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS session_terms (
  id TEXT PRIMARY KEY,
  session TEXT NOT NULL,
  term TEXT NOT NULL,
  is_current BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS guardians (
  id TEXT PRIMARY KEY,
  profile_id TEXT,
  full_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  relationship TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS students (
  id TEXT PRIMARY KEY,
  admission_no TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  class_id TEXT,
  guardian_id TEXT,
  status TEXT DEFAULT 'active',
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fee_structures (
  id TEXT PRIMARY KEY,
  class_id TEXT,
  session_term_id TEXT,
  fee_item TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  is_compulsory BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  fee_structure_id TEXT,
  amount NUMERIC NOT NULL,
  method TEXT NOT NULL,
  reference TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'success',
  recorded_by TEXT,
  paid_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS receipts (
  id TEXT PRIMARY KEY,
  payment_id TEXT NOT NULL,
  receipt_no TEXT UNIQUE NOT NULL,
  pdf_url TEXT,
  issued_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  admission_no TEXT,
  password TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- If tables previously had UUID id columns, alter them to text to support client text IDs
DO $$
BEGIN
  -- Convert IDs to TEXT if they were created as UUID
  ALTER TABLE classes ALTER COLUMN id TYPE TEXT;
  ALTER TABLE session_terms ALTER COLUMN id TYPE TEXT;
  ALTER TABLE guardians ALTER COLUMN id TYPE TEXT;
  ALTER TABLE guardians ALTER COLUMN profile_id TYPE TEXT;
  ALTER TABLE students ALTER COLUMN id TYPE TEXT;
  ALTER TABLE students ALTER COLUMN class_id TYPE TEXT;
  ALTER TABLE students ALTER COLUMN guardian_id TYPE TEXT;
  ALTER TABLE fee_structures ALTER COLUMN id TYPE TEXT;
  ALTER TABLE fee_structures ALTER COLUMN class_id TYPE TEXT;
  ALTER TABLE fee_structures ALTER COLUMN session_term_id TYPE TEXT;
  ALTER TABLE payments ALTER COLUMN id TYPE TEXT;
  ALTER TABLE payments ALTER COLUMN student_id TYPE TEXT;
  ALTER TABLE payments ALTER COLUMN fee_structure_id TYPE TEXT;
  ALTER TABLE payments ALTER COLUMN recorded_by TYPE TEXT;
  ALTER TABLE receipts ALTER COLUMN id TYPE TEXT;
  ALTER TABLE receipts ALTER COLUMN payment_id TYPE TEXT;
  ALTER TABLE profiles ALTER COLUMN id TYPE TEXT;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- 3. PERMISSIVE POLICIES (ALLOW ANON CLIENT TO READ, WRITE, AND SYNC ACROSS ALL COMPUTERS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE guardians ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE fee_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon read/write profiles" ON profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon read/write classes" ON classes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon read/write session_terms" ON session_terms FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon read/write guardians" ON guardians FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon read/write students" ON students FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon read/write fee_structures" ON fee_structures FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon read/write payments" ON payments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon read/write receipts" ON receipts FOR ALL USING (true) WITH CHECK (true);

-- 4. ENABLE REALTIME BROADCASTING ACROSS ALL COMPUTERS
-- Ensures Supabase WebSocket pushes instant notifications whenever Bursar, Admin, or Parent creates/updates records
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE students;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE guardians;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE payments;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE receipts;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE classes;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE session_terms;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE fee_structures;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;

-- Ensure replica identity full is on for all tables so realtime payloads contain full records
ALTER TABLE students REPLICA IDENTITY FULL;
ALTER TABLE guardians REPLICA IDENTITY FULL;
ALTER TABLE payments REPLICA IDENTITY FULL;
ALTER TABLE receipts REPLICA IDENTITY FULL;
ALTER TABLE classes REPLICA IDENTITY FULL;
ALTER TABLE session_terms REPLICA IDENTITY FULL;
ALTER TABLE fee_structures REPLICA IDENTITY FULL;
ALTER TABLE profiles REPLICA IDENTITY FULL;
