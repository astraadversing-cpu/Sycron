import React from 'react';
import {
  AlertTriangle,
  Share2,
  Users,
  ArrowUpRight,
  CheckCircle2,
  Plus,
  Compass,
  FileText,
} from 'lucide-react';
import { useSycron } from '../../context/SycronContext';
import { IntelligenceMap } from '../map/IntelligenceMap';
import { NetworkMindMap } from '../network/NetworkMindMap';

export const OverviewDashboard: React.FC = () => {
  const {
    alerts,
    nodes,
    participants,
    news,
    setCurrentTab,
    focusEntity,
  } = useSycron();

  const activeAlerts = alerts.filter((a) => a.status !== 'RESOLVED');
  const criticalAlerts = alerts.filter((a) => a.priority === 'CRITICAL' && a.status !== 'RESOLVED');
  const totalConfirmations = alerts.reduce((acc, a) => acc + a.confirmations, 0);

  return (
    <div id="overview-dashboard-view" className="space-y-3 sm:space-y-4 p-3 sm:p-4 max-w-7xl mx-auto font-sans text-xs">
      {/* Top Banner & Quick Status */}
      <div className="p-3.5 sm:p-4 rounded-sm bg-[#050505] border border-[#252525] space-y-2.5">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-[#666666]">
              OPERATIONAL ENVIRONMENT
            </span>
            <span className="px-1.5 py-0.5 rounded-sm bg-[#252525] border border-[#333333] text-[8px] sm:text-[9px] text-[#FFFFFF] font-mono font-bold">
              ZERO-TRUST V4
            </span>
          </div>
          <h1 className="text-sm sm:text-base font-bold text-white tracking-tight font-mono">
            SYCRON / Mobile Command & Telemetry
          </h1>
          <p className="text-[11px] text-[#BDBDBD]">
            6 setores estratégicos &bull; {nodes.length} nós ativos em tempo real.
          </p>
        </div>

        {/* Quick Action Shortcuts */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            id="btn-dash-new-alert"
            onClick={() => setCurrentTab('alerts')}
            className="py-2.5 px-3 bg-[#FFFFFF] text-black font-bold rounded-sm hover:bg-[#E0E0E0] text-xs flex items-center justify-center space-x-1.5 transition-colors uppercase tracking-wider cursor-pointer min-h-[44px]"
          >
            <Plus size={14} />
            <span>Novo Alerta</span>
          </button>
          <button
            id="btn-dash-open-network"
            onClick={() => setCurrentTab('network')}
            className="py-2.5 px-3 bg-[#111111] border border-[#252525] hover:border-[#666666] text-[#FFFFFF] rounded-sm text-xs flex items-center justify-center space-x-1.5 transition-colors uppercase tracking-wider cursor-pointer min-h-[44px]"
          >
            <Share2 size={14} />
            <span>Mind Map</span>
          </button>
        </div>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="p-3 sm:p-3.5 rounded-sm bg-[#050505] border border-[#252525] space-y-1">
          <div className="flex items-center justify-between text-[#666666] text-[9px] sm:text-[10px] uppercase tracking-wider">
            <span>Ameaças</span>
            <AlertTriangle size={13} className="text-[#FFFFFF]" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white font-mono">{activeAlerts.length}</div>
          <div className="text-[10px] text-[#BDBDBD] truncate">
            <strong className="text-white">{criticalAlerts.length}</strong> críticas
          </div>
        </div>

        <div className="p-3 sm:p-3.5 rounded-sm bg-[#050505] border border-[#252525] space-y-1">
          <div className="flex items-center justify-between text-[#666666] text-[9px] sm:text-[10px] uppercase tracking-wider">
            <span>Teia / Nós</span>
            <Share2 size={13} className="text-[#BDBDBD]" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white font-mono">{nodes.length}</div>
          <div className="text-[10px] text-[#BDBDBD] truncate">
            Nós conectados
          </div>
        </div>

        <div className="p-3 sm:p-3.5 rounded-sm bg-[#050505] border border-[#252525] space-y-1">
          <div className="flex items-center justify-between text-[#666666] text-[9px] sm:text-[10px] uppercase tracking-wider">
            <span>Analistas</span>
            <Users size={13} className="text-[#BDBDBD]" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white font-mono">
            {participants.filter((p) => p.status === 'ONLINE').length}
          </div>
          <div className="text-[10px] text-[#BDBDBD] truncate">
            Centros ativos
          </div>
        </div>

        <div className="p-3 sm:p-3.5 rounded-sm bg-[#050505] border border-[#252525] space-y-1">
          <div className="flex items-center justify-between text-[#666666] text-[9px] sm:text-[10px] uppercase tracking-wider">
            <span>Confiabilidade</span>
            <CheckCircle2 size={13} className="text-[#BDBDBD]" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white font-mono">{totalConfirmations}</div>
          <div className="text-[10px] text-[#BDBDBD] truncate">
            Índice 96.8%
          </div>
        </div>
      </div>

      {/* Central View: Mini Map + Network Mind Map Preview */}
      <div className="space-y-3">
        {/* Intelligence Map Widget */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center space-x-1.5">
              <Compass size={13} className="text-white" />
              <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Geografia de Risco & Setores
              </span>
            </div>
            <button
              onClick={() => setCurrentTab('map')}
              className="text-[10px] text-[#BDBDBD] hover:text-white flex items-center space-x-1 transition-colors cursor-pointer py-1"
            >
              <span>Expandir</span>
              <ArrowUpRight size={11} />
            </button>
          </div>
          <div className="h-[280px] sm:h-[320px] rounded-sm overflow-hidden border border-[#252525]">
            <IntelligenceMap isMiniView={true} onOpenFullMap={() => setCurrentTab('map')} />
          </div>
        </div>

        {/* Network Mind Map Widget */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center space-x-1.5">
              <Share2 size={13} className="text-white" />
              <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Teia de Dados & Correlações
              </span>
            </div>
            <button
              onClick={() => setCurrentTab('network')}
              className="text-[10px] text-[#BDBDBD] hover:text-white flex items-center space-x-1 transition-colors cursor-pointer py-1"
            >
              <span>Abrir Teia</span>
              <ArrowUpRight size={11} />
            </button>
          </div>
          <div className="h-[280px] sm:h-[320px] rounded-sm overflow-hidden border border-[#252525]">
            <NetworkMindMap isMiniView={true} onExpand={() => setCurrentTab('network')} />
          </div>
        </div>
      </div>

      {/* Security Alerts Feed */}
      <div className="p-3.5 rounded-sm bg-[#050505] border border-[#252525] space-y-3">
        <div className="flex items-center justify-between border-b border-[#252525] pb-2">
          <div className="flex items-center space-x-2">
            <AlertTriangle size={14} className="text-white" />
            <h2 className="font-bold text-white uppercase tracking-wider text-xs font-mono">
              SECURITY ALERTS
            </h2>
          </div>
          <button
            onClick={() => setCurrentTab('alerts')}
            className="text-[10px] text-[#BDBDBD] hover:text-white flex items-center space-x-1 cursor-pointer"
          >
            <span>Ver Todos ({alerts.length})</span>
            <ArrowUpRight size={11} />
          </button>
        </div>

        <div className="space-y-2">
          {alerts.slice(0, 3).map((alt) => (
            <div
              key={alt.id}
              onClick={() => focusEntity('alert', alt.id)}
              className="p-2.5 rounded-sm bg-[#000000] hover:bg-[#111111] border border-[#252525] cursor-pointer space-y-1.5 transition-colors"
            >
              <div className="flex items-center justify-between gap-1">
                <span
                  className={`text-[8px] font-mono px-1.5 py-0.5 rounded-sm font-bold uppercase ${
                    alt.priority === 'CRITICAL'
                      ? 'bg-[#FFFFFF] text-black'
                      : alt.priority === 'HIGH'
                      ? 'border border-[#FFFFFF] text-[#FFFFFF]'
                      : 'border border-[#666666] text-[#BDBDBD]'
                  }`}
                >
                  {alt.priority}
                </span>
                <span className="text-[10px] text-[#666666] font-mono">{alt.time}</span>
              </div>
              <h3 className="text-xs font-bold text-white truncate font-mono">{alt.title}</h3>
              <p className="text-[10px] text-[#BDBDBD] truncate">
                {alt.type} &bull; {alt.location}
              </p>
              <div className="flex items-center justify-between text-[9px] text-[#666666] pt-1 border-t border-[#252525]/40 font-mono">
                <span>Por {alt.author}</span>
                <span>✓ {alt.confirmations} confs</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Latest Intelligence News Feed */}
      <div className="p-3.5 rounded-sm bg-[#050505] border border-[#252525] space-y-3">
        <div className="flex items-center justify-between border-b border-[#252525] pb-2">
          <div className="flex items-center space-x-2">
            <FileText size={14} className="text-white" />
            <h2 className="font-bold text-white uppercase tracking-wider text-xs font-mono">
              NEWS FEED
            </h2>
          </div>
          <button
            onClick={() => setCurrentTab('news')}
            className="text-[10px] text-[#BDBDBD] hover:text-white flex items-center space-x-1 cursor-pointer"
          >
            <span>Ver Feed</span>
            <ArrowUpRight size={11} />
          </button>
        </div>

        <div className="space-y-2">
          {news.slice(0, 2).map((item) => (
            <div
              key={item.id}
              onClick={() => focusEntity('news', item.id)}
              className="p-2.5 rounded-sm bg-[#000000] hover:bg-[#111111] border border-[#252525] cursor-pointer space-y-1 transition-colors"
            >
              <div className="flex items-center justify-between text-[9px] text-[#666666]">
                <span className="text-white font-mono uppercase font-bold">{item.category}</span>
                <span className="font-mono">{item.date}</span>
              </div>
              <h4 className="text-xs font-bold text-white line-clamp-2 leading-snug">
                {item.title}
              </h4>
              <p className="text-[10px] text-[#BDBDBD] line-clamp-2 leading-relaxed">
                {item.content}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
