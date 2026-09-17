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

import { supabase, isDemoMode } from '../lib/supabase';

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

export type SyncStatus = 'synced' | 'syncing' | 'offline' | 'error';
type ChangeListener = () => void;

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

  private listeners: Set<ChangeListener> = new Set();
  private syncStatus: SyncStatus = 'syncing';
  private syncErrorMessage: string | null = null;
  private realtimeChannel: any = null;
  private hasInitializedCloud: boolean = false;

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

    // Initialize Supabase Cloud Sync & Real-time channel
    this.initSupabaseSync();
  }

  // --- REACTIVE EVENT SUBSCRIBERS ---
  subscribe(listener: ChangeListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(fn => {
      try {
        fn();
      } catch (err) {
        console.error('Error in feeService listener callback:', err);
      }
    });
  }

  getSyncStatus(): { status: SyncStatus; errorMessage: string | null } {
    return { status: this.syncStatus, errorMessage: this.syncErrorMessage };
  }

  // --- SUPABASE CLOUD INITIALIZATION & REALTIME CHANNEL ---
  async initSupabaseSync(): Promise<void> {
    if (isDemoMode) {
      this.syncStatus = 'offline';
      this.notifyListeners();
      return;
    }

    try {
      this.syncStatus = 'syncing';
      this.notifyListeners();

      await this.pullCloudData();
      this.setupRealtimeSubscription();

      // Poll periodically (every 10 seconds) as a fail-safe backup for network drops
      if (typeof window !== 'undefined') {
        window.addEventListener('focus', () => this.pullCloudData(false));
        setInterval(() => this.pullCloudData(false), 10000);
      }
    } catch (err: any) {
      console.warn('Initial Supabase sync deferred (will retry):', err);
      this.syncStatus = 'offline';
      this.syncErrorMessage = err?.message || 'Offline mode';
      this.notifyListeners();
    }
  }

  async pullCloudData(showSpinner = true): Promise<void> {
    if (isDemoMode) return;

    if (showSpinner) {
      this.syncStatus = 'syncing';
      this.notifyListeners();
    }

    try {
      // Parallel fetch all primary tables from remote Supabase
      const [
        classesRes,
        sessionsRes,
        guardiansRes,
        studentsRes,
        feeStructsRes,
        paymentsRes,
        receiptsRes,
        profilesRes
      ] = await Promise.all([
        supabase.from('classes').select('*'),
        supabase.from('session_terms').select('*'),
        supabase.from('guardians').select('*'),
        supabase.from('students').select('*'),
        supabase.from('fee_structures').select('*'),
        supabase.from('payments').select('*'),
        supabase.from('receipts').select('*'),
        supabase.from('profiles').select('*')
      ]);

      // If RLS recursion or connection error occurred
      const errors = [classesRes.error, studentsRes.error, guardiansRes.error].filter(Boolean);
      if (errors.length > 0) {
        throw errors[0];
      }

      // Check if remote cloud database is completely empty; if so, push initial seed
      const cloudHasStudents = studentsRes.data && studentsRes.data.length > 0;
      const cloudHasClasses = classesRes.data && classesRes.data.length > 0;

      if (!cloudHasClasses && !cloudHasStudents && !this.hasInitializedCloud) {
        console.log('Remote Supabase tables empty, seeding initial records...');
        await this.seedCloudDatabase();
        this.hasInitializedCloud = true;
        this.syncStatus = 'synced';
        this.syncErrorMessage = null;
        this.notifyListeners();
        return;
      }

      // Ingest remote data into memory & local cache
      if (classesRes.data && classesRes.data.length > 0) {
        this.classes = classesRes.data;
        saveStorage(STORAGE_KEYS.CLASSES, this.classes);
      }

      if (sessionsRes.data && sessionsRes.data.length > 0) {
        this.sessions = sessionsRes.data;
        saveStorage(STORAGE_KEYS.SESSIONS, this.sessions);
      }

      if (guardiansRes.data && guardiansRes.data.length > 0) {
        this.guardians = guardiansRes.data;
        saveStorage(STORAGE_KEYS.GUARDIANS, this.guardians);
      }

      if (studentsRes.data && studentsRes.data.length > 0) {
        this.students = studentsRes.data;
        saveStorage(STORAGE_KEYS.STUDENTS, this.students);
      }

      if (feeStructsRes.data && feeStructsRes.data.length > 0) {
        this.feeStructures = feeStructsRes.data;
        saveStorage(STORAGE_KEYS.FEE_STRUCTURES, this.feeStructures);
      }

      if (paymentsRes.data && paymentsRes.data.length > 0) {
        this.payments = paymentsRes.data;
        saveStorage(STORAGE_KEYS.PAYMENTS, this.payments);
      }

      if (receiptsRes.data && receiptsRes.data.length > 0) {
        this.receipts = receiptsRes.data;
        saveStorage(STORAGE_KEYS.RECEIPTS, this.receipts);
      }

      if (profilesRes.data && profilesRes.data.length > 0) {
        // Merge profiles preserving any current credentials
        const profileMap = new Map(this.profiles.map(p => [p.id, p]));
        profilesRes.data.forEach((p: Profile) => profileMap.set(p.id, { ...profileMap.get(p.id), ...p }));
        this.profiles = Array.from(profileMap.values());
        saveStorage(STORAGE_KEYS.PROFILES, this.profiles);
      }

      this.syncStatus = 'synced';
      this.syncErrorMessage = null;
      this.hasInitializedCloud = true;
      this.notifyListeners();
    } catch (err: any) {
      console.warn('Failed to pull from Supabase:', err);
      this.syncStatus = 'error';
      this.syncErrorMessage = err?.message || 'Sync error';
      this.notifyListeners();
    }
  }

  private setupRealtimeSubscription(): void {
    if (this.realtimeChannel) {
      try {
        supabase.removeChannel(this.realtimeChannel);
      } catch (e) {}
    }

    // Subscribe to all changes on public schema tables
    this.realtimeChannel = supabase
      .channel('sfhs-cross-device-sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public' },
        (payload) => {
          console.log('⚡ Realtime change received from other device:', payload);
          this.handleRealtimeIncomingChange(payload);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('🟢 Supabase Realtime channel connected across devices.');
          this.syncStatus = 'synced';
          this.notifyListeners();
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.warn('Supabase Realtime status:', status);
        }
      });
  }

  private handleRealtimeIncomingChange(payload: any) {
    const { table, eventType, new: newRow, old: oldRow } = payload;
    if (!table) return;

    if (table === 'students') {
      if (eventType === 'INSERT') {
        if (!this.students.some(s => s.id === newRow.id)) {
          this.students.push(newRow);
          // Broadcast in-app system notification
          this.notifications.unshift({
            id: `n-realtime-${Date.now()}`,
            title: 'New Student Added',
            body: `${newRow.full_name} (${newRow.admission_no}) was just enrolled from another computer.`,
            time: 'Just now',
            read: false,
            type: 'system'
          });
        }
      } else if (eventType === 'UPDATE') {
        const idx = this.students.findIndex(s => s.id === newRow.id);
        if (idx !== -1) this.students[idx] = { ...this.students[idx], ...newRow };
        else this.students.push(newRow);
      } else if (eventType === 'DELETE') {
        this.students = this.students.filter(s => s.id !== oldRow.id);
      }
      saveStorage(STORAGE_KEYS.STUDENTS, this.students);
      saveStorage(STORAGE_KEYS.NOTIFICATIONS, this.notifications);
    } else if (table === 'guardians') {
      if (eventType === 'INSERT') {
        if (!this.guardians.some(g => g.id === newRow.id)) this.guardians.push(newRow);
      } else if (eventType === 'UPDATE') {
        const idx = this.guardians.findIndex(g => g.id === newRow.id);
        if (idx !== -1) this.guardians[idx] = { ...this.guardians[idx], ...newRow };
      } else if (eventType === 'DELETE') {
        this.guardians = this.guardians.filter(g => g.id !== oldRow.id);
      }
      saveStorage(STORAGE_KEYS.GUARDIANS, this.guardians);
    } else if (table === 'payments') {
      if (eventType === 'INSERT') {
        if (!this.payments.some(p => p.id === newRow.id)) {
          this.payments.unshift(newRow);
          this.notifications.unshift({
            id: `n-realtime-pay-${Date.now()}`,
            title: 'New Payment Logged',
            body: `₦${Number(newRow.amount).toLocaleString('en-NG')} payment was just recorded.`,
            time: 'Just now',
            read: false,
            type: 'payment'
          });
        }
      } else if (eventType === 'DELETE') {
        this.payments = this.payments.filter(p => p.id !== oldRow.id);
      }
      saveStorage(STORAGE_KEYS.PAYMENTS, this.payments);
      saveStorage(STORAGE_KEYS.NOTIFICATIONS, this.notifications);
    } else if (table === 'receipts') {
      if (eventType === 'INSERT') {
        if (!this.receipts.some(r => r.id === newRow.id)) this.receipts.unshift(newRow);
      } else if (eventType === 'DELETE') {
        this.receipts = this.receipts.filter(r => r.id !== oldRow.id);
      }
      saveStorage(STORAGE_KEYS.RECEIPTS, this.receipts);
    } else if (table === 'classes') {
      if (eventType === 'INSERT') {
        if (!this.classes.some(c => c.id === newRow.id)) this.classes.push(newRow);
      }
      saveStorage(STORAGE_KEYS.CLASSES, this.classes);
    } else if (table === 'session_terms') {
      if (eventType === 'INSERT') {
        if (!this.sessions.some(s => s.id === newRow.id)) this.sessions.push(newRow);
      } else if (eventType === 'UPDATE') {
        const idx = this.sessions.findIndex(s => s.id === newRow.id);
        if (idx !== -1) this.sessions[idx] = { ...this.sessions[idx], ...newRow };
      }
      saveStorage(STORAGE_KEYS.SESSIONS, this.sessions);
    } else if (table === 'fee_structures') {
      if (eventType === 'INSERT') {
        if (!this.feeStructures.some(f => f.id === newRow.id)) this.feeStructures.push(newRow);
      } else if (eventType === 'DELETE') {
        this.feeStructures = this.feeStructures.filter(f => f.id !== oldRow.id);
      }
      saveStorage(STORAGE_KEYS.FEE_STRUCTURES, this.feeStructures);
    } else if (table === 'profiles') {
      if (eventType === 'INSERT' || eventType === 'UPDATE') {
        const idx = this.profiles.findIndex(p => p.id === newRow.id);
        if (idx !== -1) this.profiles[idx] = { ...this.profiles[idx], ...newRow };
        else this.profiles.push(newRow);
        saveStorage(STORAGE_KEYS.PROFILES, this.profiles);
      }
    }

    this.notifyListeners();
  }

  async seedCloudDatabase(): Promise<void> {
    try {
      console.log('Uploading default database to Supabase cloud...');
      await Promise.allSettled([
        supabase.from('classes').upsert(this.classes),
        supabase.from('session_terms').upsert(this.sessions),
        supabase.from('guardians').upsert(this.guardians),
        supabase.from('students').upsert(this.students),
        supabase.from('fee_structures').upsert(this.feeStructures),
        supabase.from('payments').upsert(this.payments),
        supabase.from('receipts').upsert(this.receipts),
        supabase.from('profiles').upsert(this.profiles)
      ]);
      console.log('Seed data successfully uploaded to Supabase cloud.');
    } catch (e) {
      console.warn('Seed upload error:', e);
    }
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
    const paymentToVoid = this.payments.find(p => p.id === paymentId);
    this.payments = this.payments.filter(p => p.id !== paymentId);
    this.receipts = this.receipts.filter(r => r.payment_id !== paymentId);
    saveStorage(STORAGE_KEYS.PAYMENTS, this.payments);
    saveStorage(STORAGE_KEYS.RECEIPTS, this.receipts);

    // Sync deletion to Supabase cloud
    if (!isDemoMode) {
      supabase.from('receipts').delete().eq('payment_id', paymentId).then(() => {});
      supabase.from('payments').delete().eq('id', paymentId).then(() => {});
    }

    const newNotif: SystemNotification = {
      id: `n-${Date.now()}`,
      title: 'Payment Entry Voided',
      body: `A payment transaction (${paymentToVoid?.reference || paymentId}) was voided by Super Admin. Student balance has been updated.`,
      time: 'Just now',
      read: false,
      type: 'system'
    };
    this.notifications.unshift(newNotif);
    saveStorage(STORAGE_KEYS.NOTIFICATIONS, this.notifications);
    this.notifyListeners();
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

    if (!isDemoMode) {
      supabase.from('classes').insert(newClass).then(() => {});
    }

    this.notifyListeners();
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

    if (!isDemoMode) {
      supabase.from('session_terms').update({ is_current: false }).neq('id', id).then(() => {});
      supabase.from('session_terms').update({ is_current: true }).eq('id', id).then(() => {});
    }

    this.notifyListeners();
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

    if (!isDemoMode) {
      supabase.from('session_terms').insert(newSession).then(() => {});
    }

    this.notifyListeners();
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

    let parentProfile: Profile | null = null;
    // Auto-provision parent login account
    if (email) {
      parentProfile = {
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

    // Sync to Supabase cloud
    if (!isDemoMode) {
      supabase.from('guardians').insert(newGuardian).then(() => {});
      if (parentProfile) {
        supabase.from('profiles').upsert(parentProfile).then(() => {});
      }
    }

    this.notifyListeners();
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

    // Sync to Supabase cloud
    if (!isDemoMode) {
      // Strip join properties before saving to database
      const { school_class, guardian, ...cleanStudent } = newStudent as any;
      supabase.from('students').insert(cleanStudent).then(() => {});
      supabase.from('profiles').upsert(studentProfile).then(() => {});
    }

    this.notifyListeners();
    return this.getStudentById(newStudent.id)!;
  }

  updateStudent(id: string, updates: Partial<Student>): Student | undefined {
    const index = this.students.findIndex(s => s.id === id);
    if (index === -1) return undefined;
    this.students[index] = { ...this.students[index], ...updates };
    saveStorage(STORAGE_KEYS.STUDENTS, this.students);

    if (!isDemoMode) {
      const { school_class, guardian, ...cleanUpdates } = updates as any;
      supabase.from('students').update(cleanUpdates).eq('id', id).then(() => {});
    }

    this.notifyListeners();
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

    if (!isDemoMode) {
      supabase.from('fee_structures').insert(newFs).then(() => {});
    }

    this.notifyListeners();
    return newFs;
  }

  deleteFeeStructure(id: string): void {
    this.feeStructures = this.feeStructures.filter(fs => fs.id !== id);
    saveStorage(STORAGE_KEYS.FEE_STRUCTURES, this.feeStructures);

    if (!isDemoMode) {
      supabase.from('fee_structures').delete().eq('id', id).then(() => {});
    }

    this.notifyListeners();
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

    // Sync to Supabase cloud
    if (!isDemoMode) {
      const { student, fee_structure, recorder, ...cleanPayment } = payment as any;
      supabase.from('payments').insert(cleanPayment).then(() => {});
      supabase.from('receipts').insert(receipt).then(() => {});
    }

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
    this.notifyListeners();

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
