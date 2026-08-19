import React from 'react';
import {
  Newspaper,
  MessageSquare,
  Users,
  FileText,
  CreditCard,
  ShieldCheck,
  Settings,
  LogOut,
  X,
  Shield,
  Radio,
  ChevronRight,
  Lock,
} from 'lucide-react';
import { useSycron, ActiveTab } from '../../context/SycronContext';
import { UserRole } from '../../types';

interface MobileMenuSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileMenuSheet: React.FC<MobileMenuSheetProps> = ({ isOpen, onClose }) => {
  const {
    currentTab,
    setCurrentTab,
    currentUser,
    switchUserRole,
    logout,
    alerts,
    nodes,
  } = useSycron();

  if (!isOpen) return null;

  const secondaryNavItems: Array<{
    id: ActiveTab;
    label: string;
    description: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    badge?: string;
  }> = [
    {
      id: 'news',
      label: 'News Feed',
      description: 'Publicações de inteligência cibernética',
      icon: Newspaper,
    },
    {
      id: 'chat',
      label: 'Intelligence Chat',
      description: 'Canais criptografados & telemetria',
      icon: MessageSquare,
      badge: 'LIVE',
    },
    {
      id: 'participants',
      label: 'Participantes & RBAC',
      description: 'Diretório de analistas & permissões',
      icon: Users,
    },
    {
      id: 'reports',
      label: 'Relatórios Forenses',
      description: 'Geração & download de relatórios PDF',
      icon: FileText,
    },
    {
      id: 'subscription',
      label: 'Planos & Licenciamento',
      description: 'Gestão de assinatura e faturas',
      icon: CreditCard,
      badge: currentUser.plan,
    },
    {
      id: 'audit',
      label: 'Auditoria SHA-256',
      description: 'Ledger imutável de eventos e acessos',
      icon: ShieldCheck,
    },
    {
      id: 'settings',
      label: 'Configurações de Segurança',
      description: '2FA, chaves de API e sessões ativas',
      icon: Settings,
    },
  ];

  const roles: UserRole[] = ['User', 'Contributor', 'Analyst', 'Moderator', 'Administrator'];

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop */}
      <div
        id="mobile-menu-backdrop"
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-xs transition-opacity"
      />

      {/* Slide-up Container */}
      <div
        id="mobile-menu-sheet-panel"
        className="relative bg-[#050505] border-t border-[#252525] rounded-t-2xl max-h-[85vh] flex flex-col z-50 overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-200"
      >
        {/* Handle Bar */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-[#333333] rounded-full" />
        </div>

        {/* Sheet Header */}
        <div className="px-5 py-3 border-b border-[#252525] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-sm bg-[#111111] border border-[#252525] flex items-center justify-center text-xs font-bold text-white font-mono">
              SY
            </div>
            <div>
              <h2 className="text-sm font-bold text-white font-mono tracking-wider">
                SYCRON MODULES
              </h2>
              <p className="text-[10px] text-[#666666] uppercase tracking-wider">
                Menu de Navegação Operacional
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-sm text-[#BDBDBD] hover:text-white bg-[#111111] border border-[#252525] min-w-[36px] min-h-[36px] flex items-center justify-center"
            aria-label="Fechar Menu"
          >
            <X size={16} />
          </button>
        </div>

        {/* Sheet Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 pb-12">
          {/* User Quick Card */}
          <div className="p-3 bg-[#000000] border border-[#252525] rounded-sm flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-full bg-[#111111] border border-[#252525] flex items-center justify-center text-xs font-bold text-white font-mono">
                {currentUser.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="font-bold text-white text-xs truncate font-mono">
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-[#666666] truncate">{currentUser.email}</div>
              </div>
            </div>

            <div className="flex items-center space-x-1.5">
              <span className="px-2 py-0.5 bg-[#252525] text-[#FFFFFF] text-[9px] font-mono font-bold rounded-sm border border-[#333333]">
                {currentUser.plan}
              </span>
            </div>
          </div>

          {/* Role Switcher on Mobile */}
          <div className="p-3 bg-[#000000] border border-[#252525] rounded-sm space-y-2">
            <div className="flex items-center justify-between text-[10px] text-[#666666] font-mono uppercase tracking-wider">
              <span className="flex items-center space-x-1">
                <Shield size={12} className="text-[#BDBDBD]" />
                <span>Nível de Permissão (RBAC)</span>
              </span>
              <span className="text-white font-bold">{currentUser.role}</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 pt-1">
              {roles.map((r) => (
                <button
                  key={r}
                  onClick={() => switchUserRole(r)}
                  className={`py-1.5 px-2 rounded-sm text-[10px] font-mono text-center transition-colors min-h-[36px] flex items-center justify-center ${
                    currentUser.role === r
                      ? 'bg-[#FFFFFF] text-[#000000] font-bold'
                      : 'bg-[#111111] text-[#BDBDBD] border border-[#252525] hover:border-[#666666]'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Module Navigation List */}
          <div className="space-y-1.5">
            <div className="text-[10px] text-[#666666] font-mono uppercase tracking-wider px-1">
              Módulos do Sistema
            </div>

            {secondaryNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;

              return (
                <button
                  key={item.id}
                  id={`mobile-sheet-item-${item.id}`}
                  onClick={() => {
                    setCurrentTab(item.id);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-sm transition-colors text-left min-h-[48px] ${
                    isActive
                      ? 'bg-[#FFFFFF10] border border-[#FFFFFF] text-white'
                      : 'bg-[#000000] border border-[#252525] text-[#BDBDBD] hover:text-white hover:bg-[#111111]'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-8 h-8 rounded-sm flex items-center justify-center ${
                        isActive ? 'bg-[#FFFFFF] text-[#000000]' : 'bg-[#111111] text-[#BDBDBD]'
                      }`}
                    >
                      <Icon size={16} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white font-mono flex items-center space-x-2">
                        <span>{item.label}</span>
                        {item.badge && (
                          <span className="text-[8px] bg-[#252525] text-[#FFFFFF] px-1.5 py-0.2 rounded-sm font-bold uppercase">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-[#666666]">{item.description}</div>
                    </div>
                  </div>

                  <ChevronRight size={16} className="text-[#666666]" />
                </button>
              );
            })}
          </div>

          {/* Bottom Telemetry & Logout */}
          <div className="pt-2 border-t border-[#252525] space-y-2">
            <div className="flex items-center justify-between text-[10px] font-mono text-[#666666] px-1">
              <span className="flex items-center space-x-1">
                <Radio size={11} className="text-white" />
                <span>MESH: ONLINE 256-BIT</span>
              </span>
              <span>{nodes.length} NÓS | {alerts.length} ALERTAS</span>
            </div>

            <button
              onClick={() => {
                onClose();
                logout();
              }}
              className="w-full flex items-center justify-center space-x-2 py-3 bg-[#111111] border border-[#252525] hover:border-[#666666] text-[#BDBDBD] hover:text-white rounded-sm text-xs font-mono font-bold uppercase tracking-wider min-h-[44px] transition-colors"
            >
              <LogOut size={14} />
              <span>Encerrar Sessão</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
