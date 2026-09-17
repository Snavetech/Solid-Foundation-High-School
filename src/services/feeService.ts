import {
  Profile, SchoolClass, SessionTerm, Guardian, Student,
  FeeStructure, Payment, Receipt, StudentFeeSummary, UserRole, PaymentMethod,
  SystemNotification, SystemMessage, SchoolInfo
} from '../types/database';
import {
  INITIAL_PROFILES, INITIAL_CLASSES, INITIAL_SESSIONS, INITIAL_GUARDIANS,
  INITIAL_STUDENTS, INITIAL_FEE_STRUCTURES, INITIAL_PAYMENTS, INITIAL_RECEIPTS,
  SCHOOL_INFO
} from './mockData';

// Local storage keys
const STORAGE_KEYS = {
  PROFILES: 'sfhs_profiles_v5',
  CLASSES: 'sfhs_classes_v5',
  SESSIONS: 'sfhs_sessions_v5',
  GUARDIANS: 'sfhs_guardians_v5',
  STUDENTS: 'sfhs_students_v5',
  FEE_STRUCTURES: 'sfhs_fee_structures_v5',
  PAYMENTS: 'sfhs_payments_v5',
  RECEIPTS: 'sfhs_receipts_v5',
  CURRENT_USER: 'sfhs_current_user_v5',
  NOTIFICATIONS: 'sfhs_notifications_v5',
  MESSAGES: 'sfhs_messages_v5',
  SCHOOL_INFO: 'sfhs_school_info_v5'
};

// Storage helper
function loadStorage<T>(key: string, initialData: T): T {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : initialData;
  } catch (e) {
    console.error(`Failed to load ${key}`, e);
    return initialData;
  }
}

function saveStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Failed to save ${key}`, e);
  }
}

const INITIAL_NOTIFICATIONS: SystemNotification[] = [
  {
    id: 'n-1',
    title: '2025/2026 First Term Billing Live',
    body: 'Academic term fee structures published by Bursary.',
    time: '1 hour ago',
    read: false,
    type: 'billing'
  },
  {
    id: 'n-2',
    title: 'Paystack Gateway Active',
    body: 'Parents can now pay online using Card, Bank Transfer, USSD & Bank Account.',
    time: '3 hours ago',
    read: false,
    type: 'system'
  }
];

const INITIAL_MESSAGES: SystemMessage[] = [
  {
    id: 'm-1',
    sender: 'Bursary Department',
    subject: 'First Term Fees Payment Advisory',
    preview: 'Please ensure fee installments are completed before the mid-term break.',
    time: '2 hours ago',
    read: false
  },
  {
    id: 'm-2',
    sender: 'School Administration',
    subject: 'Welcome to SFHS Smart Portal',
    preview: 'Official digital portal for student fee tracking and instant receipts.',
    time: 'Yesterday',
    read: false
  }
];

class FeeService {
  private profiles: Profile[];
  private classes: SchoolClass[];
  private sessions: SessionTerm[];
  private guardians: Guardian[];
  private students: Student[];
  private feeStructures: FeeStructure[];
  private payments: Payment[];
  private receipts: Receipt[];
  private notifications: SystemNotification[];
  private messages: SystemMessage[];
  private currentUser: Profile | null;

  constructor() {
    this.profiles = loadStorage(STORAGE_KEYS.PROFILES, INITIAL_PROFILES);
    this.classes = loadStorage(STORAGE_KEYS.CLASSES, INITIAL_CLASSES);
    this.sessions = loadStorage(STORAGE_KEYS.SESSIONS, INITIAL_SESSIONS);
    this.guardians = loadStorage(STORAGE_KEYS.GUARDIANS, INITIAL_GUARDIANS);
    this.students = loadStorage(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
    this.feeStructures = loadStorage(STORAGE_KEYS.FEE_STRUCTURES, INITIAL_FEE_STRUCTURES);
    this.payments = loadStorage(STORAGE_KEYS.PAYMENTS, INITIAL_PAYMENTS);
    this.receipts = loadStorage(STORAGE_KEYS.RECEIPTS, INITIAL_RECEIPTS);
    this.notifications = loadStorage(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    this.messages = loadStorage(STORAGE_KEYS.MESSAGES, INITIAL_MESSAGES);
    this.currentUser = loadStorage<Profile | null>(STORAGE_KEYS.CURRENT_USER, null);

    // Save initial load
    this.persistAll();
  }

  private persistAll() {
    saveStorage(STORAGE_KEYS.PROFILES, this.profiles);
    saveStorage(STORAGE_KEYS.CLASSES, this.classes);
    saveStorage(STORAGE_KEYS.SESSIONS, this.sessions);
    saveStorage(STORAGE_KEYS.GUARDIANS, this.guardians);
    saveStorage(STORAGE_KEYS.STUDENTS, this.students);
    saveStorage(STORAGE_KEYS.FEE_STRUCTURES, this.feeStructures);
    saveStorage(STORAGE_KEYS.PAYMENTS, this.payments);
    saveStorage(STORAGE_KEYS.RECEIPTS, this.receipts);
    saveStorage(STORAGE_KEYS.NOTIFICATIONS, this.notifications);
    saveStorage(STORAGE_KEYS.MESSAGES, this.messages);
    if (this.currentUser) {
      saveStorage(STORAGE_KEYS.CURRENT_USER, this.currentUser);
    } else {
      try {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      } catch (e) {}
    }
  }

  // --- AUTH & ROLE METHODS ---
  getCurrentUser(): Profile | null {
    return this.currentUser;
  }

  logout(): void {
    this.currentUser = null;
    try {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    } catch (e) {
      console.error('Failed to clear current user', e);
    }
  }

  getSchoolInfo(): SchoolInfo {
    return loadStorage(STORAGE_KEYS.SCHOOL_INFO, SCHOOL_INFO);
  }

  updateSchoolInfo(data: Partial<SchoolInfo>): SchoolInfo {
    const current = this.getSchoolInfo();
    const updated = { ...current, ...data };
    saveStorage(STORAGE_KEYS.SCHOOL_INFO, updated);
    return updated;
  }

  setActiveSessionTerm(id: string): void {
    this.sessions = this.sessions.map(s => ({
      ...s,
      is_current: s.id === id
    }));
    saveStorage(STORAGE_KEYS.SESSIONS, this.sessions);
  }

  voidPayment(paymentId: string): void {
    this.payments = this.payments.filter(p => p.id !== paymentId);
    this.receipts = this.receipts.filter(r => r.payment_id !== paymentId);
    saveStorage(STORAGE_KEYS.PAYMENTS, this.payments);
    saveStorage(STORAGE_KEYS.RECEIPTS, this.receipts);

    const newNotif: SystemNotification = {
      id: `n-${Date.now()}`,
      title: 'Payment Entry Voided',
      body: `A payment transaction (${paymentId}) was voided by Super Admin. Student balance has been updated.`,
      time: 'Just now',
      read: false,
      type: 'system'
    };
    this.notifications.unshift(newNotif);
    saveStorage(STORAGE_KEYS.NOTIFICATIONS, this.notifications);
  }

  exportSystemBackup(): string {
    const backupObj = {
      version: '1.0.0',
      exported_at: new Date().toISOString(),
      school_info: this.getSchoolInfo(),
      profiles: this.profiles,
      classes: this.classes,
      sessions: this.sessions,
      guardians: this.guardians,
      students: this.students,
      fee_structures: this.feeStructures,
      payments: this.payments,
      receipts: this.receipts
    };
    return JSON.stringify(backupObj, null, 2);
  }

  resetToFactoryDefaults(): void {
    localStorage.clear();
    window.location.reload();
  }

  getNotifications(): SystemNotification[] {
    return this.notifications;
  }

  getMessages(): SystemMessage[] {
    return this.messages;
  }

  markNotificationsRead(): void {
    this.notifications = this.notifications.map(n => ({ ...n, read: true }));
    saveStorage(STORAGE_KEYS.NOTIFICATIONS, this.notifications);
  }

  markMessagesRead(): void {
    this.messages = this.messages.map(m => ({ ...m, read: true }));
    saveStorage(STORAGE_KEYS.MESSAGES, this.messages);
  }

  getBursarProfile(): Profile {
    let bursar = this.profiles.find(p => p.role === 'bursar');
    if (!bursar) {
      bursar = {
        id: 'p-bursar-1',
        full_name: 'Mrs. Grace Nwosu',
        role: 'bursar',
        phone: '08059876543',
        email: 'bursary@solidfoundationhigh.edu.ng',
        password: 'password123'
      };
      this.profiles.push(bursar);
      saveStorage(STORAGE_KEYS.PROFILES, this.profiles);
    }
    return bursar;
  }

  updateBursarProfile(data: { full_name: string; email: string; phone?: string; password?: string }): { success: boolean; message: string; bursar: Profile } {
    const bursar = this.getBursarProfile();
    bursar.full_name = data.full_name.trim();
    bursar.email = data.email.trim();
    if (data.phone) bursar.phone = data.phone.trim();
    if (data.password && data.password.trim()) bursar.password = data.password.trim();

    saveStorage(STORAGE_KEYS.PROFILES, this.profiles);
    return { success: true, message: 'Bursar profile & login credentials successfully updated.', bursar };
  }

  authenticateUser(identifier: string, pass: string): { success: boolean; role: UserRole; profile: Profile; message?: string } {
    const trimmed = identifier.trim().toLowerCase();
    const cleanIdentifier = trimmed.replace(/[^a-z0-9]/g, '');

    // 1. Check by admission number (Student)
    const studentByAdm = this.students.find(s => {
      const sClean = s.admission_no.toLowerCase().replace(/[^a-z0-9]/g, '');
      return s.admission_no.toLowerCase() === trimmed || 
             sClean === cleanIdentifier ||
             (cleanIdentifier.length >= 3 && (sClean.endsWith(cleanIdentifier) || cleanIdentifier.endsWith(sClean)));
    });

    if (studentByAdm) {
      let studentProfile = this.profiles.find(p => p.role === 'student' && (p.admission_no === studentByAdm.admission_no || p.id === 'p-student-1'));
      if (!studentProfile) {
        studentProfile = {
          id: `p-std-${studentByAdm.id}`,
          full_name: studentByAdm.full_name,
          role: 'student',
          admission_no: studentByAdm.admission_no,
          password: 'student123'
        };
        this.profiles.push(studentProfile);
      } else {
        studentProfile.admission_no = studentByAdm.admission_no;
        studentProfile.full_name = studentByAdm.full_name;
      }
      this.currentUser = studentProfile;
      saveStorage(STORAGE_KEYS.CURRENT_USER, this.currentUser);
      saveStorage(STORAGE_KEYS.PROFILES, this.profiles);
      return { success: true, role: 'student', profile: this.currentUser };
    }

    // 2. Check by parent email (Parent)
    const guardianByEmail = this.guardians.find(g => g.email && g.email.toLowerCase() === trimmed);
    if (guardianByEmail) {
      let parentProfile = this.profiles.find(p => p.role === 'parent' && (p.email === guardianByEmail.email || p.id === 'p-parent-1'));
      if (!parentProfile) {
        parentProfile = {
          id: `p-par-${guardianByEmail.id}`,
          full_name: guardianByEmail.full_name,
          role: 'parent',
          email: guardianByEmail.email,
          password: 'parent123'
        };
        this.profiles.push(parentProfile);
      }
      this.currentUser = parentProfile;
      saveStorage(STORAGE_KEYS.CURRENT_USER, this.currentUser);
      saveStorage(STORAGE_KEYS.PROFILES, this.profiles);
      return { success: true, role: 'parent', profile: this.currentUser };
    }

    // 3. Check by existing profile email or admission no
    const profileMatch = this.profiles.find(p => 
      (p.email && p.email.toLowerCase() === trimmed) ||
      (p.admission_no && p.admission_no.toLowerCase() === trimmed)
    );

    if (profileMatch) {
      this.currentUser = profileMatch;
      saveStorage(STORAGE_KEYS.CURRENT_USER, this.currentUser);
      return { success: true, role: profileMatch.role, profile: this.currentUser };
    }

    // 4. Fallback role switch
    let role: UserRole = 'bursar';
    if (trimmed.includes('admin')) role = 'super_admin';
    else if (trimmed.includes('bursar') || trimmed.includes('bursary')) role = 'bursar';
    else if (trimmed.includes('student')) role = 'student';
    else if (trimmed.includes('parent') || trimmed.includes('gmail') || trimmed.includes('@')) role = 'parent';

    const switched = this.switchDemoUser(role);
    return { success: true, role, profile: switched };
  }

  switchDemoUser(role: UserRole): Profile {
    let target = this.profiles.find(p => p.role === role);
    if (!target) {
      target = {
        id: `p-demo-${role}`,
        full_name: role === 'super_admin' ? 'Dr. Emmanuel Okonkwo' : 
                   role === 'bursar' ? 'Mrs. Grace Nwosu' : 
                   role === 'parent' ? 'Engr. Patrick Chukwuma' : 
                   'Chukwuma David Kenechukwu',
        role: role,
        phone: '08000000000',
        password: role === 'student' ? 'student123' : role === 'parent' ? 'parent123' : 'password123'
      };
      this.profiles.push(target);
    }
    this.currentUser = target;
    saveStorage(STORAGE_KEYS.CURRENT_USER, this.currentUser);
    return this.currentUser;
  }

  changePassword(currentPassword: string, newPassword: string): { success: boolean; message: string } {
    if (!this.currentUser) {
      return { success: false, message: 'No active session found.' };
    }
    if (!newPassword || newPassword.length < 6) {
      return { success: false, message: 'New password must be at least 6 characters long.' };
    }

    const defaultExpectedPass = this.currentUser.password || (
      this.currentUser.role === 'student' ? 'student123' :
      this.currentUser.role === 'parent' ? 'parent123' :
      'password123'
    );

    if (currentPassword !== defaultExpectedPass) {
      return { success: false, message: 'Current password provided is incorrect.' };
    }

    this.currentUser.password = newPassword;
    const profileIdx = this.profiles.findIndex(p => p.id === this.currentUser.id);
    if (profileIdx !== -1) {
      this.profiles[profileIdx].password = newPassword;
    }

    saveStorage(STORAGE_KEYS.CURRENT_USER, this.currentUser);
    saveStorage(STORAGE_KEYS.PROFILES, this.profiles);
    return { success: true, message: 'Your password has been changed successfully!' };
  }

  // --- ACADEMIC STRUCTURE ---
  getClasses(): SchoolClass[] {
    return [...this.classes];
  }

  addClass(name: string, arm?: string): SchoolClass {
    const newClass: SchoolClass = {
      id: `c-${Date.now()}`,
      name,
      arm,
      created_at: new Date().toISOString()
    };
    this.classes.push(newClass);
    saveStorage(STORAGE_KEYS.CLASSES, this.classes);
    return newClass;
  }

  getSessions(): SessionTerm[] {
    return [...this.sessions];
  }

  getCurrentSession(): SessionTerm {
    return this.sessions.find(s => s.is_current) || this.sessions[0];
  }

  setCurrentSession(id: string): void {
    this.sessions = this.sessions.map(s => ({
      ...s,
      is_current: s.id === id
    }));
    saveStorage(STORAGE_KEYS.SESSIONS, this.sessions);
  }

  addSession(session: string, term: 'First' | 'Second' | 'Third'): SessionTerm {
    const newSession: SessionTerm = {
      id: `st-${Date.now()}`,
      session,
      term,
      is_current: false,
      created_at: new Date().toISOString()
    };
    this.sessions.push(newSession);
    saveStorage(STORAGE_KEYS.SESSIONS, this.sessions);
    return newSession;
  }

  // --- GUARDIANS ---
  getGuardians(): Guardian[] {
    return [...this.guardians];
  }

  getGuardianById(id: string): Guardian | undefined {
    return this.guardians.find(g => g.id === id);
  }

  getGuardianByProfileId(profileId: string): Guardian | undefined {
    return this.guardians.find(g => g.profile_id === profileId);
  }

  addGuardian(
    full_name: string,
    phone?: string,
    email?: string,
    relationship?: string,
    student_name?: string,
    admission_no?: string
  ): Guardian {
    const newGuardian: Guardian = {
      id: `g-${Date.now()}`,
      full_name,
      phone,
      email,
      relationship,
      created_at: new Date().toISOString()
    };
    this.guardians.push(newGuardian);
    saveStorage(STORAGE_KEYS.GUARDIANS, this.guardians);

    // Auto-provision parent login account
    if (email) {
      const parentProfile: Profile = {
        id: `p-par-${newGuardian.id}`,
        full_name,
        role: 'parent',
        phone,
        email,
        password: 'parent123',
        created_at: new Date().toISOString()
      };
      this.profiles.push(parentProfile);
      saveStorage(STORAGE_KEYS.PROFILES, this.profiles);

      // Dispatch automated Welcome & Registration Confirmation Email
      const wardInfo = student_name
        ? `linked to your ward ${student_name}${admission_no ? ` (${admission_no})` : ''}`
        : 'at Solid Foundation High School';

      const welcomeMsg: SystemMessage = {
        id: `m-reg-${Date.now()}`,
        sender: 'Solid Foundation HS Bursary & Admissions',
        subject: `Welcome to SFHS Portal - Registration Confirmed (${email})`,
        preview: `Dear ${full_name}, your parent guardian account ${wardInfo} has been successfully activated. Portal Login: ${email} | Default Password: parent123. You can now access your ward fee records and digital receipts.`,
        time: 'Just now',
        read: false
      };

      const welcomeNotif: SystemNotification = {
        id: `n-reg-${Date.now()}`,
        title: 'Guardian Registration Confirmed',
        body: `Automated confirmation email & portal credentials dispatched to ${email}.`,
        time: 'Just now',
        read: false,
        type: 'system'
      };

      this.messages.unshift(welcomeMsg);
      this.notifications.unshift(welcomeNotif);
      saveStorage(STORAGE_KEYS.MESSAGES, this.messages);
      saveStorage(STORAGE_KEYS.NOTIFICATIONS, this.notifications);
    }

    return newGuardian;
  }

  // --- STUDENTS ---
  getStudents(): Student[] {
    return this.students.map(s => ({
      ...s,
      school_class: this.classes.find(c => c.id === s.class_id),
      guardian: this.guardians.find(g => g.id === s.guardian_id)
    }));
  }

  getStudentById(id: string): Student | undefined {
    const s = this.students.find(st => st.id === id);
    if (!s) return undefined;
    return {
      ...s,
      school_class: this.classes.find(c => c.id === s.class_id),
      guardian: this.guardians.find(g => g.id === s.guardian_id)
    };
  }

  getStudentsByGuardian(guardianId: string): Student[] {
    return this.getStudents().filter(s => s.guardian_id === guardianId);
  }

  isAdmissionNumberTaken(admissionNo: string, excludeStudentId?: string): boolean {
    const clean = admissionNo.trim().toLowerCase();
    return this.students.some(s => s.admission_no.trim().toLowerCase() === clean && s.id !== excludeStudentId);
  }

  generateNextAdmissionNumber(currentValue?: string): string {
    const currentYear = new Date().getFullYear();
    const regex = /SFHS\/\d{4}\/(\d+)/i;
    let maxNumber = 0;

    // If an admission number already exists in input, advance from it
    if (currentValue) {
      const match = currentValue.match(regex);
      if (match && match[1]) {
        const parsed = parseInt(match[1], 10);
        if (!isNaN(parsed) && parsed > 0) {
          maxNumber = parsed;
        }
      }
    }

    // If no valid base, scan all enrolled students to find the highest number
    if (maxNumber === 0) {
      this.students.forEach(s => {
        const match = s.admission_no.match(regex);
        if (match && match[1]) {
          const num = parseInt(match[1], 10);
          if (!isNaN(num) && num > maxNumber) {
            maxNumber = num;
          }
        }
      });

      if (maxNumber === 0) {
        maxNumber = this.students.length;
      }
    }

    let nextNumber = maxNumber + 1;
    let candidate = `SFHS/${currentYear}/${String(nextNumber).padStart(3, '0')}`;

    // Guarantee uniqueness against any edge case collisions
    while (this.isAdmissionNumberTaken(candidate)) {
      nextNumber++;
      candidate = `SFHS/${currentYear}/${String(nextNumber).padStart(3, '0')}`;
    }

    return candidate;
  }

  addStudent(studentData: Omit<Student, 'id' | 'created_at'>): Student {
    let finalAdmissionNo = studentData.admission_no?.trim();

    // Enforce unique admission number
    if (!finalAdmissionNo || this.isAdmissionNumberTaken(finalAdmissionNo)) {
      finalAdmissionNo = this.generateNextAdmissionNumber();
    }

    const newStudent: Student = {
      ...studentData,
      admission_no: finalAdmissionNo,
      id: `s-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    this.students.push(newStudent);
    saveStorage(STORAGE_KEYS.STUDENTS, this.students);

    // Auto-provision student login account
    const studentProfile: Profile = {
      id: `p-std-${newStudent.id}`,
      full_name: newStudent.full_name,
      role: 'student',
      admission_no: newStudent.admission_no,
      password: 'student123',
      created_at: new Date().toISOString()
    };
    this.profiles.push(studentProfile);
    saveStorage(STORAGE_KEYS.PROFILES, this.profiles);

    return this.getStudentById(newStudent.id)!;
  }

  updateStudent(id: string, updates: Partial<Student>): Student | undefined {
    const index = this.students.findIndex(s => s.id === id);
    if (index === -1) return undefined;
    this.students[index] = { ...this.students[index], ...updates };
    saveStorage(STORAGE_KEYS.STUDENTS, this.students);
    return this.getStudentById(id);
  }

  // --- FEE STRUCTURES ---
  getFeeStructures(): FeeStructure[] {
    return this.feeStructures.map(fs => ({
      ...fs,
      school_class: this.classes.find(c => c.id === fs.class_id),
      session_term: this.sessions.find(st => st.id === fs.session_term_id)
    }));
  }

  getFeeStructuresForClass(classId: string, sessionTermId?: string): FeeStructure[] {
    const currentTermId = sessionTermId || this.getCurrentSession().id;
    return this.getFeeStructures().filter(
      fs => fs.class_id === classId && fs.session_term_id === currentTermId
    );
  }

  addFeeStructure(class_id: string, session_term_id: string, fee_item: string, amount: number, is_compulsory: boolean = true): FeeStructure {
    const newFs: FeeStructure = {
      id: `fs-${Date.now()}`,
      class_id,
      session_term_id,
      fee_item,
      amount,
      is_compulsory,
      created_at: new Date().toISOString()
    };
    this.feeStructures.push(newFs);
    saveStorage(STORAGE_KEYS.FEE_STRUCTURES, this.feeStructures);
    return newFs;
  }

  deleteFeeStructure(id: string): void {
    this.feeStructures = this.feeStructures.filter(fs => fs.id !== id);
    saveStorage(STORAGE_KEYS.FEE_STRUCTURES, this.feeStructures);
  }

  // --- PAYMENTS & RECEIPTS ---
  getPayments(): Payment[] {
    return this.payments.map(p => ({
      ...p,
      student: this.getStudentById(p.student_id),
      fee_structure: this.feeStructures.find(fs => fs.id === p.fee_structure_id),
      recorder: this.profiles.find(pr => pr.id === p.recorded_by)
    })).sort((a, b) => new Date(b.paid_at).getTime() - new Date(a.paid_at).getTime());
  }

  getPaymentById(id: string): Payment | undefined {
    return this.getPayments().find(p => p.id === id);
  }

  getReceipts(): Receipt[] {
    return this.receipts.map(r => ({
      ...r,
      payment: this.getPaymentById(r.payment_id)
    }));
  }

  getReceiptByPaymentId(paymentId: string): Receipt | undefined {
    return this.getReceipts().find(r => r.payment_id === paymentId);
  }

  getReceiptByNo(receiptNo: string): Receipt | undefined {
    return this.getReceipts().find(r => r.receipt_no === receiptNo);
  }

  recordPayment(
    student_id: string,
    amount: number,
    method: PaymentMethod,
    fee_structure_id?: string,
    referenceOverride?: string
  ): { payment: Payment; receipt: Receipt } {
    const reference = referenceOverride || (
      method === 'paystack' || method === 'card' || method === 'ussd' || method === 'bank_account'
        ? `PAYSK-${new Date().getFullYear()}-${Math.floor(1000000 + Math.random() * 9000000)}`
        : `TRF-${Math.floor(100000 + Math.random() * 900000)}`
    );

    const payment: Payment = {
      id: `pay-${Date.now()}`,
      student_id,
      fee_structure_id,
      amount,
      method,
      reference,
      status: 'success',
      recorded_by: method !== 'paystack' ? this.currentUser.id : undefined,
      paid_at: new Date().toISOString()
    };

    this.payments.push(payment);
    saveStorage(STORAGE_KEYS.PAYMENTS, this.payments);

    // Auto-generate receipt
    const receiptCount = this.receipts.length + 1;
    const receiptNo = `REC-SFHS-${new Date().getFullYear()}-${receiptCount.toString().padStart(4, '0')}`;
    const receipt: Receipt = {
      id: `rec-${Date.now()}`,
      payment_id: payment.id,
      receipt_no: receiptNo,
      issued_at: new Date().toISOString()
    };

    this.receipts.push(receipt);
    saveStorage(STORAGE_KEYS.RECEIPTS, this.receipts);

    // Broadcast Real-Time Notification & Email Message
    const student = this.getStudentById(student_id);
    const studentName = student ? student.full_name : 'Student';

    const newNotif: SystemNotification = {
      id: `n-${Date.now()}`,
      title: 'Payment Verified & Logged',
      body: `₦${amount.toLocaleString('en-NG')} paid via ${method.replace('_', ' ').toUpperCase()} for ${studentName}. (Ref: ${reference})`,
      time: 'Just now',
      read: false,
      type: 'payment'
    };

    const newMsg: SystemMessage = {
      id: `m-${Date.now()}`,
      sender: 'Paystack / Bursary Engine',
      subject: `Payment Receipt Issued (${receiptNo})`,
      preview: `Official digital receipt for ₦${amount.toLocaleString('en-NG')} delivered to registered guardian email.`,
      time: 'Just now',
      read: false
    };

    this.notifications.unshift(newNotif);
    this.messages.unshift(newMsg);
    saveStorage(STORAGE_KEYS.NOTIFICATIONS, this.notifications);
    saveStorage(STORAGE_KEYS.MESSAGES, this.messages);

    return {
      payment: this.getPaymentById(payment.id)!,
      receipt: this.getReceiptByPaymentId(payment.id)!
    };
  }

  // --- FEE BALANCES & CALCULATIONS ---
  getStudentFeeSummary(studentId: string, sessionTermId?: string): StudentFeeSummary | undefined {
    const student = this.getStudentById(studentId);
    if (!student) return undefined;

    const term = sessionTermId 
      ? this.sessions.find(s => s.id === sessionTermId) || this.getCurrentSession()
      : this.getCurrentSession();

    // Get fees for student's class
    const classFees = this.getFeeStructuresForClass(student.class_id, term.id);
    const total_fees_due = classFees.reduce((sum, f) => sum + f.amount, 0);

    // Get payments made by student for this term
    const studentPayments = this.getPayments().filter(
      p => p.student_id === studentId && p.status === 'success'
    );
    const total_paid = studentPayments.reduce((sum, p) => sum + p.amount, 0);
    const balance_owed = Math.max(0, total_fees_due - total_paid);

    // Breakdown per fee item
    let remainingPaid = total_paid;
    const fee_breakdown = classFees.map(fs => {
      let paid_for_item = 0;
      if (remainingPaid >= fs.amount) {
        paid_for_item = fs.amount;
        remainingPaid -= fs.amount;
      } else {
        paid_for_item = remainingPaid;
        remainingPaid = 0;
      }
      return {
        fee_structure: fs,
        paid_amount: paid_for_item,
        balance: Math.max(0, fs.amount - paid_for_item)
      };
    });

    return {
      student,
      session_term: term,
      total_fees_due,
      total_paid,
      balance_owed,
      fee_breakdown,
      payments_history: studentPayments
    };
  }

  // --- DASHBOARD METRICS ---
  getAdminDashboardMetrics(sessionTermId?: string) {
    const term = sessionTermId 
      ? this.sessions.find(s => s.id === sessionTermId) || this.getCurrentSession()
      : this.getCurrentSession();

    const students = this.getStudents().filter(s => s.status === 'active');
    
    let totalExpected = 0;
    students.forEach(s => {
      const fees = this.getFeeStructuresForClass(s.class_id, term.id);
      totalExpected += fees.reduce((sum, f) => sum + f.amount, 0);
    });

    const allPayments = this.getPayments().filter(p => p.status === 'success');
    const totalCollected = allPayments.reduce((sum, p) => sum + p.amount, 0);
    const outstandingBalance = Math.max(0, totalExpected - totalCollected);

    // Class breakdown
    const classBreakdown = this.classes.map(c => {
      const classStudents = students.filter(s => s.class_id === c.id);
      const classFees = this.getFeeStructuresForClass(c.id, term.id);
      const feePerStudent = classFees.reduce((s, f) => s + f.amount, 0);
      const expected = classStudents.length * feePerStudent;
      
      const classStudentIds = new Set(classStudents.map(s => s.id));
      const collected = allPayments
        .filter(p => classStudentIds.has(p.student_id))
        .reduce((sum, p) => sum + p.amount, 0);

      return {
        class_id: c.id,
        class_name: `${c.name} ${c.arm || ''}`.trim(),
        student_count: classStudents.length,
        expected,
        collected,
        outstanding: Math.max(0, expected - collected)
      };
    });

    return {
      term,
      active_students_count: students.length,
      totalExpected,
      totalCollected,
      outstandingBalance,
      recentPayments: allPayments.slice(0, 5),
      classBreakdown
    };
  }
}

export const feeService = new FeeService();
