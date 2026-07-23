export type UserRole = 'super_admin' | 'bursar' | 'parent' | 'student';
export type PaymentMethod = 'paystack' | 'bank_transfer' | 'card' | 'ussd' | 'bank_account';
export type PaymentStatus = 'pending' | 'success' | 'failed';
export type StudentStatus = 'active' | 'graduated' | 'withdrawn';
export type AcademicTerm = 'First' | 'Second' | 'Third';

export interface SchoolInfo {
  name: string;
  motto: string;
  address: string;
  logo: string;
  phone: string;
  email: string;
}

export interface Profile {
  id: string;
  full_name: string;
  role: UserRole;
  phone?: string;
  email?: string;
  admission_no?: string;
  password?: string;
  created_at?: string;
}

export interface SchoolClass {
  id: string;
  name: string; // e.g. 'JSS1', 'SS2'
  arm?: string; // e.g. 'A', 'B', 'Science'
  created_at?: string;
}

export interface SessionTerm {
  id: string;
  session: string; // e.g. '2025/2026'
  term: AcademicTerm;
  is_current: boolean;
  created_at?: string;
}

export interface Guardian {
  id: string;
  profile_id?: string;
  full_name: string;
  phone?: string;
  email?: string;
  relationship?: string;
  created_at?: string;
}

export interface Student {
  id: string;
  admission_no: string;
  full_name: string;
  class_id: string;
  guardian_id: string;
  status: StudentStatus;
  photo_url?: string;
  created_at?: string;
  // Joined properties
  school_class?: SchoolClass;
  guardian?: Guardian;
}

export interface FeeStructure {
  id: string;
  class_id: string;
  session_term_id: string;
  fee_item: string;
  amount: number;
  is_compulsory: boolean;
  created_at?: string;
  // Joined properties
  school_class?: SchoolClass;
  session_term?: SessionTerm;
}

export interface Payment {
  id: string;
  student_id: string;
  fee_structure_id?: string;
  amount: number;
  method: PaymentMethod;
  reference: string;
  status: PaymentStatus;
  recorded_by?: string;
  paid_at: string;
  // Joined properties
  student?: Student;
  fee_structure?: FeeStructure;
  recorder?: Profile;
}

export interface Receipt {
  id: string;
  payment_id: string;
  receipt_no: string;
  pdf_url?: string;
  issued_at: string;
  // Joined properties
  payment?: Payment;
}

export interface StudentFeeSummary {
  student: Student;
  session_term: SessionTerm;
  total_fees_due: number;
  total_paid: number;
  balance_owed: number;
  fee_breakdown: {
    fee_structure: FeeStructure;
    paid_amount: number;
    balance: number;
  }[];
  payments_history: Payment[];
}

export interface SystemNotification {
  id: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
  type: 'payment' | 'billing' | 'system';
}

export interface SystemMessage {
  id: string;
  sender: string;
  subject: string;
  preview: string;
  time: string;
  read: boolean;
}
