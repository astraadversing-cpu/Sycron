import React from 'react';
import {
  LayoutDashboard,
  Map as MapIcon,
  Share2,
  AlertTriangle,
  Newspaper,
  MessageSquare,
  Users,
  FileText,
  CreditCard,
  ShieldCheck,
  Settings,
  LogOut,
  Lock,
} from 'lucide-react';
import { useSycron, ActiveTab } from '../../context/SycronContext';

export const Sidebar: React.FC = () => {
  const {
    currentTab,
    setCurrentTab,
    sidebarOpen,
    setSidebarOpen,
    alerts,
    nodes,
    currentUser,
    logout,
  } = useSycron();

  const navItems: Array<{
    id: ActiveTab;
    label: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    badge?: string | number;
  }> = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'map',
      label: 'Intelligence Map',
      icon: MapIcon,
    },
    {
      id: 'network',
      label: 'Network Data',
      icon: Share2,
      badge: nodes.length,
    },
    {
      id: 'alerts',
      label: 'Security Alerts',
      icon: AlertTriangle,
      badge: alerts.filter((a) => a.status !== 'RESOLVED').length,
    },
    {
      id: 'news',
      label: 'News Feed',
      icon: Newspaper,
    },
    {
      id: 'chat',
      label: 'Intelligence Chat',
      icon: MessageSquare,
    },
    {
      id: 'participants',
      label: 'Participants',
      icon: Users,
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: FileText,
    },
    {
      id: 'subscription',
      label: 'Subscription',
      icon: CreditCard,
      badge: currentUser.plan,
    },
    {
      id: 'audit',
      label: 'Audit Ledger',
      icon: ShieldCheck,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
    },
  ];

  return (
    <>
      {/* Mobile overlay backdrop */}
      {sidebarOpen && (
        <div
          id="sidebar-mobile-backdrop"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/80 z-20 lg:hidden backdrop-blur-xs"
        />
      )}

      <aside
        id="sycron-sidebar"
        className={`fixed lg:static top-16 bottom-0 left-0 w-[230px] bg-[#000000] border-r border-[#252525] flex flex-col justify-between z-25 transition-transform duration-200 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto pt-4 pb-2">
          <div className="px-5 mb-4">
            <h1 className="text-xl font-bold tracking-tighter text-white font-mono">SYCRON</h1>
            <p className="text-[10px] text-[#666666] uppercase tracking-[0.2em] mt-0.5">
              Intelligence Network
            </p>
          </div>

          <nav className="px-3 space-y-1">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;

              return (
                <button
                  key={item.id}
                  id={`sidebar-nav-${item.id}`}
                  onClick={() => {
                    setCurrentTab(item.id);
                    if (window.innerWidth < 1024) {
                      setSidebarOpen(false);
                    }
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs transition-colors text-left cursor-pointer ${
                    isActive
                      ? 'bg-[#FFFFFF10] border-l-2 border-[#FFFFFF] text-[#FFFFFF] font-medium'
                      : 'text-[#BDBDBD] hover:text-white hover:bg-[#FFFFFF05] border-l-2 border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        isActive ? 'bg-[#FFFFFF]' : 'border border-[#BDBDBD]'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge !== undefined && (
                    <span
                      className={`text-[9px] px-1.5 py-0.2 font-bold rounded-sm ${
                        isActive
                          ? 'bg-[#FFFFFF] text-[#000000]'
                          : 'bg-[#111111] border border-[#252525] text-[#BDBDBD]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom subscription & user card */}
        <div className="p-4 border-t border-[#252525] bg-[#000000]">
          <div className="bg-[#252525] p-3 rounded-sm mb-3">
            <p className="text-[10px] text-[#BDBDBD] uppercase mb-0.5 tracking-wider">Subscription</p>
            <p className="text-xs font-bold text-white tracking-tight">SYCRON {currentUser.plan}</p>
            <p className="text-[10px] text-[#666666] mt-0.5">Renewal: 25/09/2026</p>
          </div>

          <button
            id="sidebar-logout-btn"
            onClick={logout}
            className="w-full flex items-center space-x-2.5 px-3 py-1.5 text-xs text-[#666666] hover:text-white cursor-pointer transition-colors"
          >
            <LogOut size={13} />
            <span className="uppercase tracking-wider text-[11px]">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};
