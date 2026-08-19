import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  X,
  Share2,
  AlertTriangle,
  Newspaper,
  Users,
  MessageSquare,
  FileText,
  MapPin,
  ArrowRight,
  Shield,
} from 'lucide-react';
import { useSycron } from '../../context/SycronContext';

export const GlobalSearchModal: React.FC = () => {
  const {
    isGlobalSearchOpen,
    setIsGlobalSearchOpen,
    nodes,
    alerts,
    news,
    participants,
    chatChannels,
    reports,
    regions,
    focusEntity,
  } = useSycron();

  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const inputRef = useRef<HTMLInputElement>(null);

  // Global shortcut listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsGlobalSearchOpen(!isGlobalSearchOpen);
      }
      if (e.key === 'Escape' && isGlobalSearchOpen) {
        setIsGlobalSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isGlobalSearchOpen, setIsGlobalSearchOpen]);

  useEffect(() => {
    if (isGlobalSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isGlobalSearchOpen]);

  if (!isGlobalSearchOpen) return null;

  const cleanQuery = query.toLowerCase().trim();

  // Search through all collections
  const filteredNodes = nodes.filter(
    (n) =>
      (filterType === 'ALL' || filterType === 'NODES') &&
      (!cleanQuery ||
        n.title.toLowerCase().includes(cleanQuery) ||
        n.description.toLowerCase().includes(cleanQuery) ||
        n.location.toLowerCase().includes(cleanQuery) ||
        n.tags.some((t) => t.toLowerCase().includes(cleanQuery)))
  );

  const filteredAlerts = alerts.filter(
    (a) =>
      (filterType === 'ALL' || filterType === 'ALERTS') &&
      (!cleanQuery ||
        a.title.toLowerCase().includes(cleanQuery) ||
        a.description.toLowerCase().includes(cleanQuery) ||
        a.location.toLowerCase().includes(cleanQuery) ||
        a.type.toLowerCase().includes(cleanQuery))
  );

  const filteredNews = news.filter(
    (n) =>
      (filterType === 'ALL' || filterType === 'NEWS') &&
      (!cleanQuery ||
        n.title.toLowerCase().includes(cleanQuery) ||
        n.content.toLowerCase().includes(cleanQuery) ||
        n.location.toLowerCase().includes(cleanQuery) ||
        n.category.toLowerCase().includes(cleanQuery))
  );

  const filteredParticipants = participants.filter(
    (p) =>
      (filterType === 'ALL' || filterType === 'PARTICIPANTS') &&
      (!cleanQuery ||
        p.name.toLowerCase().includes(cleanQuery) ||
        p.email.toLowerCase().includes(cleanQuery) ||
        p.region.toLowerCase().includes(cleanQuery) ||
        p.role.toLowerCase().includes(cleanQuery))
  );

  const filteredReports = reports.filter(
    (r) =>
      (filterType === 'ALL' || filterType === 'REPORTS') &&
      (!cleanQuery ||
        r.title.toLowerCase().includes(cleanQuery) ||
        r.summary.toLowerCase().includes(cleanQuery) ||
        r.region.toLowerCase().includes(cleanQuery))
  );

  const filteredRegions = regions.filter(
    (reg) =>
      (filterType === 'ALL' || filterType === 'REGIONS') &&
      (!cleanQuery ||
        reg.name.toLowerCase().includes(cleanQuery) ||
        reg.code.toLowerCase().includes(cleanQuery) ||
        reg.description.toLowerCase().includes(cleanQuery))
  );

  const totalResults =
    filteredNodes.length +
    filteredAlerts.length +
    filteredNews.length +
    filteredParticipants.length +
    filteredReports.length +
    filteredRegions.length;

  return (
    <div
      id="global-search-backdrop"
      className="fixed inset-0 bg-black/85 backdrop-blur-xs z-50 flex items-start justify-center pt-16 px-4"
      onClick={() => setIsGlobalSearchOpen(false)}
    >
      <div
        id="global-search-modal"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-neutral-950 border border-neutral-800 rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
      >
        {/* Search input bar */}
        <div className="p-3 border-b border-neutral-800 flex items-center gap-3">
          <Search size={18} className="text-neutral-400 shrink-0" />
          <input
            ref={inputRef}
            id="global-search-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Pesquisar nós da teia, alertas, evidências, participantes, regiões..."
            className="flex-1 bg-transparent text-sm font-mono text-white placeholder-neutral-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-neutral-400 hover:text-white p-1"
            >
              <X size={16} />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-neutral-400 bg-neutral-900 border border-neutral-800 rounded">
            ESC
          </kbd>
        </div>

        {/* Filter categories bar */}
        <div className="px-3 py-2 border-b border-neutral-900 flex items-center gap-1.5 overflow-x-auto text-[11px] font-mono">
          {[
            { id: 'ALL', label: 'Tudo' },
            { id: 'NODES', label: `Nós (${nodes.length})` },
            { id: 'ALERTS', label: `Alertas (${alerts.length})` },
            { id: 'NEWS', label: `Notícias (${news.length})` },
            { id: 'PARTICIPANTS', label: `Membros (${participants.length})` },
            { id: 'REGIONS', label: `Regiões (${regions.length})` },
            { id: 'REPORTS', label: `Relatórios (${reports.length})` },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterType(cat.id)}
              className={`px-2.5 py-1 rounded whitespace-nowrap transition-colors ${
                filterType === cat.id
                  ? 'bg-neutral-800 text-white font-semibold'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Results list */}
        <div className="flex-1 overflow-y-auto p-2 space-y-4">
          {totalResults === 0 ? (
            <div className="py-12 text-center text-neutral-400 font-mono text-xs">
              Nenhum registro de inteligência correspondente encontrado.
            </div>
          ) : (
            <>
              {/* Nodes Results */}
              {filteredNodes.length > 0 && (
                <div className="space-y-1">
                  <div className="px-2 py-1 text-[10px] font-mono text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Share2 size={12} />
                    <span>Nós da Teia de Inteligência ({filteredNodes.length})</span>
                  </div>
                  {filteredNodes.slice(0, 4).map((node) => (
                    <div
                      key={node.id}
                      onClick={() => {
                        focusEntity('node', node.id);
                        setIsGlobalSearchOpen(false);
                      }}
                      className="p-2.5 rounded bg-neutral-900/40 hover:bg-neutral-900 border border-neutral-800/80 cursor-pointer flex items-center justify-between transition-colors group"
                    >
                      <div className="space-y-0.5 min-w-0 pr-3">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-neutral-800 border border-neutral-700 text-neutral-300">
                            {node.category}
                          </span>
                          <span className="text-xs font-mono font-medium text-white truncate">
                            {node.title}
                          </span>
                        </div>
                        <p className="text-[11px] font-mono text-neutral-400 truncate">
                          {node.location} • {node.description}
                        </p>
                      </div>
                      <ArrowRight size={14} className="text-neutral-400 group-hover:text-white shrink-0" />
                    </div>
                  ))}
                </div>
              )}

              {/* Alerts Results */}
              {filteredAlerts.length > 0 && (
                <div className="space-y-1">
                  <div className="px-2 py-1 text-[10px] font-mono text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle size={12} />
                    <span>Alertas de Segurança ({filteredAlerts.length})</span>
                  </div>
                  {filteredAlerts.slice(0, 4).map((alt) => (
                    <div
                      key={alt.id}
                      onClick={() => {
                        focusEntity('alert', alt.id);
                        setIsGlobalSearchOpen(false);
                      }}
                      className="p-2.5 rounded bg-neutral-900/40 hover:bg-neutral-900 border border-neutral-800/80 cursor-pointer flex items-center justify-between transition-colors group"
                    >
                      <div className="space-y-0.5 min-w-0 pr-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold border ${
                              alt.priority === 'CRITICAL'
                                ? 'bg-white text-black border-white'
                                : 'bg-neutral-800 text-neutral-300 border-neutral-700'
                            }`}
                          >
                            {alt.priority}
                          </span>
                          <span className="text-xs font-mono font-medium text-white truncate">
                            {alt.title}
                          </span>
                        </div>
                        <p className="text-[11px] font-mono text-neutral-400 truncate">
                          {alt.type} • {alt.location} • {alt.time}
                        </p>
                      </div>
                      <ArrowRight size={14} className="text-neutral-400 group-hover:text-white shrink-0" />
                    </div>
                  ))}
                </div>
              )}

              {/* News Results */}
              {filteredNews.length > 0 && (
                <div className="space-y-1">
                  <div className="px-2 py-1 text-[10px] font-mono text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Newspaper size={12} />
                    <span>Publicações & Notícias ({filteredNews.length})</span>
                  </div>
                  {filteredNews.slice(0, 3).map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        focusEntity('news', n.id);
                        setIsGlobalSearchOpen(false);
                      }}
                      className="p-2.5 rounded bg-neutral-900/40 hover:bg-neutral-900 border border-neutral-800/80 cursor-pointer flex items-center justify-between transition-colors group"
                    >
                      <div className="space-y-0.5 min-w-0 pr-3">
                        <span className="text-xs font-mono font-medium text-white truncate block">
                          {n.title}
                        </span>
                        <p className="text-[11px] font-mono text-neutral-400 truncate">
                          {n.category} • Por {n.author} ({n.authorRole})
                        </p>
                      </div>
                      <ArrowRight size={14} className="text-neutral-400 group-hover:text-white shrink-0" />
                    </div>
                  ))}
                </div>
              )}

              {/* Participants Results */}
              {filteredParticipants.length > 0 && (
                <div className="space-y-1">
                  <div className="px-2 py-1 text-[10px] font-mono text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Users size={12} />
                    <span>Participantes da Rede ({filteredParticipants.length})</span>
                  </div>
                  {filteredParticipants.slice(0, 3).map((p) => (
                    <div
                      key={p.id}
                      onClick={() => {
                        focusEntity('chat', 'chan-01');
                        setIsGlobalSearchOpen(false);
                      }}
                      className="p-2.5 rounded bg-neutral-900/40 hover:bg-neutral-900 border border-neutral-800/80 cursor-pointer flex items-center justify-between transition-colors group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-3">
                        <div className="w-6 h-6 rounded bg-neutral-800 border border-neutral-700 flex items-center justify-center text-xs font-mono text-white">
                          {p.name.charAt(0)}
                        </div>
                        <div className="space-y-0.5 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-mono font-medium text-white truncate">
                              {p.name}
                            </span>
                            <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-neutral-800 text-neutral-400 border border-neutral-700">
                              {p.role}
                            </span>
                          </div>
                          <p className="text-[11px] font-mono text-neutral-400 truncate">
                            {p.region} • Score: {p.reputationScore}
                          </p>
                        </div>
                      </div>
                      <ArrowRight size={14} className="text-neutral-400 group-hover:text-white shrink-0" />
                    </div>
                  ))}
                </div>
              )}

              {/* Regions Results */}
              {filteredRegions.length > 0 && (
                <div className="space-y-1">
                  <div className="px-2 py-1 text-[10px] font-mono text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin size={12} />
                    <span>Zonas & Regiões Monitoradas ({filteredRegions.length})</span>
                  </div>
                  {filteredRegions.slice(0, 3).map((r) => (
                    <div
                      key={r.id}
                      onClick={() => {
                        focusEntity('region', r.id);
                        setIsGlobalSearchOpen(false);
                      }}
                      className="p-2.5 rounded bg-neutral-900/40 hover:bg-neutral-900 border border-neutral-800/80 cursor-pointer flex items-center justify-between transition-colors group"
                    >
                      <div className="space-y-0.5 min-w-0 pr-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-medium text-white">{r.name}</span>
                          <span className="text-[9px] font-mono text-neutral-400">[{r.code}]</span>
                        </div>
                        <p className="text-[11px] font-mono text-neutral-400 truncate">
                          Nível de Ameaça: {r.threatLevel} • {r.activeAlertsCount} Alertas Ativos
                        </p>
                      </div>
                      <ArrowRight size={14} className="text-neutral-400 group-hover:text-white shrink-0" />
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-2.5 border-t border-neutral-800 bg-black/60 flex items-center justify-between text-[10px] font-mono text-neutral-400">
          <span>Pressione ENTER para selecionar ou ESC para fechar</span>
          <span>SYCRON Global Search Engine</span>
        </div>
      </div>
    </div>
  );
};
