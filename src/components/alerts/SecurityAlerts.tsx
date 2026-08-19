import React, { useState } from 'react';
import {
  AlertTriangle,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Flag,
  Share2,
  MapPin,
  Clock,
  User as UserIcon,
  Shield,
  X,
  FileText,
  AlertCircle,
  ChevronRight,
  ExternalLink,
  MessageSquare,
} from 'lucide-react';
import { useSycron } from '../../context/SycronContext';
import { SecurityAlert, PriorityLevel, AlertType } from '../../types';

export const SecurityAlerts: React.FC = () => {
  const {
    alerts,
    selectedAlertId,
    setSelectedAlertId,
    createAlert,
    confirmAlert,
    resolveAlert,
    disputeAlert,
    currentUser,
    focusEntity,
    setCurrentTab,
  } = useSycron();

  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');

  // New alert form
  const [formTitle, setFormTitle] = useState('');
  const [formType, setFormType] = useState<AlertType>('Incidente digital');
  const [formLocation, setFormLocation] = useState('Av. Paulista, 1374 — Bela Vista');
  const [formPriority, setFormPriority] = useState<PriorityLevel>('HIGH');
  const [formDescription, setFormDescription] = useState('');

  const activeAlert = alerts.find((a) => a.id === selectedAlertId) || alerts[0] || null;

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formDescription.trim()) return;

    createAlert({
      title: formTitle,
      type: formType,
      location: formLocation,
      coordinates: { x: 350 + (Math.random() * 80 - 40), y: 300 + (Math.random() * 80 - 40), lat: -23.56, lng: -46.65 },
      description: formDescription,
      priority: formPriority,
      status: 'OPEN',
    });

    setIsCreateModalOpen(false);
    setFormTitle('');
    setFormDescription('');
  };

  const handleDisputeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAlert || !disputeReason.trim()) return;
    disputeAlert(activeAlert.id, disputeReason);
    setIsDisputeModalOpen(false);
    setDisputeReason('');
  };

  // Filter alerts
  const filteredAlerts = alerts.filter((a) => {
    const matchesPriority =
      activeFilter === 'ALL'
        ? true
        : activeFilter === 'RESOLVED'
        ? a.status === 'RESOLVED'
        : a.priority === activeFilter;

    const matchesCategory = categoryFilter === 'ALL' || a.type === categoryFilter;

    const matchesSearch =
      !searchQuery ||
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.author.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesPriority && matchesCategory && matchesSearch;
  });

  return (
    <div id="security-alerts-center" className="p-4 max-w-7xl mx-auto space-y-4 font-mono text-xs">
      {/* Header & Notice */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg bg-neutral-950 border border-neutral-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-white" />
            <h1 className="text-sm font-bold text-white uppercase tracking-wider">
              Security Alerts / Central de Incidentes
            </h1>
            <span className="px-1.5 py-0.2 rounded bg-neutral-900 border border-neutral-700 text-[9px] text-neutral-300">
              {alerts.length} Total
            </span>
          </div>
          <p className="text-[11px] text-neutral-400">
            Feed operacional de ameaças, incidentes digitais e vulnerabilidades monitoradas.
          </p>
        </div>

        <button
          id="btn-create-alert-open"
          onClick={() => setIsCreateModalOpen(true)}
          className="px-3.5 py-2 bg-white text-black font-bold rounded hover:bg-neutral-200 text-xs flex items-center gap-2 transition-colors self-start sm:self-auto"
        >
          <Plus size={14} />
          <span>Registrar Novo Alerta</span>
        </button>
      </div>

      {/* Collaborative Disclaimer Banner */}
      <div
        id="collab-disclaimer-banner"
        className="p-3 rounded bg-neutral-950/80 border border-neutral-800/80 flex items-start gap-2.5 text-[11px] text-neutral-400"
      >
        <Shield size={15} className="text-neutral-400 mt-0.5 shrink-0" />
        <div>
          <strong className="text-neutral-200">Protocolo de Inteligência Colaborativa:</strong> As
          ocorrências e alertas cadastrados por participantes representam relatos de campo e são
          submetidos à verificação contínua pela rede de analistas e moderadores da SYCRON.
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-neutral-950 p-3 rounded-lg border border-neutral-800">
        {/* Priority tabs */}
        <div className="flex items-center gap-1 overflow-x-auto text-[11px]">
          {(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'RESOLVED'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-2.5 py-1 rounded whitespace-nowrap transition-colors ${
                activeFilter === filter
                  ? 'bg-neutral-800 text-white font-bold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {filter === 'ALL' ? 'Todos' : filter}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-black border border-neutral-800 rounded px-2.5 py-1 text-[11px] text-white focus:outline-none"
          >
            <option value="ALL">Todas as Categorias</option>
            <option value="Incidente digital">Incidente digital</option>
            <option value="Vulnerabilidade">Vulnerabilidade</option>
            <option value="Atividade suspeita">Atividade suspeita</option>
            <option value="Fraude">Fraude</option>
            <option value="Ameaça">Ameaça</option>
            <option value="Furto">Furto</option>
            <option value="Roubo">Roubo</option>
            <option value="Pessoa desaparecida">Pessoa desaparecida</option>
            <option value="Ocorrência">Ocorrência</option>
            <option value="Outro">Outro</option>
          </select>

          {/* Search Input */}
          <div className="relative min-w-[200px]">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Pesquisar incidentes..."
              className="w-full bg-black border border-neutral-800 rounded px-2.5 py-1 text-[11px] text-white placeholder-neutral-400 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Main Alerts Layout: List + Detail Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Alerts List (7 cols) */}
        <div className="lg:col-span-7 space-y-2.5">
          {filteredAlerts.length === 0 ? (
            <div className="p-12 text-center text-neutral-400 bg-neutral-950 border border-neutral-800 rounded-lg">
              Nenhum alerta localizado com os filtros selecionados.
            </div>
          ) : (
            filteredAlerts.map((alt) => {
              const isSelected = activeAlert?.id === alt.id;
              const isCritical = alt.priority === 'CRITICAL';

              return (
                <div
                  key={alt.id}
                  id={`alert-card-${alt.id}`}
                  onClick={() => setSelectedAlertId(alt.id)}
                  className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-neutral-900 border-neutral-500 shadow-md text-white'
                      : 'bg-neutral-950 hover:bg-neutral-900/60 border-neutral-800/80 text-neutral-300'
                  }`}
                >
                  <div className="space-y-2">
                    {/* Card Top Row */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${
                            alt.priority === 'CRITICAL'
                              ? 'bg-white text-black border-white'
                              : alt.priority === 'HIGH'
                              ? 'bg-neutral-800 text-white border-neutral-600'
                              : 'bg-neutral-900 text-neutral-400 border-neutral-800'
                          }`}
                        >
                          {alt.priority}
                        </span>
                        <span className="text-[10px] text-neutral-400 uppercase">
                          {alt.type}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-[10px] text-neutral-400">
                        <span>{alt.date}</span>
                        <span>{alt.time}</span>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-xs font-bold text-white leading-snug">{alt.title}</h3>

                    {/* Description preview */}
                    <p className="text-[11px] text-neutral-400 line-clamp-2 leading-relaxed">
                      {alt.description}
                    </p>

                    {/* Bottom Metadata */}
                    <div className="pt-2 border-t border-neutral-900 flex items-center justify-between text-[10px] text-neutral-400">
                      <div className="flex items-center gap-1 truncate max-w-[200px]">
                        <MapPin size={11} className="shrink-0" />
                        <span className="truncate">{alt.location}</span>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-neutral-300">✓ {alt.confirmations} confirmações</span>
                        <span
                          className={`px-1.5 py-0.2 rounded text-[9px] font-semibold ${
                            alt.status === 'RESOLVED'
                              ? 'bg-neutral-800 text-neutral-300'
                              : alt.status === 'CONFIRMED'
                              ? 'bg-white text-black'
                              : 'bg-neutral-900 text-neutral-400'
                          }`}
                        >
                          {alt.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Selected Alert Detailed Inspector (5 cols) */}
        <div className="lg:col-span-5">
          {activeAlert ? (
            <div
              id="alert-inspector-panel"
              className="p-4 rounded-lg bg-neutral-950 border border-neutral-800 space-y-4 sticky top-18"
            >
              {/* Header */}
              <div className="border-b border-neutral-800 pb-3 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-neutral-400 uppercase tracking-widest">
                    Detalhes da Investigação
                  </span>
                  <span className="text-[10px] text-neutral-400">ID: {activeAlert.id}</span>
                </div>
                <h2 className="text-sm font-bold text-white leading-snug">{activeAlert.title}</h2>
                <div className="flex items-center gap-2 pt-1">
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${
                      activeAlert.priority === 'CRITICAL'
                        ? 'bg-white text-black border-white'
                        : 'bg-neutral-800 text-white border-neutral-600'
                    }`}
                  >
                    {activeAlert.priority}
                  </span>
                  <span className="px-1.5 py-0.2 rounded bg-neutral-900 text-neutral-300 text-[10px] border border-neutral-800">
                    Status: {activeAlert.status}
                  </span>
                  {activeAlert.isOfficial && (
                    <span className="px-1.5 py-0.2 rounded bg-neutral-800 text-white text-[9px] font-bold border border-neutral-700">
                      OFICIAL
                    </span>
                  )}
                </div>
              </div>

              {/* Attributes Grid */}
              <div className="p-3 rounded bg-neutral-900/60 border border-neutral-800 space-y-1.5 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">Categoria:</span>
                  <span className="text-white font-medium">{activeAlert.type}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">Localização:</span>
                  <span className="text-white font-medium truncate max-w-[200px]">
                    {activeAlert.location}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">Registrado por:</span>
                  <span className="text-white font-medium">
                    {activeAlert.author} ({activeAlert.authorRole})
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">Data e Horário:</span>
                  <span className="text-white font-medium">
                    {activeAlert.date} às {activeAlert.time}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">Evidências vinculadas:</span>
                  <span className="text-white font-bold">{activeAlert.evidenceCount} arquivos</span>
                </div>
              </div>

              {/* Full Description */}
              <div className="space-y-1">
                <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">
                  Descrição do Incidente
                </span>
                <p className="text-[11px] text-neutral-300 leading-relaxed bg-black/60 p-3 rounded border border-neutral-900">
                  {activeAlert.description}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2 border-t border-neutral-800">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => confirmAlert(activeAlert.id)}
                    className={`py-2 px-3 rounded border text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                      activeAlert.userConfirmed
                        ? 'bg-white text-black border-white'
                        : 'bg-neutral-900 border-neutral-700 text-white hover:bg-neutral-800'
                    }`}
                  >
                    <CheckCircle2 size={14} />
                    <span>{activeAlert.userConfirmed ? 'Confirmado ✓' : 'Confirmar Alerta'}</span>
                  </button>

                  <button
                    onClick={() => {
                      if (activeAlert.linkedNodeId) {
                        focusEntity('node', activeAlert.linkedNodeId);
                      } else {
                        setCurrentTab('network');
                      }
                    }}
                    className="py-2 px-3 bg-neutral-900 border border-neutral-700 hover:bg-neutral-800 text-white rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Share2 size={13} />
                    <span>Ver na Teia</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {activeAlert.status !== 'RESOLVED' && (
                    <button
                      onClick={() => resolveAlert(activeAlert.id)}
                      className="py-1.5 px-3 bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-neutral-300 hover:text-white rounded text-[11px] flex items-center justify-center gap-1 transition-colors"
                    >
                      <CheckCircle2 size={12} />
                      <span>Marcar Resolvido</span>
                    </button>
                  )}

                  <button
                    onClick={() => setIsDisputeModalOpen(true)}
                    className="py-1.5 px-3 bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded text-[11px] flex items-center justify-center gap-1 transition-colors"
                  >
                    <Flag size={12} />
                    <span>Contestar / Denunciar</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-neutral-400 bg-neutral-950 border border-neutral-800 rounded-lg">
              Selecione um alerta da lista para inspecionar.
            </div>
          )}
        </div>
      </div>

      {/* CREATE ALERT MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-neutral-950 border border-neutral-800 rounded-lg p-5 space-y-4 shadow-2xl font-mono text-xs">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} className="text-white" />
                <h3 className="font-bold text-white uppercase tracking-wider text-sm">
                  Registrar Alerta de Segurança
                </h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] text-neutral-400 uppercase tracking-wider block">
                  Título do Incidente / Ameaça
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Ex: Tentativa de Intrusão via Porta 3389..."
                  className="w-full bg-black border border-neutral-800 rounded p-2 text-xs text-white placeholder-neutral-400 focus:outline-none focus:border-neutral-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-neutral-400 uppercase tracking-wider block">
                    Categoria
                  </label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as AlertType)}
                    className="w-full bg-black border border-neutral-800 rounded p-2 text-xs text-white focus:outline-none"
                  >
                    <option value="Incidente digital">Incidente digital</option>
                    <option value="Vulnerabilidade">Vulnerabilidade</option>
                    <option value="Atividade suspeita">Atividade suspeita</option>
                    <option value="Fraude">Fraude</option>
                    <option value="Ameaça">Ameaça</option>
                    <option value="Furto">Furto</option>
                    <option value="Roubo">Roubo</option>
                    <option value="Pessoa desaparecida">Pessoa desaparecida</option>
                    <option value="Ocorrência">Ocorrência</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-neutral-400 uppercase tracking-wider block">
                    Prioridade
                  </label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as PriorityLevel)}
                    className="w-full bg-black border border-neutral-800 rounded p-2 text-xs text-white focus:outline-none"
                  >
                    <option value="CRITICAL">CRITICAL (Crítico)</option>
                    <option value="HIGH">HIGH (Alto)</option>
                    <option value="MEDIUM">MEDIUM (Médio)</option>
                    <option value="LOW">LOW (Baixo)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-neutral-400 uppercase tracking-wider block">
                  Localização / Coordenada
                </label>
                <input
                  type="text"
                  required
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  placeholder="Ex: Av. Paulista, 1374 — Bela Vista..."
                  className="w-full bg-black border border-neutral-800 rounded p-2 text-xs text-white placeholder-neutral-400 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-neutral-400 uppercase tracking-wider block">
                  Descrição Detalhada dos Fatos
                </label>
                <textarea
                  rows={3}
                  required
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Descreva a evidência técnica, hora estimada e impacto nos serviços..."
                  className="w-full bg-black border border-neutral-800 rounded p-2 text-xs text-white placeholder-neutral-400 focus:outline-none resize-none"
                />
              </div>

              <div className="p-2 rounded bg-neutral-900 text-[10px] text-neutral-400 border border-neutral-800">
                ✨ Este alerta criará automaticamente um bloco correspondente na Teia de Inteligência (Mind Map).
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-3 py-1.5 bg-neutral-900 border border-neutral-800 text-neutral-300 rounded text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-white text-black font-bold rounded text-xs"
                >
                  Publicar Alerta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DISPUTE / FLAG MODAL */}
      {isDisputeModalOpen && activeAlert && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-neutral-950 border border-neutral-800 rounded-lg p-5 space-y-4 shadow-2xl font-mono text-xs">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <Flag size={15} className="text-white" />
                <h3 className="font-bold text-white uppercase tracking-wider text-sm">
                  Contestar Informação de Alerta
                </h3>
              </div>
              <button
                onClick={() => setIsDisputeModalOpen(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleDisputeSubmit} className="space-y-3">
              <p className="text-[11px] text-neutral-400">
                Você está reportando uma divergência técnica no alerta <strong className="text-white">{activeAlert.title}</strong>. A moderação analisará seu relato.
              </p>

              <div className="space-y-1">
                <label className="text-[10px] text-neutral-400 uppercase tracking-wider block">
                  Motivo da Contestação / Evidência Divergente
                </label>
                <textarea
                  rows={3}
                  required
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  placeholder="Ex: Falso positivo verificado no log de firewall às 04:00..."
                  className="w-full bg-black border border-neutral-800 rounded p-2 text-xs text-white placeholder-neutral-400 focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsDisputeModalOpen(false)}
                  className="px-3 py-1.5 bg-neutral-900 border border-neutral-800 text-neutral-300 rounded text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-white text-black font-bold rounded text-xs"
                >
                  Registrar Contestação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
