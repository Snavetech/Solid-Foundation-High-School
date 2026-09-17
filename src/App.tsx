import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { feeService } from './services/feeService';
import { UserRole, Profile } from './types/database';

import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';

import { LoginPage } from './pages/auth/LoginPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';

import { AdminDashboard } from './pages/admin/AdminDashboard';
import { StudentsListPage } from './pages/admin/StudentsListPage';
import { StudentDetailPage } from './pages/admin/StudentDetailPage';
import { GuardiansListPage } from './pages/admin/GuardiansListPage';
import { ClassesPage } from './pages/admin/ClassesPage';
import { SessionsPage } from './pages/admin/SessionsPage';
import { FeeStructuresPage } from './pages/admin/FeeStructuresPage';
import { PaymentsListPage } from './pages/admin/PaymentsListPage';
import { RecordPaymentPage } from './pages/admin/RecordPaymentPage';
import { ReportsPage } from './pages/admin/ReportsPage';
import { SettingsPage } from './pages/admin/SettingsPage';

import { ParentDashboard } from './pages/parent/ParentDashboard';
import { WardFeeDetailPage } from './pages/parent/WardFeeDetailPage';
import { MakePaymentPage } from './pages/parent/MakePaymentPage';
import { PaymentHistoryPage } from './pages/parent/PaymentHistoryPage';

import { StudentDashboard } from './pages/student/StudentDashboard';

export function App() {
  const [currentUser, setCurrentUser] = useState<Profile | null>(() => feeService.getCurrentUser());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLoginSuccess = (_role: UserRole) => {
    setCurrentUser(feeService.getCurrentUser());
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    feeService.logout();
    setCurrentUser(null);
    setMobileMenuOpen(false);
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 overflow-x-hidden">
        
        {currentUser && (
          <Navbar
            currentUser={currentUser}
            mobileMenuOpen={mobileMenuOpen}
            onToggleMobileMenu={() => setMobileMenuOpen(prev => !prev)}
            onLogout={handleLogout}
          />
        )}

        <div className="flex-1 flex min-w-0">
          {currentUser && (
            <Sidebar
              role={currentUser.role}
              mobileOpen={mobileMenuOpen}
              onCloseMobileMenu={() => setMobileMenuOpen(false)}
            />
          )}

          <main className={`flex-1 min-w-0 ${currentUser ? 'p-3 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full' : ''}`}>
            <Routes>
              {/* Root Landing Route */}
              <Route
                path="/"
                element={
                  !currentUser ? (
                    <Navigate to="/login" replace />
                  ) : currentUser.role === 'parent' ? (
                    <Navigate to="/parent/dashboard" replace />
                  ) : currentUser.role === 'student' ? (
                    <Navigate to="/student/dashboard" replace />
                  ) : (
                    <Navigate to="/admin/dashboard" replace />
                  )
                }
              />

              {/* Unauthenticated Routes & Role-Specific Login Routes */}
              <Route path="/login" element={<LoginPage onLoginSuccess={handleLoginSuccess} />} />
              <Route path="/login/admin" element={<LoginPage onLoginSuccess={handleLoginSuccess} />} />
              <Route path="/login/bursar" element={<LoginPage onLoginSuccess={handleLoginSuccess} />} />
              <Route path="/login/parent" element={<LoginPage onLoginSuccess={handleLoginSuccess} />} />
              <Route path="/login/student" element={<LoginPage onLoginSuccess={handleLoginSuccess} />} />
              <Route path="/reset-password" element={<ForgotPasswordPage />} />

              {/* Protected Admin & Bursar Routes */}
              {currentUser && (currentUser.role === 'super_admin' || currentUser.role === 'bursar') && (
                <>
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  <Route path="/admin/students" element={<StudentsListPage />} />
                  <Route path="/admin/students/:id" element={<StudentDetailPage />} />
                  <Route path="/admin/guardians" element={<GuardiansListPage />} />
                  <Route path="/admin/classes" element={<ClassesPage />} />
                  <Route path="/admin/sessions" element={<SessionsPage />} />
                  <Route path="/admin/fee-structures" element={<FeeStructuresPage />} />
                  <Route path="/admin/payments" element={<PaymentsListPage />} />
                  <Route path="/admin/payments/new" element={<RecordPaymentPage />} />
                  <Route path="/admin/reports" element={<ReportsPage />} />
                  <Route path="/admin/settings" element={<SettingsPage />} />
                </>
              )}

              {/* Protected Parent Routes */}
              {currentUser && currentUser.role === 'parent' && (
                <>
                  <Route path="/parent/dashboard" element={<ParentDashboard />} />
                  <Route path="/parent/students/:id" element={<WardFeeDetailPage />} />
                  <Route path="/parent/students/:id/pay" element={<MakePaymentPage />} />
                  <Route path="/parent/payments" element={<PaymentHistoryPage />} />
                  <Route path="/parent/settings" element={<SettingsPage />} />
                </>
              )}

              {/* Protected Student Routes */}
              {currentUser && currentUser.role === 'student' && (
                <>
                  <Route path="/student/dashboard" element={<StudentDashboard />} />
                  <Route path="/student/settings" element={<SettingsPage />} />
                </>
              )}

              {/* Default Fallback Redirect */}
              <Route
                path="*"
                element={
                  !currentUser ? (
                    <Navigate to="/login" replace />
                  ) : currentUser.role === 'parent' ? (
                    <Navigate to="/parent/dashboard" replace />
                  ) : currentUser.role === 'student' ? (
                    <Navigate to="/student/dashboard" replace />
                  ) : (
                    <Navigate to="/admin/dashboard" replace />
                  )
                }
              />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
