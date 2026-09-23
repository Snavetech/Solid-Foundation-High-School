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
  PROFILES: 'sfhs_profiles_v6',
  CLASSES: 'sfhs_classes_v6',
  SESSIONS: 'sfhs_sessions_v6',
  GUARDIANS: 'sfhs_guardians_v6',
  STUDENTS: 'sfhs_students_v6',
  FEE_STRUCTURES: 'sfhs_fee_structures_v6',
  PAYMENTS: 'sfhs_payments_v6',
  RECEIPTS: 'sfhs_receipts_v6',
  CURRENT_USER: 'sfhs_current_user_v6',
  NOTIFICATIONS: 'sfhs_notifications_v6',
  MESSAGES: 'sfhs_messages_v6',
  SCHOOL_INFO: 'sfhs_school_info_v6'
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

// Helpers to strip joined nested objects before sending records to Supabase tables (prevents PGRST204 errors)
function cleanStudentForCloud(s: Student): any {
  return {
    id: s.id,
    admission_no: s.admission_no,
    full_name: s.full_name,
    class_id: s.class_id,
    guardian_id: s.guardian_id,
    status: s.status || 'active',
    photo_url: s.photo_url || null,
    created_at: s.created_at || new Date().toISOString()
  };
}

function cleanClassForCloud(c: SchoolClass): any {
  return {
    id: c.id,
    name: c.name,
    arm: c.arm || null,
    created_at: c.created_at || new Date().toISOString()
  };
}

function cleanSessionForCloud(s: SessionTerm): any {
  return {
    id: s.id,
    session: s.session,
    term: s.term,
    is_current: Boolean(s.is_current),
    created_at: s.created_at || new Date().toISOString()
  };
}

function cleanGuardianForCloud(g: Guardian): any {
  return {
    id: g.id,
    profile_id: g.profile_id || null,
    full_name: g.full_name,
    phone: g.phone || null,
    email: g.email || null,
    relationship: g.relationship || null,
    created_at: g.created_at || new Date().toISOString()
  };
}

function cleanFeeStructureForCloud(f: FeeStructure): any {
  return {
    id: f.id,
    class_id: f.class_id,
    session_term_id: f.session_term_id,
    fee_item: f.fee_item,
    amount: f.amount,
    is_compulsory: f.is_compulsory !== false,
    created_at: f.created_at || new Date().toISOString()
  };
}

function cleanPaymentForCloud(p: Payment): any {
  return {
    id: p.id,
    student_id: p.student_id,
    fee_structure_id: p.fee_structure_id || null,
    amount: p.amount,
    method: p.method,
    reference: p.reference,
    status: p.status || 'success',
    recorded_by: p.recorded_by || null,
    paid_at: p.paid_at || new Date().toISOString()
  };
}

function cleanReceiptForCloud(r: Receipt): any {
  return {
    id: r.id,
    payment_id: r.payment_id,
    receipt_no: r.receipt_no,
    pdf_url: r.pdf_url || null,
    issued_at: r.issued_at || new Date().toISOString()
  };
}

