import { SchoolInfo, Profile, SchoolClass, SessionTerm, Guardian, Student, FeeStructure, Payment, Receipt } from '../types/database';

export const SCHOOL_INFO: SchoolInfo = {
  name: "Solid Foundation Comprehensive High School",
  motto: "Knowledge is Wealth",
  address: "Ishikpe Quarters, Issele-Uku, Along Onicha-Uku Road, Delta State, Nigeria",
  logo: "/logo.png",
  phone: "+234 803 123 4567",
  email: "bursary@solidfoundationhigh.edu.ng"
};

export const INITIAL_PROFILES: Profile[] = [
  {
    id: "p-admin-1",
    full_name: "Dr. Emmanuel Okonkwo",
    role: "super_admin",
    phone: "08031234567",
    email: "admin@solidfoundationhigh.edu.ng",
    password: "password123"
  },
  {
    id: "p-bursar-1",
    full_name: "Mrs. Grace Nwosu",
    role: "bursar",
    phone: "08059876543",
    email: "bursary@solidfoundationhigh.edu.ng",
    password: "password123"
  },
  {
    id: "p-parent-1",
    full_name: "Engr. Patrick Chukwuma",
    role: "parent",
    phone: "08023456789",
    email: "patrick.chukwuma@gmail.com",
    password: "parent123"
  },
  {
    id: "p-parent-2",
    full_name: "Dr. (Mrs.) Folake Adebayo",
    role: "parent",
    phone: "08061122334",
    email: "folake.adebayo@yahoo.com",
    password: "parent123"
  },
  {
    id: "p-student-1",
    full_name: "Chukwuma David Kenechukwu",
    role: "student",
    phone: "08011112222",
    admission_no: "SFHS/2026/001",
    email: "david.chukwuma@student.sfhs.edu.ng",
    password: "student123"
  }
];

export const INITIAL_CLASSES: SchoolClass[] = [
  { id: "c-jss1a", name: "JSS 1", arm: "A" },
  { id: "c-jss1b", name: "JSS 1", arm: "B" },
  { id: "c-jss2a", name: "JSS 2", arm: "A" },
  { id: "c-jss2b", name: "JSS 2", arm: "B" },
  { id: "c-jss3a", name: "JSS 3", arm: "A" },
  { id: "c-jss3b", name: "JSS 3", arm: "B" },
  { id: "c-ss1", name: "SS 1", arm: "General" },
  { id: "c-ss2-sci", name: "SS 2", arm: "Science" },
  { id: "c-ss2-art", name: "SS 2", arm: "Arts" },
  { id: "c-ss2-soc", name: "SS 2", arm: "Social Science" },
  { id: "c-ss3-sci", name: "SS 3", arm: "Science" },
  { id: "c-ss3-art", name: "SS 3", arm: "Arts" },
  { id: "c-ss3-soc", name: "SS 3", arm: "Social Science" }
];

export const INITIAL_SESSIONS: SessionTerm[] = [
  { id: "st-2025-1", session: "2025/2026", term: "First", is_current: true },
  { id: "st-2025-2", session: "2025/2026", term: "Second", is_current: false },
  { id: "st-2024-3", session: "2024/2025", term: "Third", is_current: false }
];

// Helper data for generating 94 guardians and 150 students
const GUARDIAN_FIRST_NAMES = [
  "Patrick", "Folake", "Anthony", "Bello", "Nkechi", "Emeka", "Amina", "Chinedu", "Funke", "Ibrahim",
  "Grace", "Olawale", "Chinwe", "Kabir", "Ngozi", "Tunde", "Uche", "Yusuf", "Funmi", "Chukwudi",
  "Fatima", "Efe", "Ifeoma", "Bamidele", "Kehinde", "Taiwo", "Solomon", "Blessing", "Joy", "David",
  "Suleiman", "Adewale", "Chioma", "Kazeem", "Yetunde", "Kingsley", "Osas", "Damilola", "Zainab", "Obinna"
];

