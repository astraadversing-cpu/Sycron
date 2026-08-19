import React, { useState } from 'react';
import {
  Shield,
  Lock,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  FileCode,
  Clock,
  User as UserIcon,
  Copy,
  Check,
} from 'lucide-react';
import { useSycron } from '../../context/SycronContext';
import { AuditLog } from '../../types';

export const AuditLogs: React.FC = () => {
  const { auditLogs, currentUser } = useSycron();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const handleCopyHash = (hash: string) => {
    navigator.clipboard?.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const filteredLogs = auditLogs.filter((log) => {
    const matchesStatus = statusFilter === 'ALL' || log.status === statusFilter;
    const matchesSearch =
      !searchQuery ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.hash.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div id="audit-logs-view" className="p-4 max-w-7xl mx-auto space-y-4 font-mono text-xs">
      {/* Header */}
      <div className="p-4 rounded-lg bg-neutral-950 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Lock size={16} className="text-white" />
            <h1 className="text-sm font-bold text-white uppercase tracking-wider">
              Livro de Auditoria Criptográfica / Zero-Trust Ledger
            </h1>
            <span className="px-1.5 py-0.2 rounded bg-neutral-900 border border-neutral-700 text-[9px] text-neutral-300">
              {auditLogs.length} Eventos Assinados
            </span>
          </div>
          <p className="text-[11px] text-neutral-400">
            Registro imutável de telemetria, criação de nós, resolução de alertas e alterações de privilégio.
          </p>
        </div>

        <div className="flex items-center gap-2 text-[10px] text-neutral-400 bg-neutral-900 border border-neutral-800 rounded px-3 py-1.5">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <span>Integridade de Cadeia: 100% VÁLIDA</span>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-neutral-950 p-3 rounded-lg border border-neutral-800">
        <div className="flex items-center gap-1 overflow-x-auto text-[11px]">
          {['ALL', 'SUCCESS', 'WARNING', 'FAILURE'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-2.5 py-1 rounded whitespace-nowrap transition-colors ${
                statusFilter === s
                  ? 'bg-neutral-800 text-white font-bold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {s === 'ALL' ? 'Todos os Status' : s}
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por ação, hash, usuário..."
            className="w-full bg-black border border-neutral-800 rounded px-2.5 py-1 text-[11px] text-white placeholder-neutral-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Logs Table / Stream */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[11px]">
            <thead>
              <tr className="bg-neutral-900/80 border-b border-neutral-800 text-[10px] text-neutral-400 uppercase">
                <th className="py-2.5 px-3">Data / Hora</th>
                <th className="py-2.5 px-3">Operador</th>
                <th className="py-2.5 px-3">Ação</th>
                <th className="py-2.5 px-3">Detalhes do Evento</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Hash SHA-256</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-900">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-neutral-900/40 transition-colors">
                  <td className="py-2.5 px-3 text-neutral-400 whitespace-nowrap">
                    {log.timestamp}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-white whitespace-nowrap">
                    {log.userName}
                  </td>
                  <td className="py-2.5 px-3 text-neutral-300 font-bold whitespace-nowrap">
                    {log.action}
                  </td>
                  <td className="py-2.5 px-3 text-neutral-400 max-w-xs truncate">
                    {log.details}
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span
                      className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                        log.status === 'SUCCESS'
                          ? 'bg-neutral-800 text-neutral-200'
                          : log.status === 'WARNING'
                          ? 'bg-neutral-700 text-white'
                          : 'bg-white text-black'
                      }`}
                    >
                      {log.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right whitespace-nowrap">
                    <button
                      onClick={() => handleCopyHash(log.hash)}
                      className="inline-flex items-center gap-1 text-[10px] font-mono text-neutral-400 hover:text-white bg-black/60 px-2 py-0.5 rounded border border-neutral-800"
                      title="Copiar Hash SHA-256"
                    >
                      <span>{log.hash.slice(0, 10)}...</span>
                      {copiedHash === log.hash ? (
                        <Check size={10} className="text-white" />
                      ) : (
                        <Copy size={10} />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
