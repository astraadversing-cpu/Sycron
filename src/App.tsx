import React, { useState } from 'react';
import { SycronProvider, useSycron } from './context/SycronContext';
import { Header } from './components/layout/Header';
import { MobileNavBar } from './components/layout/MobileNavBar';
import { MobileMenuSheet } from './components/layout/MobileMenuSheet';
import { AuthScreen } from './components/auth/AuthScreen';
import { GlobalSearchModal } from './components/global/GlobalSearchModal';
import { NotificationDrawer } from './components/global/NotificationDrawer';

// Views
import { OverviewDashboard } from './components/dashboard/OverviewDashboard';
import { IntelligenceMap } from './components/map/IntelligenceMap';
import { NetworkMindMap } from './components/network/NetworkMindMap';
import { SecurityAlerts } from './components/alerts/SecurityAlerts';
import { NewsFeed } from './components/news/NewsFeed';
import { IntelligenceChat } from './components/chat/IntelligenceChat';
import { ParticipantsDirectory } from './components/participants/ParticipantsDirectory';
import { ReportsCenter } from './components/reports/ReportsCenter';
import { SubscriptionPlans } from './components/subscription/SubscriptionPlans';
import { AuditLogs } from './components/audit/AuditLogs';
import { SettingsCenter } from './components/settings/SettingsCenter';

const MainContent: React.FC = () => {
  const { isAuthenticated, currentTab, alerts, setIsGlobalSearchOpen } = useSycron();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // If user is not authenticated, show ONLY the Initial Login / Registration Gateway Screen
  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  // Once authenticated, show the mobile platform
  return (
    <div className="min-h-screen bg-[#000000] text-[#FFFFFF] flex flex-col font-sans selection:bg-[#252525] selection:text-white max-w-md mx-auto sm:max-w-xl md:max-w-2xl lg:max-w-4xl xl:max-w-5xl shadow-2xl relative">
      {/* Mobile Top Header */}
      <Header
        onOpenSearch={() => setIsGlobalSearchOpen(true)}
        onOpenNotifications={() => setIsNotifOpen(true)}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
      />

      {/* Mobile View Container */}
      <main className="flex-1 overflow-y-auto bg-[#000000] pb-20">
        <div className="w-full">
          {currentTab === 'dashboard' && <OverviewDashboard />}
          {currentTab === 'map' && (
            <div className="p-3 sm:p-4 w-full h-[calc(100vh-120px)] min-h-[520px] flex flex-col">
              <IntelligenceMap />
            </div>
          )}
          {currentTab === 'network' && (
            <div className="p-3 sm:p-4 w-full h-[calc(100vh-120px)] min-h-[520px] flex flex-col">
              <NetworkMindMap />
            </div>
          )}
          {currentTab === 'alerts' && <SecurityAlerts />}
          {currentTab === 'news' && <NewsFeed />}
          {currentTab === 'chat' && <IntelligenceChat />}
          {currentTab === 'participants' && <ParticipantsDirectory />}
          {currentTab === 'reports' && <ReportsCenter />}
          {currentTab === 'subscription' && <SubscriptionPlans />}
          {currentTab === 'audit' && <AuditLogs />}
          {currentTab === 'settings' && <SettingsCenter />}
        </div>

        {/* Mobile Telemetry Status Bar */}
        <div className="mx-3 my-4 p-3 bg-[#050505] border border-[#252525] rounded-sm text-[10px] text-[#666666] font-mono flex flex-col space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="uppercase tracking-wider text-[#BDBDBD]">SYCRON MOBILE CORE</span>
            <span className="text-white font-bold">
              {alerts.filter((a) => a.priority === 'CRITICAL' && a.status !== 'RESOLVED').length > 0
                ? 'STATUS: THREAT ELEVATED'
                : 'STATUS: NOMINAL'}
            </span>
          </div>
          <div className="flex items-center justify-between text-[9px] text-[#666666] pt-1 border-t border-[#252525]">
            <span>TLS 1.3 ZERO-TRUST ACTIVE</span>
            <span>&copy; 2026 SYCRON</span>
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <MobileNavBar
        onOpenMenu={() => setIsMobileMenuOpen(true)}
        isMenuOpen={isMobileMenuOpen}
      />

      {/* Mobile Menu Slide-up Sheet */}
      <MobileMenuSheet
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Global Modals & Drawers */}
      <GlobalSearchModal />
      <NotificationDrawer isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
    </div>
  );
};

export default function App() {
  return (
    <SycronProvider>
      <MainContent />
    </SycronProvider>
  );
}