function cleanProfileForCloud(p: Profile): any {
  return {
    id: p.id,
    full_name: p.full_name,
    role: p.role,
    phone: p.phone || null,
    email: p.email || null,
    admission_no: p.admission_no || null,
    password: p.password || null,
    created_at: p.created_at || new Date().toISOString()
  };
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
  private cloudStudentCount: number | null = null;
  private lastSyncedAt: Date | null = null;

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

    // Sanitize and deduplicate any duplicate classes, sessions, or guardians from past syncs
    this.sanitizeAndDeduplicate();

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

  getCloudStats(): { localStudents: number; cloudStudents: number | null; lastSynced: Date | null } {
    return {
      localStudents: this.students.filter(s => !s.id.startsWith('d0000000-')).length,
      cloudStudents: this.cloudStudentCount,
      lastSynced: this.lastSyncedAt
    };
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

      this.lastSyncedAt = new Date();
      if (studentsRes.data) {
        this.cloudStudentCount = (studentsRes.data as Student[]).filter(s => !s.id.startsWith('d0000000-')).length;
      }

      if (!cloudHasClasses && !cloudHasStudents && !this.hasInitializedCloud) {
        console.log('Remote Supabase tables empty, pushing initial seed...');
        await this.pushLocalDataToCloud();
        this.hasInitializedCloud = true;
        this.syncStatus = 'synced';
        this.syncErrorMessage = null;
        this.notifyListeners();
        return;
      }

      // Ingest and union-merge remote data into memory & local cache
      // 1. Classes
      if (classesRes.data && classesRes.data.length > 0) {
        const remoteClasses = (classesRes.data as SchoolClass[]).filter(c => !c.id.startsWith('b0000000-'));
        const classMap = new Map(this.classes.filter(c => !c.id.startsWith('b0000000-')).map(c => [c.id, c]));
        remoteClasses.forEach((c: SchoolClass) => classMap.set(c.id, { ...classMap.get(c.id), ...c }));
        this.classes = Array.from(classMap.values());
        saveStorage(STORAGE_KEYS.CLASSES, this.classes);
      }

      // 2. Sessions
      if (sessionsRes.data && sessionsRes.data.length > 0) {
        const remoteSessions = (sessionsRes.data as SessionTerm[]).filter(s => !s.id.startsWith('a0000000-'));
        const sessionMap = new Map(this.sessions.filter(s => !s.id.startsWith('a0000000-')).map(s => [s.id, s]));
        remoteSessions.forEach((s: SessionTerm) => sessionMap.set(s.id, { ...sessionMap.get(s.id), ...s }));
        this.sessions = Array.from(sessionMap.values());
        saveStorage(STORAGE_KEYS.SESSIONS, this.sessions);
      }

      // 3. Guardians
      if (guardiansRes.data && guardiansRes.data.length > 0) {
        const remoteGuardians = (guardiansRes.data as Guardian[]).filter(g => !g.id.startsWith('c0000000-'));
        const guardianMap = new Map(this.guardians.filter(g => !g.id.startsWith('c0000000-')).map(g => [g.id, g]));
        remoteGuardians.forEach((g: Guardian) => guardianMap.set(g.id, { ...guardianMap.get(g.id), ...g }));
        this.guardians = Array.from(guardianMap.values());
        saveStorage(STORAGE_KEYS.GUARDIANS, this.guardians);
      }

      // 4. Students (deduplicate strictly by normalized admission_no to prevent 150 -> 152 ghost count)
      if (studentsRes.data && studentsRes.data.length > 0) {
        const remoteStudents = (studentsRes.data as Student[]).filter(s => !s.id.startsWith('d0000000-'));
        const studentMap = new Map<string, Student>();
        
        // Populate with current non-dummy local students first
        this.students.filter(s => !s.id.startsWith('d0000000-')).forEach(s => {
          const key = (s.admission_no || s.id).trim().toLowerCase();
          studentMap.set(key, s);
        });

        // Merge remote students (matching admission numbers are updated, new ones added)
        remoteStudents.forEach((s: Student) => {
          const key = (s.admission_no || s.id).trim().toLowerCase();
          const existing = studentMap.get(key);
          studentMap.set(key, existing ? { ...existing, ...s } : s);
        });

        this.students = Array.from(studentMap.values());
        saveStorage(STORAGE_KEYS.STUDENTS, this.students);
      }

      // 5. Fee Structures
      if (feeStructsRes.data && feeStructsRes.data.length > 0) {
        const fsMap = new Map(this.feeStructures.map(f => [f.id, f]));
        feeStructsRes.data.forEach((f: FeeStructure) => fsMap.set(f.id, { ...fsMap.get(f.id), ...f }));
        this.feeStructures = Array.from(fsMap.values());
        saveStorage(STORAGE_KEYS.FEE_STRUCTURES, this.feeStructures);
      }

      // 6. Payments
      if (paymentsRes.data && paymentsRes.data.length > 0) {
        const payMap = new Map(this.payments.map(p => [p.reference || p.id, p]));
        paymentsRes.data.forEach((p: Payment) => payMap.set(p.reference || p.id, { ...payMap.get(p.reference || p.id), ...p }));
        this.payments = Array.from(payMap.values());
        saveStorage(STORAGE_KEYS.PAYMENTS, this.payments);
      }

      // 7. Receipts
      if (receiptsRes.data && receiptsRes.data.length > 0) {
        const recMap = new Map(this.receipts.map(r => [r.receipt_no || r.id, r]));
        receiptsRes.data.forEach((r: Receipt) => recMap.set(r.receipt_no || r.id, { ...recMap.get(r.receipt_no || r.id), ...r }));
        this.receipts = Array.from(recMap.values());
        saveStorage(STORAGE_KEYS.RECEIPTS, this.receipts);
      }

      // 8. Profiles
      if (profilesRes.data && profilesRes.data.length > 0) {
        const profileMap = new Map(this.profiles.map(p => [p.id, p]));
        profilesRes.data.forEach((p: Profile) => profileMap.set(p.id, { ...profileMap.get(p.id), ...p }));
        this.profiles = Array.from(profileMap.values());
        saveStorage(STORAGE_KEYS.PROFILES, this.profiles);
      }

      // Auto-Sync: Check if local storage has enrolled students not yet present in Supabase cloud (e.g. Device 1 has 159, cloud has fewer)
      if (studentsRes.data) {
        const remoteAdmSet = new Set((studentsRes.data as Student[]).map(s => (s.admission_no || '').trim().toLowerCase()));
        const missingInCloud = this.students.filter(s => s.admission_no && !remoteAdmSet.has(s.admission_no.trim().toLowerCase()) && !s.id.startsWith('d0000000-'));
        if (missingInCloud.length > 0) {
          console.log(`[Auto-Sync] Detected ${missingInCloud.length} local students missing in Supabase cloud. Uploading now...`);
          this.pushStudentsToCloud(missingInCloud).then(res => {
            if (res.success) {
              console.log(`[Auto-Sync] Successfully uploaded ${res.count} students to cloud.`);
            }
          }).catch(err => {
            console.warn('[Auto-Sync] Background student push deferred:', err);
          });
        }
      }

      // Ensure no duplicate records (classes, sessions, guardians, students) were ingested
      this.sanitizeAndDeduplicate();
      this.persistAll();

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
        const cleanAdm = (newRow.admission_no || '').trim().toLowerCase();
        const existingIdx = this.students.findIndex(s => s.id === newRow.id || (s.admission_no && s.admission_no.trim().toLowerCase() === cleanAdm));
        if (existingIdx === -1) {
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
        } else {
          this.students[existingIdx] = { ...this.students[existingIdx], ...newRow };
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

  async pushStudentsToCloud(studentsToPush: Student[]): Promise<{ success: boolean; count: number; error?: string }> {
    if (isDemoMode || studentsToPush.length === 0) return { success: true, count: 0 };
    try {
      const clean = studentsToPush.filter(s => !s.id.startsWith('d0000000-')).map(cleanStudentForCloud);
      for (let i = 0; i < clean.length; i += 50) {
        const batch = clean.slice(i, i + 50);
        const { error } = await supabase.from('students').upsert(batch, { onConflict: 'admission_no' });
        if (error) throw error;
      }
      return { success: true, count: clean.length };
    } catch (err: any) {
      console.error('pushStudentsToCloud failed:', err);
      this.syncStatus = 'error';
      this.syncErrorMessage = err?.message || 'Failed to sync students to cloud';
      this.notifyListeners();
      return { success: false, count: 0, error: err?.message };
    }
  }

  async pushLocalDataToCloud(): Promise<{ success: boolean; message: string; details?: any }> {
    if (isDemoMode) {
      return { success: false, message: 'Application is running in Demo Mode. Supabase credentials not configured.' };
    }

    try {
      this.syncStatus = 'syncing';
      this.notifyListeners();

      // 1. Push classes
      const cleanClasses = this.classes.filter(c => !c.id.startsWith('b0000000-')).map(cleanClassForCloud);
      const { error: cErr } = await supabase.from('classes').upsert(cleanClasses, { onConflict: 'id' });
      if (cErr) throw new Error(`Classes upload error: ${cErr.message}`);

      // 2. Push sessions
      const cleanSessions = this.sessions.filter(s => !s.id.startsWith('a0000000-')).map(cleanSessionForCloud);
      const { error: sErr } = await supabase.from('session_terms').upsert(cleanSessions, { onConflict: 'id' });
      if (sErr) throw new Error(`Sessions upload error: ${sErr.message}`);

      // 3. Push profiles
      const cleanProfiles = this.profiles.map(cleanProfileForCloud);
      for (let i = 0; i < cleanProfiles.length; i += 50) {
        const batch = cleanProfiles.slice(i, i + 50);
        const { error: pErr } = await supabase.from('profiles').upsert(batch, { onConflict: 'id' });
        if (pErr) throw new Error(`Profiles upload error: ${pErr.message}`);
      }

      // 4. Push guardians
      const cleanGuardians = this.guardians.filter(g => !g.id.startsWith('c0000000-')).map(cleanGuardianForCloud);
      for (let i = 0; i < cleanGuardians.length; i += 50) {
        const batch = cleanGuardians.slice(i, i + 50);
        const { error: gErr } = await supabase.from('guardians').upsert(batch, { onConflict: 'id' });
        if (gErr) throw new Error(`Guardians upload error: ${gErr.message}`);
      }

      // 5. Push students
      const cleanStudents = this.students.filter(st => !st.id.startsWith('d0000000-')).map(cleanStudentForCloud);
      for (let i = 0; i < cleanStudents.length; i += 50) {
        const batch = cleanStudents.slice(i, i + 50);
        const { error: stErr } = await supabase.from('students').upsert(batch, { onConflict: 'admission_no' });
        if (stErr) throw new Error(`Students upload error: ${stErr.message}`);
      }

      // 6. Push fee structures
      const cleanFS = this.feeStructures.map(cleanFeeStructureForCloud);
      for (let i = 0; i < cleanFS.length; i += 50) {
        const batch = cleanFS.slice(i, i + 50);
        const { error: fsErr } = await supabase.from('fee_structures').upsert(batch, { onConflict: 'id' });
        if (fsErr) throw new Error(`Fee structures upload error: ${fsErr.message}`);
      }

      // 7. Push payments
      const cleanPayments = this.payments.map(cleanPaymentForCloud);
      for (let i = 0; i < cleanPayments.length; i += 50) {
        const batch = cleanPayments.slice(i, i + 50);
        const { error: payErr } = await supabase.from('payments').upsert(batch, { onConflict: 'reference' });
        if (payErr) throw new Error(`Payments upload error: ${payErr.message}`);
      }

      // 8. Push receipts
      const cleanReceipts = this.receipts.map(cleanReceiptForCloud);
      for (let i = 0; i < cleanReceipts.length; i += 50) {
        const batch = cleanReceipts.slice(i, i + 50);
        const { error: recErr } = await supabase.from('receipts').upsert(batch, { onConflict: 'receipt_no' });
        if (recErr) throw new Error(`Receipts upload error: ${recErr.message}`);
      }

      this.syncStatus = 'synced';
      this.syncErrorMessage = null;
      this.cloudStudentCount = cleanStudents.length;
      this.lastSyncedAt = new Date();
      this.notifyListeners();

      return {
        success: true,
        message: `Successfully synchronized all ${cleanStudents.length} students, ${cleanGuardians.length} guardians, and school records to Supabase cloud!`,
        details: {
          students: cleanStudents.length,
          guardians: cleanGuardians.length,
          classes: cleanClasses.length,
          payments: cleanPayments.length
        }
      };
    } catch (err: any) {
      console.error('Error in pushLocalDataToCloud:', err);
      this.syncStatus = 'error';
      this.syncErrorMessage = err?.message || 'Failed to upload records to cloud';
      this.notifyListeners();
      return { success: false, message: err?.message || 'Failed to upload records to cloud' };
    }
  }

  async seedCloudDatabase(): Promise<void> {
    const res = await this.pushLocalDataToCloud();
    if (!res.success) {
      throw new Error(res.message);
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

  // Purge duplicate records caused by conflicting remote UUIDs vs local IDs
  private sanitizeAndDeduplicate(): void {
    // 1. Deduplicate Classes by normalized (name + ' ' + (arm || ''))
    const classGroups = new Map<string, SchoolClass[]>();
    for (const c of this.classes) {
      const key = `${(c.name || '').trim().toLowerCase()}__${(c.arm || '').trim().toLowerCase()}`;
      if (!classGroups.has(key)) classGroups.set(key, []);
      classGroups.get(key)!.push(c);
    }

    const uniqueClasses: SchoolClass[] = [];
    const classIdRedirects = new Map<string, string>(); // oldDuplicateId -> canonicalId

    for (const [, group] of classGroups) {
      if (group.length === 1) {
        uniqueClasses.push(group[0]);
      } else {
        // Prioritize the entry that has active students or fee structures associated with it
        const score = (c: SchoolClass) => {
          const studentCount = this.students.filter(s => s.class_id === c.id).length;
          const feeCount = this.feeStructures.filter(f => f.class_id === c.id).length;
          const isInitialFormat = c.id.startsWith('c-') ? 1 : 0;
          return studentCount * 100 + feeCount * 10 + isInitialFormat;
        };

        group.sort((a, b) => score(b) - score(a));
        const canonical = group[0];
        uniqueClasses.push(canonical);

        for (let i = 1; i < group.length; i++) {
          classIdRedirects.set(group[i].id, canonical.id);
        }
      }
    }

    // Remap any foreign keys pointing to removed duplicate classes
    if (classIdRedirects.size > 0) {
      this.students = this.students.map(s => {
        if (classIdRedirects.has(s.class_id)) {
          return { ...s, class_id: classIdRedirects.get(s.class_id)! };
        }
        return s;
      });
      this.feeStructures = this.feeStructures.map(f => {
        if (classIdRedirects.has(f.class_id)) {
          return { ...f, class_id: classIdRedirects.get(f.class_id)! };
        }
        return f;
      });
    }
    this.classes = uniqueClasses;

    // 2. Deduplicate Sessions by (session + ' ' + term)
    const sessionGroups = new Map<string, SessionTerm[]>();
    for (const s of this.sessions) {
      const key = `${(s.session || '').trim().toLowerCase()}__${(s.term || '').trim().toLowerCase()}`;
      if (!sessionGroups.has(key)) sessionGroups.set(key, []);
      sessionGroups.get(key)!.push(s);
    }

    const uniqueSessions: SessionTerm[] = [];
    const sessionIdRedirects = new Map<string, string>();

    for (const [, group] of sessionGroups) {
      if (group.length === 1) {
        uniqueSessions.push(group[0]);
      } else {
        const score = (s: SessionTerm) => {
          const feeCount = this.feeStructures.filter(f => f.session_term_id === s.id).length;
          const payCount = this.payments.filter(p => p.session_term_id === s.id).length;
          const isCurrent = s.is_current ? 10 : 0;
          return feeCount * 100 + payCount * 10 + isCurrent;
        };
        group.sort((a, b) => score(b) - score(a));
        const canonical = group[0];
        uniqueSessions.push(canonical);

        for (let i = 1; i < group.length; i++) {
          sessionIdRedirects.set(group[i].id, canonical.id);
        }
      }
    }

    if (sessionIdRedirects.size > 0) {
      this.feeStructures = this.feeStructures.map(f => {
        if (sessionIdRedirects.has(f.session_term_id)) {
          return { ...f, session_term_id: sessionIdRedirects.get(f.session_term_id)! };
        }
        return f;
      });
      this.payments = this.payments.map(p => {
        if (sessionIdRedirects.has(p.session_term_id)) {
          return { ...p, session_term_id: sessionIdRedirects.get(p.session_term_id)! };
        }
        return p;
      });
    }
    this.sessions = uniqueSessions;

    // 3. Deduplicate Guardians by full_name and phone
    const guardianGroups = new Map<string, Guardian[]>();
    for (const g of this.guardians) {
      const key = `${(g.full_name || '').trim().toLowerCase()}__${(g.phone || '').replace(/[\s-]/g, '')}`;
      if (!guardianGroups.has(key)) guardianGroups.set(key, []);
      guardianGroups.get(key)!.push(g);
    }

    const uniqueGuardians: Guardian[] = [];
    const guardianIdRedirects = new Map<string, string>();

    for (const [, group] of guardianGroups) {
      if (group.length === 1) {
        uniqueGuardians.push(group[0]);
      } else {
        const score = (g: Guardian) => this.students.filter(s => s.guardian_id === g.id).length;
        group.sort((a, b) => score(b) - score(a));
        const canonical = group[0];
        uniqueGuardians.push(canonical);

        for (let i = 1; i < group.length; i++) {
          guardianIdRedirects.set(group[i].id, canonical.id);
        }
      }
    }

    if (guardianIdRedirects.size > 0) {
      this.students = this.students.map(s => {
        if (s.guardian_id && guardianIdRedirects.has(s.guardian_id)) {
          return { ...s, guardian_id: guardianIdRedirects.get(s.guardian_id)! };
        }
        return s;
      });
    }
    this.guardians = uniqueGuardians;

    // Cross-reference any unlinked guardians with existing profiles by email
    for (const g of this.guardians) {
      if (g.email) {
        const cleanEmail = g.email.trim().toLowerCase();
        const matchingProfile = this.profiles.find(p => p.email && p.email.toLowerCase() === cleanEmail);
        if (matchingProfile && !g.profile_id) {
          g.profile_id = matchingProfile.id;
        }
      }
    }

    // 4. Deduplicate Fee Structures by (class_id + session_term_id + fee_item)
    const fsMap = new Map<string, FeeStructure>();
    for (const f of this.feeStructures) {
      const key = `${f.class_id}__${f.session_term_id}__${(f.fee_item || '').trim().toLowerCase()}`;
      if (!fsMap.has(key)) {
        fsMap.set(key, f);
      }
    }
    this.feeStructures = Array.from(fsMap.values());

    // 5. Deduplicate Students by normalized admission_no & purge legacy dummy UUIDs
    const studentMap = new Map<string, Student>();
    const studentIdRedirects = new Map<string, string>();

    // Filter out any legacy dummy UUID seed students (d0000000-...)
    const cleanStudentList = this.students.filter(s => !s.id.startsWith('d0000000-'));

    for (const s of cleanStudentList) {
      const key = (s.admission_no || s.id).trim().toLowerCase();
      if (!studentMap.has(key)) {
        studentMap.set(key, s);
      } else {
        const canonical = studentMap.get(key)!;
        studentIdRedirects.set(s.id, canonical.id);
      }
    }
    this.students = Array.from(studentMap.values());

    if (studentIdRedirects.size > 0) {
      this.payments = this.payments.map(p => {
        if (studentIdRedirects.has(p.student_id)) {
          return { ...p, student_id: studentIdRedirects.get(p.student_id)! };
        }
        return p;
      });
    }
  }

  // --- AUTH & ROLE METHODS ---
  getCurrentUser(): Profile | null {
    return this.currentUser;
  }

  setCurrentUser(profile: Profile | null): void {
    this.currentUser = profile;
    if (profile) {
      saveStorage(STORAGE_KEYS.CURRENT_USER, this.currentUser);
    } else {
      try {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      } catch (e) {
        console.error('Failed to clear current user', e);
      }
    }
    this.notifyListeners();
  }

  getProfiles(): Profile[] {
    return [...this.profiles];
  }

  getProfileById(id: string): Profile | undefined {
    return this.profiles.find(p => p.id === id);
  }

  getProfileByEmail(email: string): Profile | undefined {
    const clean = email.trim().toLowerCase();
    return this.profiles.find(p => p.email && p.email.toLowerCase() === clean);
  }

  logout(): void {
    this.currentUser = null;
    try {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    } catch (e) {
      console.error('Failed to clear current user', e);
    }
    this.notifyListeners();
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

    // Helper to check password
    const checkPassword = (profile: Profile): boolean => {
      if (!pass) return true;
      const expectedPass = profile.password || (
        profile.role === 'student' ? 'student123' :
        profile.role === 'parent' ? 'parent123' :
        'password123'
      );
      return pass === expectedPass;
    };

    // 1. Direct check in profiles (by email, admission_no, or exact username match)
    const directProfile = this.profiles.find(p => 
      (p.email && p.email.toLowerCase() === trimmed) ||
      (p.admission_no && p.admission_no.toLowerCase() === trimmed) ||
      (p.admission_no && p.admission_no.toLowerCase().replace(/[^a-z0-9]/g, '') === cleanIdentifier)
    );

    if (directProfile) {
      if (!checkPassword(directProfile)) {
        return { success: false, role: directProfile.role, profile: directProfile, message: 'Invalid password provided.' };
      }
      this.currentUser = directProfile;
      saveStorage(STORAGE_KEYS.CURRENT_USER, this.currentUser);
      this.notifyListeners();
      return { success: true, role: directProfile.role, profile: this.currentUser };
    }

    // 2. Check by parent email in guardians list
    const guardianByEmail = this.guardians.find(g => g.email && g.email.toLowerCase() === trimmed);
    if (guardianByEmail) {
      let parentProfile = this.profiles.find(p => p.role === 'parent' && p.email?.toLowerCase() === guardianByEmail.email?.toLowerCase());
      if (!parentProfile && guardianByEmail.profile_id) {
        parentProfile = this.profiles.find(p => p.id === guardianByEmail.profile_id);
      }
      if (!parentProfile) {
        parentProfile = {
          id: guardianByEmail.profile_id || `p-par-${guardianByEmail.id}`,
          full_name: guardianByEmail.full_name,
          role: 'parent',
          email: guardianByEmail.email,
          phone: guardianByEmail.phone,
          password: 'parent123'
        };
        this.profiles.push(parentProfile);
        saveStorage(STORAGE_KEYS.PROFILES, this.profiles);
      }
      if (!guardianByEmail.profile_id) {
        guardianByEmail.profile_id = parentProfile.id;
        saveStorage(STORAGE_KEYS.GUARDIANS, this.guardians);
      }
      if (!checkPassword(parentProfile)) {
        return { success: false, role: 'parent', profile: parentProfile, message: 'Invalid password provided.' };
      }
      this.currentUser = parentProfile;
      saveStorage(STORAGE_KEYS.CURRENT_USER, this.currentUser);
      this.notifyListeners();
      return { success: true, role: 'parent', profile: this.currentUser };
    }

    // 3. Check by student admission number in students list
    const studentByAdm = this.students.find(s => {
      const sClean = s.admission_no.toLowerCase().replace(/[^a-z0-9]/g, '');
      return s.admission_no.toLowerCase() === trimmed || 
             sClean === cleanIdentifier ||
             (cleanIdentifier.length >= 3 && (sClean.endsWith(cleanIdentifier) || cleanIdentifier.endsWith(sClean)));
    });

    if (studentByAdm) {
      let studentProfile = this.profiles.find(p => p.role === 'student' && p.admission_no?.toLowerCase() === studentByAdm.admission_no.toLowerCase());
      if (!studentProfile) {
        studentProfile = {
          id: `p-std-${studentByAdm.id}`,
          full_name: studentByAdm.full_name,
          role: 'student',
          admission_no: studentByAdm.admission_no,
          password: 'student123'
        };
        this.profiles.push(studentProfile);
        saveStorage(STORAGE_KEYS.PROFILES, this.profiles);
      }
      if (!checkPassword(studentProfile)) {
        return { success: false, role: 'student', profile: studentProfile, message: 'Invalid password provided.' };
      }
      this.currentUser = studentProfile;
      saveStorage(STORAGE_KEYS.CURRENT_USER, this.currentUser);
      this.notifyListeners();
      return { success: true, role: 'student', profile: this.currentUser };
    }

    // 4. Quick shortcut keywords strictly for demo testing
    if (['admin', 'super_admin', 'bursar', 'bursary', 'student', 'parent'].includes(trimmed)) {
      let role: UserRole = 'bursar';
      if (trimmed === 'admin' || trimmed === 'super_admin') role = 'super_admin';
      else if (trimmed === 'bursar' || trimmed === 'bursary') role = 'bursar';
      else if (trimmed === 'student') role = 'student';
      else if (trimmed === 'parent') role = 'parent';

      const switched = this.switchDemoUser(role);
      return { success: true, role, profile: switched };
    }

    return { 
      success: false, 
      role: 'parent', 
      profile: this.profiles[0], 
      message: 'Account not found. Please verify your email or student admission number.' 
    };
  }

  switchDemoUser(role: UserRole): Profile {
    const demoId = role === 'super_admin' ? 'p-admin-1' :
                   role === 'bursar' ? 'p-bursar-1' :
                   role === 'parent' ? 'p-parent-1' :
                   'p-student-1';
    let target = this.profiles.find(p => p.id === demoId || p.id === `p-demo-${role}`);
    if (!target) {
      target = {
        id: demoId,
        full_name: role === 'super_admin' ? 'Dr. Emmanuel Okonkwo' : 
                   role === 'bursar' ? 'Mrs. Grace Nwosu' : 
                   role === 'parent' ? 'Engr. Patrick Chukwuma' : 
                   'Chukwuma David Kenechukwu',
        role: role,
        email: role === 'super_admin' ? 'admin@solidfoundationhigh.edu.ng' :
               role === 'bursar' ? 'bursary@solidfoundationhigh.edu.ng' :
               role === 'parent' ? 'patrick.chukwuma@gmail.com' :
               'david.chukwuma@student.sfhs.edu.ng',
        phone: '08000000000',
        admission_no: role === 'student' ? 'SFHS/2026/001' : undefined,
        password: role === 'student' ? 'student123' : role === 'parent' ? 'parent123' : 'password123'
      };
      this.profiles.push(target);
      saveStorage(STORAGE_KEYS.PROFILES, this.profiles);
    }
    this.currentUser = target;
    saveStorage(STORAGE_KEYS.CURRENT_USER, this.currentUser);
    this.notifyListeners();
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
      supabase.from('classes').insert(cleanClassForCloud(newClass)).then(({ error }) => {
        if (error) console.error('Supabase class insert failed:', error);
      });
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
      supabase.from('session_terms').insert(cleanSessionForCloud(newSession)).then(({ error }) => {
        if (error) console.error('Supabase session insert failed:', error);
      });
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
    const byProfileId = this.guardians.find(g => g.profile_id === profileId);
    if (byProfileId) return byProfileId;

    const profile = this.profiles.find(p => p.id === profileId);
    if (profile?.email) {
      const cleanEmail = profile.email.toLowerCase();
      const byEmail = this.guardians.find(g => g.email && g.email.toLowerCase() === cleanEmail);
      if (byEmail) return byEmail;
    }

    return undefined;
  }

  addGuardian(
    full_name: string,
    phone?: string,
    email?: string,
    relationship?: string,
    student_name?: string,
    admission_no?: string
  ): Guardian {
    const guardianId = `g-${Date.now()}`;
    const profileId = email ? `p-par-${guardianId}` : undefined;

    let targetGuardian: Guardian;
    const cleanEmail = email ? email.trim().toLowerCase() : '';
    const existingGuardianIndex = cleanEmail ? this.guardians.findIndex(g => g.email && g.email.toLowerCase() === cleanEmail) : -1;

    if (existingGuardianIndex !== -1) {
      this.guardians[existingGuardianIndex] = {
        ...this.guardians[existingGuardianIndex],
        full_name,
        phone: phone || this.guardians[existingGuardianIndex].phone,
        relationship: relationship || this.guardians[existingGuardianIndex].relationship,
        profile_id: this.guardians[existingGuardianIndex].profile_id || profileId
      };
      targetGuardian = this.guardians[existingGuardianIndex];
    } else {
      targetGuardian = {
        id: guardianId,
        profile_id: profileId,
        full_name,
        phone,
        email,
        relationship,
        created_at: new Date().toISOString()
      };
      this.guardians.push(targetGuardian);
    }
    saveStorage(STORAGE_KEYS.GUARDIANS, this.guardians);

    let parentProfile: Profile | null = null;
    // Auto-provision parent login account
    if (email) {
      const existingProfileIndex = this.profiles.findIndex(p => p.email && p.email.toLowerCase() === cleanEmail);
      if (existingProfileIndex !== -1) {
        this.profiles[existingProfileIndex] = {
          ...this.profiles[existingProfileIndex],
          full_name,
          phone: phone || this.profiles[existingProfileIndex].phone,
          role: 'parent'
        };
        parentProfile = this.profiles[existingProfileIndex];
      } else {
        parentProfile = {
          id: targetGuardian.profile_id || profileId || `p-par-${targetGuardian.id}`,
          full_name,
          role: 'parent',
          phone,
          email,
          password: 'parent123',
          created_at: new Date().toISOString()
        };
        this.profiles.push(parentProfile);
      }
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
      supabase.from('guardians').upsert(cleanGuardianForCloud(targetGuardian), { onConflict: 'id' }).then(({ error }) => {
        if (error) {
          console.error('Supabase guardian upsert failed:', error);
          this.syncStatus = 'error';
          this.syncErrorMessage = `Guardian cloud sync failed: ${error.message}`;
          this.notifyListeners();
        }
      });
      if (parentProfile) {
        supabase.from('profiles').upsert(cleanProfileForCloud(parentProfile), { onConflict: 'id' }).then(({ error }) => {
          if (error) console.error('Supabase profile upsert failed:', error);
        });
      }
    }

    this.notifyListeners();
    return targetGuardian;
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
      const cleanStudent = cleanStudentForCloud(newStudent);
      const cleanProf = cleanProfileForCloud(studentProfile);

      supabase.from('students').insert(cleanStudent).then(({ error }) => {
        if (error) {
          console.error('Supabase student insert failed:', error);
          this.syncStatus = 'error';
          this.syncErrorMessage = `Student cloud sync failed: ${error.message}`;
          this.notifyListeners();
        } else {
          console.log('Student successfully synced to Supabase cloud:', cleanStudent.admission_no);
          this.syncStatus = 'synced';
          this.syncErrorMessage = null;
          if (this.cloudStudentCount !== null) this.cloudStudentCount++;
          this.notifyListeners();
        }
      });

      supabase.from('profiles').upsert(cleanProf).then(({ error }) => {
        if (error) console.error('Supabase profile upsert failed:', error);
      });
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
      const cleanUpdates = cleanStudentForCloud(this.students[index]);
      supabase.from('students').update(cleanUpdates).eq('id', id).then(({ error }) => {
        if (error) {
          console.error('Supabase student update failed:', error);
          this.syncStatus = 'error';
          this.syncErrorMessage = `Student update cloud sync failed: ${error.message}`;
          this.notifyListeners();
        }
      });
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
      supabase.from('fee_structures').insert(cleanFeeStructureForCloud(newFs)).then(({ error }) => {
        if (error) console.error('Supabase fee_structures insert failed:', error);
      });
    }

    this.notifyListeners();
    return newFs;
  }

  deleteFeeStructure(id: string): void {
    this.feeStructures = this.feeStructures.filter(fs => fs.id !== id);
    saveStorage(STORAGE_KEYS.FEE_STRUCTURES, this.feeStructures);

    if (!isDemoMode) {
      supabase.from('fee_structures').delete().eq('id', id).then(({ error }) => {
        if (error) console.error('Supabase fee_structures delete failed:', error);
      });
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
      supabase.from('payments').insert(cleanPaymentForCloud(payment)).then(({ error }) => {
        if (error) console.error('Supabase payment insert failed:', error);
      });
      supabase.from('receipts').insert(cleanReceiptForCloud(receipt)).then(({ error }) => {
        if (error) console.error('Supabase receipt insert failed:', error);
      });
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

    // Class breakdown - deduplicate classes and filter out empty phantom entries
    const seenClassNames = new Set<string>();
    const classBreakdown = this.classes
      .filter(c => {
        const fullName = `${c.name} ${c.arm || ''}`.trim().toLowerCase();
        if (seenClassNames.has(fullName)) return false;
        seenClassNames.add(fullName);
        return true;
      })
      .map(c => {
        const classStudents = students.filter(s => s.class_id === c.id);
        const classFees = this.getFeeStructuresForClass(c.id, term.id);
        const feePerStudent = classFees.reduce((sum, f) => sum + f.amount, 0);
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
      })
      .filter(item => item.student_count > 0 || item.expected > 0 || item.collected > 0);

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
