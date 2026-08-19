import React from 'react';
import {
  LayoutDashboard,
  Map as MapIcon,
  Share2,
  AlertTriangle,
  Menu,
} from 'lucide-react';
import { useSycron, ActiveTab } from '../../context/SycronContext';

interface MobileNavBarProps {
  onOpenMenu: () => void;
  isMenuOpen: boolean;
}

export const MobileNavBar: React.FC<MobileNavBarProps> = ({ onOpenMenu, isMenuOpen }) => {
  const { currentTab, setCurrentTab, alerts, nodes } = useSycron();

  const activeAlertsCount = alerts.filter((a) => a.status !== 'RESOLVED').length;

  const mainTabs: Array<{
    id: ActiveTab;
    label: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    badge?: number;
  }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'map', label: 'Mapa', icon: MapIcon },
    { id: 'network', label: 'Rede', icon: Share2, badge: nodes.length },
    { id: 'alerts', label: 'Alertas', icon: AlertTriangle, badge: activeAlertsCount },
  ];

  const isOtherTabActive = !mainTabs.some((t) => t.id === currentTab);

  return (
    <nav
      id="mobile-bottom-nav"
      className="fixed bottom-0 left-0 right-0 h-16 bg-[#000000]/95 backdrop-blur-md border-t border-[#252525] flex items-center justify-around z-40 px-2 pb-safe select-none"
    >
      {mainTabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.id && !isMenuOpen;

        return (
          <button
            key={tab.id}
            id={`mobile-tab-${tab.id}`}
            onClick={() => {
              setCurrentTab(tab.id);
            }}
            className={`flex-1 flex flex-col items-center justify-center h-full py-1 min-w-[60px] min-h-[44px] relative transition-colors ${
              isActive ? 'text-[#FFFFFF]' : 'text-[#666666] hover:text-[#BDBDBD]'
            }`}
          >
            {isActive && (
              <span className="absolute top-0 w-8 h-0.5 bg-[#FFFFFF] rounded-full" />
            )}

            <div className="relative flex items-center justify-center">
              <Icon size={20} className={isActive ? 'text-[#FFFFFF]' : 'text-[#666666]'} />
              {tab.badge !== undefined && tab.badge > 0 && (
                <span
                  className={`absolute -top-1.5 -right-2.5 min-w-[15px] h-[15px] px-1 rounded-full text-[8px] font-mono font-bold flex items-center justify-center ${
                    tab.id === 'alerts'
                      ? 'bg-[#FFFFFF] text-[#000000]'
                      : 'bg-[#252525] text-[#FFFFFF] border border-[#333333]'
                  }`}
                >
                  {tab.badge > 99 ? '99+' : tab.badge}
                </span>
              )}
            </div>

            <span className="text-[10px] font-mono mt-1 tracking-tight font-medium">
              {tab.label}
            </span>
          </button>
        );
      })}

      {/* Menu / Mais Tab */}
      <button
        id="mobile-tab-menu"
        onClick={onOpenMenu}
        className={`flex-1 flex flex-col items-center justify-center h-full py-1 min-w-[60px] min-h-[44px] relative transition-colors ${
          isMenuOpen || isOtherTabActive ? 'text-[#FFFFFF]' : 'text-[#666666] hover:text-[#BDBDBD]'
        }`}
      >
        {(isMenuOpen || isOtherTabActive) && (
          <span className="absolute top-0 w-8 h-0.5 bg-[#FFFFFF] rounded-full" />
        )}

        <div className="relative flex items-center justify-center">
          <Menu size={20} className={isMenuOpen || isOtherTabActive ? 'text-[#FFFFFF]' : 'text-[#666666]'} />
          {isOtherTabActive && !isMenuOpen && (
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#FFFFFF]" />
          )}
        </div>

        <span className="text-[10px] font-mono mt-1 tracking-tight font-medium">
          Mais
        </span>
      </button>
    </nav>
  );
};
