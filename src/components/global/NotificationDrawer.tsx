import React from 'react';
import {
  Bell,
  X,
  CheckCheck,
  AlertTriangle,
  Share2,
  Newspaper,
  CreditCard,
  FileText,
  Shield,
  ArrowRight,
} from 'lucide-react';
import { useSycron } from '../../context/SycronContext';
import { NotificationItem } from '../../types';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const {
    notifications,
    unreadNotifsCount,
    markNotifAsRead,
    markAllNotifsAsRead,
    setCurrentTab,
    focusEntity,
  } = useSycron();

  if (!isOpen) return null;

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'ALERT':
        return <AlertTriangle size={15} className="text-white" />;
      case 'NETWORK':
        return <Share2 size={15} className="text-neutral-300" />;
      case 'NEWS':
        return <Newspaper size={15} className="text-neutral-300" />;
      case 'SUBSCRIPTION':
        return <CreditCard size={15} className="text-neutral-300" />;
      case 'REPORT':
        return <FileText size={15} className="text-neutral-300" />;
      default:
        return <Shield size={15} className="text-neutral-300" />;
    }
  };

  const handleNotificationClick = (notif: NotificationItem) => {
    markNotifAsRead(notif.id);
    if (notif.linkTab) {
      if (notif.targetId) {
        if (notif.linkTab === 'alerts') focusEntity('alert', notif.targetId);
        else if (notif.linkTab === 'network') focusEntity('node', notif.targetId);
        else if (notif.linkTab === 'news') focusEntity('news', notif.targetId);
        else if (notif.linkTab === 'reports') setCurrentTab('reports');
        else setCurrentTab(notif.linkTab as any);
      } else {
        setCurrentTab(notif.linkTab as any);
      }
    }
    onClose();
  };

  return (
    <>
      <div
        id="notification-backdrop"
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-xs z-40 transition-opacity"
      />
      <div
        id="notification-drawer"
        className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-neutral-950 border-l border-neutral-800 z-50 flex flex-col shadow-2xl"
      >
        {/* Header */}
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell size={16} className="text-white" />
            <span className="font-mono text-sm font-bold text-white uppercase tracking-wider">
              Notificações
            </span>
            {unreadNotifsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded bg-white text-black font-mono text-[10px] font-bold">
                {unreadNotifsCount} novas
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {unreadNotifsCount > 0 && (
              <button
                onClick={markAllNotifsAsRead}
                className="p-1 rounded text-neutral-400 hover:text-white transition-colors text-xs font-mono flex items-center gap-1"
                title="Marcar todas como lidas"
              >
                <CheckCheck size={14} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded text-neutral-400 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {notifications.length === 0 ? (
            <div className="py-12 text-center text-xs font-mono text-neutral-400">
              Nenhuma notificação registrada no momento.
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`p-3 rounded border transition-all cursor-pointer group ${
                  !notif.read
                    ? 'bg-neutral-900 border-neutral-700 text-white shadow-xs'
                    : 'bg-neutral-950/80 border-neutral-800/60 text-neutral-300 hover:border-neutral-700 hover:bg-neutral-900/50'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 rounded bg-neutral-800 border border-neutral-700 mt-0.5 shrink-0">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-semibold text-white truncate pr-2">
                        {notif.title}
                      </span>
                      <span className="text-[10px] font-mono text-neutral-400 shrink-0">
                        {notif.timestamp}
                      </span>
                    </div>
                    <p className="text-[11px] font-mono text-neutral-400 line-clamp-2 leading-relaxed">
                      {notif.message}
                    </p>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[9px] font-mono text-neutral-400 uppercase tracking-wider">
                        {notif.type}
                      </span>
                      <div className="flex items-center gap-1 text-[10px] font-mono text-neutral-300 group-hover:text-white">
                        <span>Acessar</span>
                        <ArrowRight size={10} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-neutral-800 bg-black text-center">
          <span className="text-[10px] font-mono text-neutral-400">
            Feed de telemetria sincronizado via WebSocket seguro
          </span>
        </div>
      </div>
    </>
  );
};
