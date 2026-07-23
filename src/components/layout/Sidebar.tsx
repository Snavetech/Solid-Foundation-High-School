import React from 'react';
import { NavLink } from 'react-router-dom';
import { UserRole } from '../../types/database';
import {
  LayoutDashboard, Users, UserCheck, GraduationCap, Calendar,
  CreditCard, Receipt, FileText, PlusCircle, Settings, ShieldCheck, X, Sparkles
} from 'lucide-react';

interface SidebarProps {
  role: UserRole;
  mobileOpen?: boolean;
  onCloseMobileMenu?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ role, mobileOpen, onCloseMobileMenu }) => {
  const isAdminOrBursar = role === 'super_admin' || role === 'bursar';

  const mainNavItems = isAdminOrBursar
    ? [
        { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/admin/students', label: 'Students', icon: GraduationCap },
        { to: '/admin/guardians', label: 'Guardians', icon: Users },
        { to: '/admin/classes', label: 'Classes & Arms', icon: UserCheck },
        { to: '/admin/sessions', label: 'Sessions & Terms', icon: Calendar }
      ]
    : role === 'student'
    ? [
        { to: '/student/dashboard', label: 'Fee Status & Ledger', icon: LayoutDashboard }
      ]
    : [
        { to: '/parent/dashboard', label: 'My Wards Overview', icon: LayoutDashboard }
      ];

  const financialNavItems = isAdminOrBursar
    ? [
        { to: '/admin/fee-structures', label: 'Fee Structures', icon: CreditCard },
        { to: '/admin/payments', label: 'Payments Ledger', icon: Receipt },
        { to: '/admin/payments/new', label: 'Record Bank Payment', icon: PlusCircle },
        { to: '/admin/reports', label: 'Financial Reports', icon: FileText }
      ]
    : role === 'parent'
    ? [
        { to: '/parent/payments', label: 'Payment Receipts', icon: Receipt }
      ]
    : [];

  const settingsNavItems = [
    { 
      to: isAdminOrBursar ? '/admin/settings' : role === 'student' ? '/student/settings' : '/parent/settings', 
      label: 'Settings & Security', 
      icon: Settings 
    }
  ];

  const renderNavGroup = (title: string, items: { to: string; label: string; icon: any }[]) => (
    <div className="space-y-1">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3.5 py-1">
        {title}
      </p>
      {items.map(item => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onCloseMobileMenu}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-3.5 py-2.5 rounded-2xl text-xs transition-all duration-150 ${
                isActive
                  ? 'bg-violet-50 text-violet-700 font-extrabold shadow-xs border border-violet-100/80'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-semibold'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-violet-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        );
      })}
    </div>
  );

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between p-4 space-y-6">
      <div className="space-y-5">
        
        {/* Mobile Header Close Button */}
        <div className="flex items-center justify-between px-3 py-1 lg:hidden">
          <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-violet-600" /> Portal Menu
          </span>
          {onCloseMobileMenu && (
            <button
              onClick={onCloseMobileMenu}
              className="p-1.5 text-slate-400 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Navigation Sections */}
        <nav className="space-y-4">
          {renderNavGroup(isAdminOrBursar ? 'OVERVIEW' : 'PORTAL', mainNavItems)}
          {financialNavItems.length > 0 && renderNavGroup('FINANCIALS', financialNavItems)}
          {renderNavGroup('PREFERENCES', settingsNavItems)}
        </nav>
      </div>

      {/* Footer Info Box */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-br from-violet-50/80 to-indigo-50/80 border border-violet-100 text-xs text-slate-600 space-y-1">
        <div className="flex items-center gap-1.5 font-bold text-violet-900">
          <ShieldCheck className="w-4 h-4 text-violet-600" />
          <span>Paystack Secured</span>
        </div>
        <p className="text-[11px] leading-tight text-slate-500 font-medium">
          End-to-end encrypted school fee management & digital receipting.
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Static Sidebar (lg:flex) */}
      <aside className="hidden lg:flex w-60 bg-white border-r border-slate-100/90 min-h-[calc(100vh-4rem)] flex-col no-print shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay (< lg) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobileMenu}
          />
          {/* Mobile Drawer */}
          <aside className="relative w-64 max-w-[80vw] bg-white h-full border-r border-slate-100 shadow-2xl z-10 no-print animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};