const LAST_NAMES = [
  "Chukwuma", "Adebayo", "Ezenwa", "Abubakar", "Okafor", "Okonkwo", "Nwosu", "Egwu", "Balogun", "Ogbonna",
  "Bello", "Usman", "Eze", "Obinna", "Kalu", "Afolabi", "Onuoha", "Nnamdi", "Danladi", "Adewale",
  "Olawale", "Salami", "Sanusi", "Popoola", "Adeyemi", "Ajayi", "Oyeleke", "Lawal", "Musa", "Garba"
];

const STUDENT_FIRST_NAMES = [
  "Chukwuma", "Blessing", "Tobi", "Victor", "Chisom", "Emeka", "Fatima", "Zainab", 
  "Amina", "Damilola", "Emmanuel", "Precious", "Kenshiro", "Somtochukwu", "Kenechukwu", 
  "Uchenna", "Ifeanyi", "Miracle", "Divine", "Joshua", "Samuel", "Gideon", "Patience",
  "Chidimma", "Tochukwu", "Ebuka", "Favour", "Goodness", "Kamsi", "Kosi"
];

const TITLES = ["Engr.", "Dr.", "Chief", "Alhaji", "Mrs.", "Mr.", "Pastor", "Dr. (Mrs.)"];
const RELATIONSHIPS = ["Father", "Mother", "Guardian", "Father", "Mother"];

