import React, { useState, useEffect, useRef } from 'react';
import { SCHOOL_INFO } from '../../services/mockData';
import { feeService } from '../../services/feeService';
import { Profile, SystemNotification, SystemMessage } from '../../types/database';
import { User, LogOut, Menu, X, Search, Bell, Mail, CheckCircle2, ShieldCheck, CreditCard, Clock, FileText, Database, RefreshCw } from 'lucide-react';

interface NavbarProps {
  currentUser: Profile;
  mobileMenuOpen?: boolean;
  onToggleMobileMenu?: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  mobileMenuOpen,
  onToggleMobileMenu,
  onLogout
}) => {
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showMailDropdown, setShowMailDropdown] = useState(false);

  const [notifications, setNotifications] = useState<SystemNotification[]>(feeService.getNotifications());
  const [messages, setMessages] = useState<SystemMessage[]>(feeService.getMessages());
  const [syncInfo, setSyncInfo] = useState(feeService.getSyncStatus());

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync notifications, messages, and subscribe to feeService updates
  useEffect(() => {
    const updateLocalState = () => {
      setNotifications(feeService.getNotifications());
      setMessages(feeService.getMessages());
      setSyncInfo(feeService.getSyncStatus());
    };

    const unsubscribe = feeService.subscribe(updateLocalState);
    const syncInterval = setInterval(updateLocalState, 2000);

    return () => {
      unsubscribe();
      clearInterval(syncInterval);
    };
  }, []);

  const handleManualSync = () => {
    feeService.pullCloudData(true);
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifDropdown(false);
        setShowMailDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadNotifCount = notifications.filter(n => !n.read).length;
  const unreadMailCount = messages.filter(m => !m.read).length;

  const handleMarkNotifsRead = () => {
    feeService.markNotificationsRead();
    setNotifications(feeService.getNotifications());
  };

  const handleMarkMailsRead = () => {
    feeService.markMessagesRead();
    setMessages(feeService.getMessages());
  };

  return (
    <header className="bg-white text-slate-800 border-b border-slate-100/90 sticky top-0 z-40 shadow-xs backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand & Mobile Hamburger Toggle */}
          <div className="flex items-center space-x-3 shrink-0">
            {onToggleMobileMenu && (
              <button
                onClick={onToggleMobileMenu}
                className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition lg:hidden"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}

            <img
              src={SCHOOL_INFO.logo}
              alt="SFCHS Logo"
              className="w-10 h-10 object-contain rounded-xl bg-white p-0.5 shadow-md shadow-indigo-500/10 border border-slate-100 shrink-0"
            />
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-black text-sm sm:text-base tracking-tight text-slate-900 line-clamp-1">
                  {SCHOOL_INFO.name}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-indigo-600 font-semibold italic hidden sm:block">
                "{SCHOOL_INFO.motto}" &bull; {SCHOOL_INFO.address.split(',')[0]}
              </p>
            </div>
          </div>

          {/* Search Pill */}
          <div className="hidden md:flex items-center bg-slate-100/80 rounded-full px-4 py-2 text-xs text-slate-600 max-w-sm w-full border border-slate-200/50 focus-within:ring-2 focus-within:ring-indigo-500/30 focus-within:bg-white transition">
            <Search className="w-4 h-4 text-slate-400 shrink-0 mr-2" />
            <input
              type="text"
              placeholder="Search portal features, payments, students..."
              className="bg-transparent border-none outline-none w-full text-slate-800 placeholder-slate-400 font-medium"
            />
          </div>

            {/* Quick Action Icons & User Badge */}
            <div className="flex items-center space-x-1.5 sm:space-x-3 shrink-0 relative" ref={dropdownRef}>
              
              {/* Cloud Sync Status Indicator */}
              <button
                onClick={handleManualSync}
                className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold border transition ${
                  syncInfo.status === 'synced'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80 hover:bg-emerald-100/70'
                    : syncInfo.status === 'syncing'
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200/80 hover:bg-indigo-100/70'
                    : 'bg-amber-50 text-amber-700 border-amber-200/80 hover:bg-amber-100/70'
                }`}
                title={
                  syncInfo.status === 'synced'
                    ? 'Connected: All devices synced in real-time. Click to refresh.'
                    : syncInfo.status === 'syncing'
                    ? 'Syncing changes with cloud database...'
                    : 'Local mode active. Click to retry connecting to Supabase cloud.'
                }
              >
                <span className={`w-2 h-2 rounded-full ${
                  syncInfo.status === 'synced' ? 'bg-emerald-500 animate-pulse' : syncInfo.status === 'syncing' ? 'bg-indigo-500 animate-ping' : 'bg-amber-500'
                }`} />
                <span className="capitalize">
                  {syncInfo.status === 'synced' ? 'Cloud Synced' : syncInfo.status === 'syncing' ? 'Syncing...' : 'Local Cache'}
                </span>
                <RefreshCw className={`w-3 h-3 ml-0.5 text-slate-400 ${syncInfo.status === 'syncing' ? 'animate-spin' : ''}`} />
              </button>

              {/* Quick Icon Buttons */}
              <div className="flex items-center space-x-0.5 sm:space-x-1">
                
                {/* Mail Button */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowMailDropdown(prev => !prev);
                      setShowNotifDropdown(false);
                    }}
                    className={`p-2 rounded-full transition relative ${
                      showMailDropdown ? 'text-indigo-600 bg-indigo-50' : 'text-slate-500 hover:text-indigo-600 hover:bg-slate-100'
                    }`}
                    title="Portal Messages & Emails"
                  >
                    <Mail className="w-4 h-4" />
                    {unreadMailCount > 0 && (
                      <span className="min-w-4 h-4 px-1 rounded-full bg-indigo-600 text-white font-extrabold text-[9px] flex items-center justify-center absolute -top-1 -right-1 ring-2 ring-white">
                        {unreadMailCount}
                      </span>
                    )}
                  </button>

                  {/* Mail Dropdown Menu */}
                  {showMailDropdown && (
                    <div className="absolute right-0 mt-3 w-[88vw] sm:w-96 max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
                      <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-indigo-400" />
                          <span className="font-extrabold text-xs">Messages & e-Receipt Logs</span>
                        </div>
                        {unreadMailCount > 0 && (
                          <button
                            onClick={handleMarkMailsRead}
                            className="text-[10px] font-extrabold text-indigo-300 hover:text-white transition"
                          >
                            Mark all as read
                          </button>
                        )}
                      </div>

                      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 text-xs">
                        {messages.length === 0 ? (
                          <div className="p-6 text-center text-slate-400 font-medium">No messages or correspondence.</div>
                        ) : (
                          messages.map(m => (
                            <div
                              key={m.id}
                              className={`p-3.5 space-y-1 transition ${m.read ? 'bg-white' : 'bg-indigo-50/40 font-semibold'}`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-extrabold text-slate-900 text-xs">{m.sender}</span>
                                <span className="text-[10px] text-slate-400 font-medium">{m.time}</span>
                              </div>
                              <p className="font-bold text-slate-800 text-[11px] truncate">{m.subject}</p>
                              <p className="text-slate-500 text-[11px] leading-tight line-clamp-2">{m.preview}</p>
                            </div>
                          ))
                        )}
                      </div>

                      <div className="p-3 bg-slate-50 text-center border-t border-slate-100 text-[11px] text-slate-500 font-bold">
                        Automated Bursary e-Mail Dispatch Active
                      </div>
                    </div>
                  )}
                </div>

                {/* Notification Bell Button */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowNotifDropdown(prev => !prev);
                      setShowMailDropdown(false);
                    }}
                    className={`p-2 rounded-full transition relative ${
                      showNotifDropdown ? 'text-indigo-600 bg-indigo-50' : 'text-slate-500 hover:text-indigo-600 hover:bg-slate-100'
                    }`}
                    title="System Notifications"
                  >
                    <Bell className="w-4 h-4" />
                    {unreadNotifCount > 0 && (
                      <span className="min-w-4 h-4 px-1 rounded-full bg-violet-600 text-white font-extrabold text-[9px] flex items-center justify-center absolute -top-1 -right-1 ring-2 ring-white">
                        {unreadNotifCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Dropdown Menu */}
                  {showNotifDropdown && (
                    <div className="absolute right-0 mt-3 w-[88vw] sm:w-96 max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
                      <div className="p-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Bell className="w-4 h-4 text-violet-200" />
                          <span className="font-extrabold text-xs">Notification Center</span>
                        </div>
                        {unreadNotifCount > 0 && (
                          <button
                            onClick={handleMarkNotifsRead}
                            className="text-[10px] font-extrabold text-violet-200 hover:text-white transition"
                          >
                            Mark all as read
                          </button>
                        )}
                      </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 text-xs">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-slate-400 font-medium">No active notifications.</div>
                      ) : (
                        notifications.map(n => (
                          <div
                            key={n.id}
                            className={`p-3.5 space-y-1 transition ${n.read ? 'bg-white' : 'bg-violet-50/40'}`}
                          >
                            <div className="flex items-center justify-between">
                              <span className={`px-2 py-0.5 rounded-full font-black text-[9px] uppercase tracking-wider ${
                                n.type === 'payment' ? 'bg-emerald-100 text-emerald-700' :
                                n.type === 'billing' ? 'bg-amber-100 text-amber-700' :
                                'bg-violet-100 text-violet-700'
                              }`}>
                                {n.type}
                              </span>
                              <span className="text-[10px] text-slate-400 font-medium">{n.time}</span>
                            </div>
                            <h4 className="font-extrabold text-slate-900 text-xs">{n.title}</h4>
                            <p className="text-slate-600 text-[11px] leading-tight">{n.body}</p>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="p-3 bg-slate-50 text-center border-t border-slate-100 text-[11px] text-slate-500 font-bold">
                      Real-Time Paystack & Bursary Alert Stream
                    </div>
                  </div>
                )}
              </div>

            </div>

            <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

            {/* Current User Info Card */}
            <div className="flex items-center space-x-1.5 sm:space-x-2 bg-slate-50 hover:bg-slate-100/80 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border border-slate-200/60 transition cursor-pointer shrink-0">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-sm shrink-0">
                {currentUser.full_name.charAt(0)}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-bold text-slate-900 leading-tight">{currentUser.full_name}</p>
                <span className={`text-[9px] font-extrabold tracking-wider uppercase px-1.5 py-0.2 rounded-full inline-block ${
                  currentUser.role === 'super_admin' ? 'bg-indigo-100 text-indigo-700' :
                  currentUser.role === 'bursar' ? 'bg-emerald-100 text-emerald-700' :
                  'bg-violet-100 text-violet-700'
                }`}>
                  {currentUser.role.replace('_', ' ')}
                </span>
              </div>
            </div>

            {/* Logout button */}
            <button
              onClick={onLogout}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
