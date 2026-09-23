-- ==============================================================================
-- SOLID FOUNDATION HIGH SCHOOL: DEFINITIVE CLOUD DATABASE FIX & REALTIME SYNC
-- Run this script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/vufmlngnsrtyaaalnqor/sql/new
-- ==============================================================================

-- 1. DROP EXISTING TABLES & CONSTRAINTS CLEANLY
-- Drops old tables with UUID columns and dummy seed data
DROP TABLE IF EXISTS receipts CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS fee_structures CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS guardians CASCADE;
DROP TABLE IF EXISTS session_terms CASCADE;
DROP TABLE IF EXISTS classes CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- 2. CREATE CLEAN TABLES WITH TEXT PRIMARY KEYS & COMPATIBLE STRING IDs
CREATE TABLE classes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  arm TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE session_terms (
  id TEXT PRIMARY KEY,
  session TEXT NOT NULL,
  term TEXT NOT NULL,
  is_current BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE guardians (
  id TEXT PRIMARY KEY,
  profile_id TEXT,
  full_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  relationship TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE students (
  id TEXT PRIMARY KEY,
  admission_no TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  class_id TEXT,
  guardian_id TEXT,
  status TEXT DEFAULT 'active',
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE fee_structures (
  id TEXT PRIMARY KEY,
  class_id TEXT,
  session_term_id TEXT,
  fee_item TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  is_compulsory BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE payments (
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

CREATE TABLE receipts (
  id TEXT PRIMARY KEY,
  payment_id TEXT NOT NULL,
  receipt_no TEXT UNIQUE NOT NULL,
  pdf_url TEXT,
  issued_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE profiles (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  admission_no TEXT,
  password TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PERMISSIVE ROW LEVEL SECURITY POLICIES (ALLOW ANON CLIENT READ & WRITE)
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

-- 4. ENABLE REALTIME WEBSOCKET BROADCASTING ACROSS ALL DEVICES
DO $$
BEGIN
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE students; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE guardians; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE payments; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE receipts; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE classes; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE session_terms; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE fee_structures; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE profiles; EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;

ALTER TABLE students REPLICA IDENTITY FULL;
ALTER TABLE guardians REPLICA IDENTITY FULL;
ALTER TABLE payments REPLICA IDENTITY FULL;
ALTER TABLE receipts REPLICA IDENTITY FULL;
ALTER TABLE classes REPLICA IDENTITY FULL;
ALTER TABLE session_terms REPLICA IDENTITY FULL;
ALTER TABLE fee_structures REPLICA IDENTITY FULL;
ALTER TABLE profiles REPLICA IDENTITY FULL;