function generateGuardians(): Guardian[] {
  const guardians: Guardian[] = [];

  // Guardian 1 and 2 mapped to demo accounts
  guardians.push({
    id: "g-1",
    profile_id: "p-parent-1",
    full_name: "Engr. Patrick Chukwuma",
    phone: "08023456789",
    email: "patrick.chukwuma@gmail.com",
    relationship: "Father"
  });

  guardians.push({
    id: "g-2",
    profile_id: "p-parent-2",
    full_name: "Dr. (Mrs.) Folake Adebayo",
    phone: "08061122334",
    email: "folake.adebayo@yahoo.com",
    relationship: "Mother"
  });

  for (let i = 3; i <= 94; i++) {
    const title = TITLES[i % TITLES.length];
    const firstName = GUARDIAN_FIRST_NAMES[i % GUARDIAN_FIRST_NAMES.length];
    const lastName = LAST_NAMES[i % LAST_NAMES.length];
    const relationship = RELATIONSHIPS[i % RELATIONSHIPS.length];
    const phone = `080${String(10000000 + i * 137).slice(0, 8)}`;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@gmail.com`;

    guardians.push({
      id: `g-${i}`,
      full_name: `${title} ${firstName} ${lastName}`,
      phone,
      email,
      relationship
    });
  }

  return guardians;
}

export const INITIAL_GUARDIANS: Guardian[] = generateGuardians();

// Fee structures for all 13 class levels
export const INITIAL_FEE_STRUCTURES: FeeStructure[] = [
  // JSS 1A & JSS 1B
  { id: "fs-jss1a-1", class_id: "c-jss1a", session_term_id: "st-2025-1", fee_item: "Tuition Fee", amount: 65000, is_compulsory: true },
  { id: "fs-jss1a-2", class_id: "c-jss1a", session_term_id: "st-2025-1", fee_item: "Development Levy", amount: 15000, is_compulsory: true },
  { id: "fs-jss1a-3", class_id: "c-jss1a", session_term_id: "st-2025-1", fee_item: "PTA Levy", amount: 5000, is_compulsory: true },
  { id: "fs-jss1a-4", class_id: "c-jss1a", session_term_id: "st-2025-1", fee_item: "Exam & ICT Fee", amount: 8000, is_compulsory: true },

  { id: "fs-jss1b-1", class_id: "c-jss1b", session_term_id: "st-2025-1", fee_item: "Tuition Fee", amount: 65000, is_compulsory: true },
  { id: "fs-jss1b-2", class_id: "c-jss1b", session_term_id: "st-2025-1", fee_item: "Development Levy", amount: 15000, is_compulsory: true },
  { id: "fs-jss1b-3", class_id: "c-jss1b", session_term_id: "st-2025-1", fee_item: "PTA Levy", amount: 5000, is_compulsory: true },
  { id: "fs-jss1b-4", class_id: "c-jss1b", session_term_id: "st-2025-1", fee_item: "Exam & ICT Fee", amount: 8000, is_compulsory: true },

  // JSS 2A & JSS 2B
  { id: "fs-jss2a-1", class_id: "c-jss2a", session_term_id: "st-2025-1", fee_item: "Tuition Fee", amount: 68000, is_compulsory: true },
  { id: "fs-jss2a-2", class_id: "c-jss2a", session_term_id: "st-2025-1", fee_item: "Development Levy", amount: 15000, is_compulsory: true },
  { id: "fs-jss2a-3", class_id: "c-jss2a", session_term_id: "st-2025-1", fee_item: "PTA Levy", amount: 5000, is_compulsory: true },

  { id: "fs-jss2b-1", class_id: "c-jss2b", session_term_id: "st-2025-1", fee_item: "Tuition Fee", amount: 68000, is_compulsory: true },
  { id: "fs-jss2b-2", class_id: "c-jss2b", session_term_id: "st-2025-1", fee_item: "Development Levy", amount: 15000, is_compulsory: true },
  { id: "fs-jss2b-3", class_id: "c-jss2b", session_term_id: "st-2025-1", fee_item: "PTA Levy", amount: 5000, is_compulsory: true },

  // JSS 3A & JSS 3B
  { id: "fs-jss3a-1", class_id: "c-jss3a", session_term_id: "st-2025-1", fee_item: "Tuition Fee", amount: 70000, is_compulsory: true },
  { id: "fs-jss3a-2", class_id: "c-jss3a", session_term_id: "st-2025-1", fee_item: "Development Levy", amount: 15000, is_compulsory: true },
  { id: "fs-jss3a-3", class_id: "c-jss3a", session_term_id: "st-2025-1", fee_item: "BECE Registration Fee", amount: 25000, is_compulsory: true },
  { id: "fs-jss3a-4", class_id: "c-jss3a", session_term_id: "st-2025-1", fee_item: "PTA Levy", amount: 5000, is_compulsory: true },

  { id: "fs-jss3b-1", class_id: "c-jss3b", session_term_id: "st-2025-1", fee_item: "Tuition Fee", amount: 70000, is_compulsory: true },
  { id: "fs-jss3b-2", class_id: "c-jss3b", session_term_id: "st-2025-1", fee_item: "Development Levy", amount: 15000, is_compulsory: true },
  { id: "fs-jss3b-3", class_id: "c-jss3b", session_term_id: "st-2025-1", fee_item: "BECE Registration Fee", amount: 25000, is_compulsory: true },
  { id: "fs-jss3b-4", class_id: "c-jss3b", session_term_id: "st-2025-1", fee_item: "PTA Levy", amount: 5000, is_compulsory: true },

  // SS 1 General
  { id: "fs-ss1-1", class_id: "c-ss1", session_term_id: "st-2025-1", fee_item: "Tuition Fee", amount: 75000, is_compulsory: true },
  { id: "fs-ss1-2", class_id: "c-ss1", session_term_id: "st-2025-1", fee_item: "Science & Arts Intro Levy", amount: 10000, is_compulsory: true },
  { id: "fs-ss1-3", class_id: "c-ss1", session_term_id: "st-2025-1", fee_item: "Development Levy", amount: 15000, is_compulsory: true },
  { id: "fs-ss1-4", class_id: "c-ss1", session_term_id: "st-2025-1", fee_item: "PTA Levy", amount: 5000, is_compulsory: true },

  // SS 2 Specializations
  { id: "fs-ss2sci-1", class_id: "c-ss2-sci", session_term_id: "st-2025-1", fee_item: "Tuition Fee", amount: 78000, is_compulsory: true },
  { id: "fs-ss2sci-2", class_id: "c-ss2-sci", session_term_id: "st-2025-1", fee_item: "Science Lab Practical Levy", amount: 12000, is_compulsory: true },
  { id: "fs-ss2sci-3", class_id: "c-ss2-sci", session_term_id: "st-2025-1", fee_item: "Development Levy", amount: 15000, is_compulsory: true },

  { id: "fs-ss2art-1", class_id: "c-ss2-art", session_term_id: "st-2025-1", fee_item: "Tuition Fee", amount: 78000, is_compulsory: true },
  { id: "fs-ss2art-2", class_id: "c-ss2-art", session_term_id: "st-2025-1", fee_item: "Arts Studio Practical Levy", amount: 10000, is_compulsory: true },
  { id: "fs-ss2art-3", class_id: "c-ss2-art", session_term_id: "st-2025-1", fee_item: "Development Levy", amount: 15000, is_compulsory: true },

  { id: "fs-ss2soc-1", class_id: "c-ss2-soc", session_term_id: "st-2025-1", fee_item: "Tuition Fee", amount: 78000, is_compulsory: true },
  { id: "fs-ss2soc-2", class_id: "c-ss2-soc", session_term_id: "st-2025-1", fee_item: "Social Science ICT Levy", amount: 10000, is_compulsory: true },
  { id: "fs-ss2soc-3", class_id: "c-ss2-soc", session_term_id: "st-2025-1", fee_item: "Development Levy", amount: 15000, is_compulsory: true },

  // SS 3 Specializations
  { id: "fs-ss3sci-1", class_id: "c-ss3-sci", session_term_id: "st-2025-1", fee_item: "Tuition Fee", amount: 85000, is_compulsory: true },
  { id: "fs-ss3sci-2", class_id: "c-ss3-sci", session_term_id: "st-2025-1", fee_item: "WAEC / NECO Admin Fee", amount: 45000, is_compulsory: true },
  { id: "fs-ss3sci-3", class_id: "c-ss3-sci", session_term_id: "st-2025-1", fee_item: "Science Lab Practical Levy", amount: 12000, is_compulsory: true },

  { id: "fs-ss3art-1", class_id: "c-ss3-art", session_term_id: "st-2025-1", fee_item: "Tuition Fee", amount: 85000, is_compulsory: true },
  { id: "fs-ss3art-2", class_id: "c-ss3-art", session_term_id: "st-2025-1", fee_item: "WAEC / NECO Admin Fee", amount: 45000, is_compulsory: true },
  { id: "fs-ss3art-3", class_id: "c-ss3-art", session_term_id: "st-2025-1", fee_item: "Arts Studio Practical Levy", amount: 10000, is_compulsory: true },

  { id: "fs-ss3soc-1", class_id: "c-ss3-soc", session_term_id: "st-2025-1", fee_item: "Tuition Fee", amount: 85000, is_compulsory: true },
  { id: "fs-ss3soc-2", class_id: "c-ss3-soc", session_term_id: "st-2025-1", fee_item: "WAEC / NECO Admin Fee", amount: 45000, is_compulsory: true },
  { id: "fs-ss3soc-3", class_id: "c-ss3-soc", session_term_id: "st-2025-1", fee_item: "Social Science ICT Levy", amount: 10000, is_compulsory: true }
];

function generateStudentsAndPayments(): { students: Student[]; payments: Payment[]; receipts: Receipt[] } {
  const studentsList: Student[] = [];
  const paymentsList: Payment[] = [];
  const receiptsList: Receipt[] = [];

  // Build exact 150 guardian ward assignments:
  // 50 parents with 1 child each = 50 wards (g-1 to g-50)
  // 38 parents with 2 children each = 76 wards (g-51 to g-88)
  // 6 parents with 4 children each = 24 wards (g-89 to g-94)
  // Total = 150 wards
  const wardAssignments: string[] = [];

  for (let g = 1; g <= 50; g++) {
    wardAssignments.push(`g-${g}`);
  }
  for (let g = 51; g <= 88; g++) {
    wardAssignments.push(`g-${g}`);
    wardAssignments.push(`g-${g}`);
  }
  for (let g = 89; g <= 94; g++) {
    wardAssignments.push(`g-${g}`);
    wardAssignments.push(`g-${g}`);
    wardAssignments.push(`g-${g}`);
    wardAssignments.push(`g-${g}`);
  }

  // Interleave ward assignments across the 13 classes
  const interleavedAssignments: string[] = new Array(150);
  for (let i = 0; i < 150; i++) {
    const targetIdx = (i * 23) % 150;
    if (!interleavedAssignments[targetIdx]) {
      interleavedAssignments[targetIdx] = wardAssignments[i];
    } else {
      let next = (targetIdx + 1) % 150;
      while (interleavedAssignments[next]) {
        next = (next + 1) % 150;
      }
      interleavedAssignments[next] = wardAssignments[i];
    }
  }

  // Distribution of 150 students across 13 classes (sizes sum to 150)
  const classSizes = [12, 12, 12, 12, 11, 11, 11, 11, 12, 12, 12, 11, 11];

  let studentGlobalCounter = 0;
  let paymentCounter = 3000;
  let receiptCounter = 800;

  INITIAL_CLASSES.forEach((cls, classIdx) => {
    const numStudentsInClass = classSizes[classIdx];

    for (let i = 1; i <= numStudentsInClass; i++) {
      const currentStudentIndex = studentGlobalCounter;
      studentGlobalCounter++;

      const guardianId = interleavedAssignments[currentStudentIndex];
      const guardianObj = INITIAL_GUARDIANS.find(g => g.id === guardianId);

      let surname = "Chukwuma";
      if (guardianObj) {
        const parts = guardianObj.full_name.split(' ');
        surname = parts[parts.length - 1];
      }

      const firstName = STUDENT_FIRST_NAMES[studentGlobalCounter % STUDENT_FIRST_NAMES.length];
      const admissionNo = `SFHS/2026/${String(studentGlobalCounter).padStart(3, '0')}`;
      const studentId = `s-${1000 + studentGlobalCounter}`;

      const student: Student = {
        id: studentId,
        admission_no: admissionNo,
        full_name: `${surname} ${firstName}`,
        class_id: cls.id,
        guardian_id: guardianId,
        status: "active"
      };

      studentsList.push(student);

      // Generate payment history for ~65% of students
      if (currentStudentIndex % 3 !== 0) {
        paymentCounter++;
        receiptCounter++;
        const payAmount = (currentStudentIndex % 2 === 0) ? 50000 : 93000;
        const payId = `pay-${paymentCounter}`;
        const ref = currentStudentIndex % 2 === 0 
          ? `PAYSK-2026-${1000000 + paymentCounter}` 
          : `TRF-${100000 + paymentCounter}`;

        const payment: Payment = {
          id: payId,
          student_id: studentId,
          amount: payAmount,
          method: currentStudentIndex % 2 === 0 ? 'paystack' : 'bank_transfer',
          reference: ref,
          status: 'success',
          recorded_by: currentStudentIndex % 2 !== 0 ? 'p-bursar-1' : undefined,
          paid_at: new Date(2026, 6, Math.max(1, 22 - (currentStudentIndex % 18))).toISOString()
        };

        const receipt: Receipt = {
          id: `rec-${receiptCounter}`,
          payment_id: payId,
          receipt_no: `REC-SFHS-2026-${String(receiptCounter).padStart(4, '0')}`,
          issued_at: payment.paid_at
        };

        paymentsList.push(payment);
        receiptsList.push(receipt);
      }
    }
  });

  return { students: studentsList, payments: paymentsList, receipts: receiptsList };
}

const generatedData = generateStudentsAndPayments();

export const INITIAL_STUDENTS: Student[] = generatedData.students;
export const INITIAL_PAYMENTS: Payment[] = generatedData.payments;
export const INITIAL_RECEIPTS: Receipt[] = generatedData.receipts;
