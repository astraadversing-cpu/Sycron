import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  ChevronDown,
  Shield,
  CheckCircle2,
  LogOut,
  Settings,
  CreditCard,
  FileText,
} from 'lucide-react';
import { useSycron } from '../../context/SycronContext';
import { UserRole } from '../../types';

interface HeaderProps {
  onOpenSearch?: () => void;
  onOpenNotifications: () => void;
  onOpenMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenNotifications, onOpenSearch }) => {
  const {
    currentUser,
    switchUserRole,
    setIsGlobalSearchOpen,
    unreadNotifsCount,
    logout,
    setCurrentTab,
    alerts,
  } = useSycron();

  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const roleRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const criticalAlertsCount = alerts.filter(
    (a) => a.priority === 'CRITICAL' && a.status !== 'RESOLVED'
  ).length;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (roleRef.current && !roleRef.current.contains(e.target as Node)) {
        setRoleDropdownOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const roles: UserRole[] = ['User', 'Contributor', 'Analyst', 'Moderator', 'Administrator'];

  const handleSearchClick = () => {
    if (onOpenSearch) onOpenSearch();
    else setIsGlobalSearchOpen(true);
  };

  return (
    <header
      id="sycron-main-header"
      className="h-14 bg-[#000000] border-b border-[#252525] px-3 sm:px-4 flex items-center justify-between z-30 sticky top-0"
    >
      {/* Left: Mobile Brand & System Status */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        <div
          id="brand-logo-container"
          onClick={() => setCurrentTab('dashboard')}
          className="flex items-center space-x-2 cursor-pointer select-none"
        >
          <div className="w-8 h-8 rounded-sm bg-[#111111] border border-[#252525] flex items-center justify-center text-white font-mono font-bold text-xs tracking-tighter">
            SY
          </div>
          <div className="flex flex-col">
            <span className="font-mono text-xs sm:text-sm font-bold tracking-wider text-white leading-tight">
              SYCRON
            </span>
            <span className="text-[8px] sm:text-[9px] text-[#666666] uppercase tracking-wider leading-none">
              Mobile Intel
            </span>
          </div>
        </div>

        {/* Tactical status pill */}
        <div className="hidden xs:flex items-center space-x-1.5 px-2 py-0.5 rounded-sm bg-[#050505] border border-[#252525] text-[9px] font-mono text-[#BDBDBD]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FFFFFF] animate-pulse" />
          <span className="uppercase text-[#666666] hidden sm:inline">NET:</span>
          <span className="font-bold text-white">ONLINE</span>
        </div>

        {criticalAlertsCount > 0 && (
          <div
            onClick={() => setCurrentTab('alerts')}
            className="flex items-center space-x-1 px-1.5 py-0.5 rounded-sm bg-[#FFFFFF] text-[#000000] text-[9px] font-mono font-bold cursor-pointer"
          >
            <span>!</span>
            <span>{criticalAlertsCount} CRÍTICO</span>
          </div>
        )}
      </div>

      {/* Right: Quick Search, Role Switcher, Notifications, User */}
      <div className="flex items-center space-x-1.5 sm:space-x-2.5">
        {/* Quick Search Button */}
        <button
          id="btn-mobile-search"
          onClick={handleSearchClick}
          className="p-2 min-w-[36px] min-h-[36px] rounded-sm text-[#BDBDBD] hover:text-white bg-[#050505] border border-[#252525] flex items-center justify-center transition-colors"
          title="Buscar no Sistema"
          aria-label="Buscar"
        >
          <Search size={15} />
        </button>

        {/* Role Switcher */}
        <div className="relative" ref={roleRef}>
          <button
            id="btn-role-switcher"
            onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
            className="flex items-center space-x-1 px-2 py-1.5 min-h-[36px] rounded-sm bg-[#050505] border border-[#252525] text-[10px] font-mono text-[#BDBDBD] hover:text-white transition-colors"
            title="Nível de Acesso (RBAC)"
          >
            <Shield size={12} className="text-[#666666]" />
            <span className="uppercase font-bold text-white max-w-[65px] sm:max-w-none truncate">
              {currentUser.role}
            </span>
            <ChevronDown size={10} className="text-[#666666]" />
          </button>

          {roleDropdownOpen && (
            <div
              id="role-dropdown-menu"
              className="absolute right-0 mt-1.5 w-48 bg-[#000000] border border-[#252525] rounded-sm shadow-2xl py-1 z-50 text-xs font-mono"
            >
              <div className="px-3 py-1.5 border-b border-[#252525] text-[9px] text-[#666666] uppercase tracking-wider">
                Simular Nível de Acesso
              </div>
              {roles.map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    switchUserRole(r);
                    setRoleDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-[#111111] transition-colors ${
                    currentUser.role === r ? 'text-white bg-[#252525]/40 font-semibold' : 'text-[#BDBDBD]'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FFFFFF] opacity-80" />
                    <span>{r}</span>
                  </div>
                  {currentUser.role === r && <CheckCircle2 size={12} className="text-white" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications */}
        <button
          id="btn-header-notifications"
          onClick={onOpenNotifications}
          className="relative p-2 min-w-[36px] min-h-[36px] rounded-sm text-[#BDBDBD] hover:text-white bg-[#050505] border border-[#252525] flex items-center justify-center transition-colors"
          title="Notificações"
          aria-label="Notificações"
        >
          <Bell size={15} />
          {unreadNotifsCount > 0 && (
            <span
              id="unread-notif-badge"
              className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#FFFFFF] text-[#000000] font-mono text-[8px] font-bold rounded-full flex items-center justify-center"
            >
              {unreadNotifsCount}
            </span>
          )}
        </button>

        {/* User Avatar Circle */}
        <div className="relative" ref={profileRef}>
          <button
            id="btn-user-profile-menu"
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="w-8 h-8 rounded-full border border-[#252525] bg-[#111111] hover:border-[#FFFFFF] flex items-center justify-center text-[10px] font-bold text-white transition-colors"
          >
            {currentUser.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .slice(0, 2)
              .toUpperCase()}
          </button>

          {profileDropdownOpen && (
            <div
              id="profile-dropdown-menu"
              className="absolute right-0 mt-1.5 w-56 bg-[#000000] border border-[#252525] rounded-sm shadow-2xl py-1 z-50 text-xs font-mono"
            >
              <div className="px-3 py-2 border-b border-[#252525]">
                <div className="font-bold text-white text-xs">{currentUser.name}</div>
                <div className="text-[10px] text-[#666666] truncate">{currentUser.email}</div>
                <div className="mt-1 flex items-center space-x-1.5">
                  <span className="px-1.5 py-0.2 bg-[#252525] text-[#BDBDBD] text-[8px] uppercase tracking-wider rounded-sm font-bold">
                    {currentUser.plan}
                  </span>
                  <span className="text-[9px] text-[#666666]">ID: {currentUser.id}</span>
                </div>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setCurrentTab('settings');
                    setProfileDropdownOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 flex items-center space-x-2 text-[#BDBDBD] hover:text-white hover:bg-[#111111] transition-colors"
                >
                  <Settings size={13} className="text-[#666666]" />
                  <span>Configurações</span>
                </button>

                <button
                  onClick={() => {
                    setCurrentTab('subscription');
                    setProfileDropdownOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 flex items-center space-x-2 text-[#BDBDBD] hover:text-white hover:bg-[#111111] transition-colors"
                >
                  <CreditCard size={13} className="text-[#666666]" />
                  <span>Assinatura</span>
                </button>

                <button
                  onClick={() => {
                    setCurrentTab('reports');
                    setProfileDropdownOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 flex items-center space-x-2 text-[#BDBDBD] hover:text-white hover:bg-[#111111] transition-colors"
                >
                  <FileText size={13} className="text-[#666666]" />
                  <span>Relatórios</span>
                </button>
              </div>

              <div className="border-t border-[#252525] pt-1">
                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    logout();
                  }}
                  className="w-full text-left px-3 py-2 flex items-center space-x-2 text-[#666666] hover:text-white hover:bg-[#111111] transition-colors"
                >
                  <LogOut size={13} />
                  <span className="uppercase text-[10px]">Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
