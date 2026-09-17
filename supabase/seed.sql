-- Seed Data for Smart School Fees System
-- Solid Foundation Comprehensive High School

-- 1. Insert Academic Sessions & Terms
insert into session_terms (id, session, term, is_current) values
  ('a0000000-0000-0000-0000-000000000001', '2025/2026', 'First', true),
  ('a0000000-0000-0000-0000-000000000002', '2025/2026', 'Second', false),
  ('a0000000-0000-0000-0000-000000000003', '2024/2025', 'Third', false)
on conflict (id) do nothing;

-- 2. Insert Classes
insert into classes (id, name, arm) values
  ('b0000000-0000-0000-0000-000000000001', 'JSS 1', 'A'),
  ('b0000000-0000-0000-0000-000000000002', 'JSS 1', 'B'),
  ('b0000000-0000-0000-0000-000000000003', 'JSS 2', 'A'),
  ('b0000000-0000-0000-0000-000000000004', 'JSS 2', 'B'),
  ('b0000000-0000-0000-0000-000000000005', 'JSS 3', 'A'),
  ('b0000000-0000-0000-0000-000000000006', 'JSS 3', 'B'),
  ('b0000000-0000-0000-0000-000000000007', 'SS 1', 'General'),
  ('b0000000-0000-0000-0000-000000000008', 'SS 2', 'Science'),
  ('b0000000-0000-0000-0000-000000000009', 'SS 2', 'Arts'),
  ('b0000000-0000-0000-0000-000000000010', 'SS 2', 'Social Science'),
  ('b0000000-0000-0000-0000-000000000011', 'SS 3', 'Science'),
  ('b0000000-0000-0000-0000-000000000012', 'SS 3', 'Arts'),
  ('b0000000-0000-0000-0000-000000000013', 'SS 3', 'Social Science')
on conflict (id) do nothing;

-- 3. Insert Fee Structures for JSS 1 (Term 1)
insert into fee_structures (class_id, session_term_id, fee_item, amount, is_compulsory) values
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Tuition Fee', 85000, true),
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Development Levy', 20000, true),
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'PTA Levy', 10000, true),
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Computer / ICT Lab Fee', 10000, true),
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Examination Fee', 8000, true),
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Sports & Games Levy', 5000, false);

-- 4. Sample Guardians
insert into guardians (id, full_name, phone, email, relationship) values
  ('c0000000-0000-0000-0000-000000000001', 'Engr. Patrick Chukwuma', '08023456789', 'patrick.chukwuma@gmail.com', 'Father'),
  ('c0000000-0000-0000-0000-000000000002', 'Dr. (Mrs.) Folake Adebayo', '08061122334', 'folake.adebayo@yahoo.com', 'Mother')
on conflict (id) do nothing;

-- 5. Sample Students
insert into students (id, admission_no, full_name, class_id, guardian_id, status) values
  ('d0000000-0000-0000-0000-000000000001', 'SFHS/2026/001', 'David Chukwuma', 'b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'active'),
  ('d0000000-0000-0000-0000-000000000002', 'SFHS/2026/002', 'Tobi Adebayo', 'b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'active')
on conflict (id) do nothing;

-- 6. Trigger to automatically create a public profile when a user signs up in auth.users
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'parent'),
    new.raw_user_meta_data->>'phone'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Attach trigger to auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
