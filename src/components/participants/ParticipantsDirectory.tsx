import React, { useState } from 'react';
import {
  Users,
  Shield,
  Search,
  Filter,
  CheckCircle2,
  Mail,
  MapPin,
  Calendar,
  Award,
  Lock,
  ChevronRight,
  MessageSquare,
} from 'lucide-react';
import { useSycron } from '../../context/SycronContext';
import { UserRole, Participant } from '../../types';

const EMPTY_PARTICIPANT: Participant = {
  id: '',
  name: 'Nenhum participante cadastrado',
  email: '',
  role: 'User',
  status: 'OFFLINE',
  region: '',
  bio: 'Cadastre participantes para formar sua rede operacional.',
  specialties: [],
  reputationScore: 0,
  contributionsCount: 0,
  verifiedAlertsCount: 0,
  joinedDate: '',
};

export const ParticipantsDirectory: React.FC = () => {
  const {
    participants,
    currentUser,
    switchUserRole,
    focusEntity,
  } = useSycron();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [selectedParticipantId, setSelectedParticipantId] = useState<string | null>(null);

  const selectedParticipant =
    participants.find((p) => p.id === selectedParticipantId) || participants[0] || EMPTY_PARTICIPANT;

  const filteredParticipants = participants.filter((p) => {
    const matchesRole = roleFilter === 'ALL' || p.role === roleFilter;
    const matchesSearch =
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.specialties.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesRole && matchesSearch;
  });

  const rbacMatrix = [
    { permission: 'Visualizar Dashboard, Mapa e Teia', User: true, Contributor: true, Analyst: true, Moderator: true, Administrator: true },
    { permission: 'Criar Blocos de Informação e Notícias', User: false, Contributor: true, Analyst: true, Moderator: true, Administrator: true },
    { permission: 'Publicar Alertas de Segurança Operacionais', User: false, Contributor: false, Analyst: true, Moderator: true, Administrator: true },
    { permission: 'Confirmar / Validar Evidências de Outros', User: false, Contributor: true, Analyst: true, Moderator: true, Administrator: true },
    { permission: 'Resolver Incidentes e Encerrar Casos', User: false, Contributor: false, Analyst: true, Moderator: true, Administrator: true },
    { permission: 'Moderar / Ocultar Conteúdo e Banir', User: false, Contributor: false, Analyst: false, Moderator: true, Administrator: true },
    { permission: 'Gerenciar Usuários, Planos e Logs Criptográficos', User: false, Contributor: false, Analyst: false, Moderator: false, Administrator: true },
  ];

  return (
    <div id="participants-directory-view" className="p-4 max-w-7xl mx-auto space-y-4 font-mono text-xs">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg bg-neutral-950 border border-neutral-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-white" />
            <h1 className="text-sm font-bold text-white uppercase tracking-wider">
              Diretório de Participantes & Rede RBAC
            </h1>
            <span className="px-1.5 py-0.2 rounded bg-neutral-900 border border-neutral-700 text-[9px] text-neutral-300">
              {participants.length} Registrados
            </span>
          </div>
          <p className="text-[11px] text-neutral-400">
            Analistas, investigadores e colaboradores certificados operando na rede SYCRON.
          </p>
        </div>

        {/* Current user switch role preview */}
        <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 rounded p-1.5 self-start sm:self-auto">
          <span className="text-[10px] text-neutral-400">Seu papel atual:</span>
          <select
            value={currentUser.role}
            onChange={(e) => switchUserRole(e.target.value as UserRole)}
            className="bg-black border border-neutral-700 text-white rounded px-2 py-0.5 text-[10px] font-bold focus:outline-none"
          >
            <option value="User">User</option>
            <option value="Contributor">Contributor</option>
            <option value="Analyst">Analyst</option>
            <option value="Moderator">Moderator</option>
            <option value="Administrator">Administrator</option>
          </select>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-neutral-950 p-3 rounded-lg border border-neutral-800">
        <div className="flex items-center gap-1 overflow-x-auto text-[11px]">
          {(['ALL', 'Administrator', 'Moderator', 'Analyst', 'Contributor', 'User'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-2.5 py-1 rounded whitespace-nowrap transition-colors ${
                roleFilter === r
                  ? 'bg-neutral-800 text-white font-bold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {r === 'ALL' ? 'Todos' : r}
            </button>
          ))}
        </div>

        <div className="relative min-w-[220px]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar participante ou especialidade..."
            className="w-full bg-black border border-neutral-800 rounded px-2.5 py-1 text-[11px] text-white placeholder-neutral-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Main Grid: Directory + RBAC Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Participants Cards (7 cols) */}
        <div className="lg:col-span-7 space-y-2.5">
          {filteredParticipants.map((part) => {
            const isSelected = selectedParticipant.id === part.id;

            return (
              <div
                key={part.id}
                onClick={() => setSelectedParticipantId(part.id)}
                className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-neutral-900 border-neutral-500 shadow-md text-white'
                    : 'bg-neutral-950 hover:bg-neutral-900/60 border-neutral-800/80 text-neutral-300'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-neutral-800 border border-neutral-700 flex items-center justify-center font-bold text-white text-sm">
                      {part.name.charAt(0)}
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-white">{part.name}</span>
                        <span
                          className={`w-2 h-2 rounded-full ${
                            part.status === 'ONLINE'
                              ? 'bg-white'
                              : part.status === 'BUSY'
                              ? 'bg-neutral-400'
                              : 'bg-neutral-700'
                          }`}
                          title={`Status: ${part.status}`}
                        />
                      </div>
                      <span className="text-[11px] text-neutral-400">{part.email}</span>
                    </div>
                  </div>

                  <div className="text-right space-y-1">
                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                        part.role === 'Administrator'
                          ? 'bg-white text-black border-white'
                          : part.role === 'Analyst'
                          ? 'bg-neutral-800 text-white border-neutral-600'
                          : 'bg-neutral-900 text-neutral-400 border-neutral-800'
                      }`}
                    >
                      {part.role}
                    </span>
                    <div className="text-[10px] text-neutral-400">
                      Score: <strong className="text-white">{part.reputationScore}%</strong>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-neutral-900 flex items-center justify-between text-[10px] text-neutral-400">
                  <div className="flex items-center gap-1">
                    <MapPin size={11} />
                    <span>{part.region}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>{part.contributionsCount} contribuições</span>
                    <span>•</span>
                    <span>{part.verifiedAlertsCount} alertas validados</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Inspector & RBAC Matrix (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Selected Profile Card */}
          <div className="p-4 rounded-lg bg-neutral-950 border border-neutral-800 space-y-3.5">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <span className="text-[10px] text-neutral-400 uppercase tracking-widest">
                Ficha do Investigador
              </span>
              <span className="text-[10px] text-neutral-400">ID: {selectedParticipant.id}</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded bg-neutral-800 border border-neutral-700 flex items-center justify-center font-bold text-white text-base">
                {selectedParticipant.name.charAt(0)}
              </div>
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold text-white">{selectedParticipant.name}</h3>
                <p className="text-[11px] text-neutral-400">{selectedParticipant.email}</p>
                <div className="text-[10px] text-neutral-300">
                  Papel: <strong>{selectedParticipant.role}</strong> • Status: {selectedParticipant.status}
                </div>
              </div>
            </div>

            <p className="text-[11px] text-neutral-300 bg-neutral-900/60 p-2.5 rounded border border-neutral-800 leading-relaxed">
              {selectedParticipant.bio}
            </p>

            <div className="space-y-1">
              <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">
                Especialidades Operacionais
              </span>
              <div className="flex flex-wrap gap-1">
                {selectedParticipant.specialties.map((spec) => (
                  <span
                    key={spec}
                    className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-[10px] text-neutral-300"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-neutral-800">
              <button
                onClick={() => focusEntity('chat', 'chan-01')}
                className="w-full py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <MessageSquare size={13} />
                <span>Iniciar Canal Direto</span>
              </button>
            </div>
          </div>

          {/* RBAC Privilege Matrix */}
          <div className="p-4 rounded-lg bg-neutral-950 border border-neutral-800 space-y-3">
            <div className="flex items-center gap-2 border-b border-neutral-800 pb-2">
              <Lock size={14} className="text-white" />
              <h3 className="font-bold text-white uppercase tracking-wider text-xs">
                Matriz de Privilégios (RBAC)
              </h3>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto">
              {rbacMatrix.map((item, idx) => (
                <div
                  key={idx}
                  className="p-2 rounded bg-neutral-900/40 border border-neutral-900 space-y-1 text-[10px]"
                >
                  <div className="text-neutral-200 font-semibold">{item.permission}</div>
                  <div className="flex items-center justify-between text-neutral-400 text-[9px] pt-0.5">
                    <span>USR: {item.User ? '✓' : '✗'}</span>
                    <span>CTR: {item.Contributor ? '✓' : '✗'}</span>
                    <span>ANL: {item.Analyst ? '✓' : '✗'}</span>
                    <span>MOD: {item.Moderator ? '✓' : '✗'}</span>
                    <span className="text-white font-bold">ADM: {item.Administrator ? '✓' : '✗'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
