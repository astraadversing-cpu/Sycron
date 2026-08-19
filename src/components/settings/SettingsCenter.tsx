import React, { useState } from 'react';
import {
  Settings,
  Shield,
  Key,
  Smartphone,
  Lock,
  User as UserIcon,
  RefreshCw,
  Plus,
  Trash2,
  Copy,
  Check,
  Radio,
  Sliders,
} from 'lucide-react';
import { useSycron } from '../../context/SycronContext';

export const SettingsCenter: React.FC = () => {
  const { currentUser, switchUserRole } = useSycron();

  const [activeTab, setActiveTab] = useState<'PROFILE' | 'SECURITY' | 'API' | 'SESSIONS' | 'PREFERENCES'>('PROFILE');

  // Profile state
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [bio, setBio] = useState('Analista Sênior de Defesa Cibernética e Inteligência Estratégica.');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // 2FA state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);

  // API Keys state
  const [apiKeys, setApiKeys] = useState([
    { id: 'key-01', name: 'SIEM Integration Production', prefix: 'syc_live_8f3a9...', created: '2026-03-10', role: 'READ_WRITE' },
    { id: 'key-02', name: 'SOAR Auto-Mitigation Webhook', prefix: 'syc_live_c12b7...', created: '2026-03-12', role: 'READ_ONLY' },
  ]);
  const [newKeyName, setNewKeyName] = useState('');
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  // Sessions state
  const [sessions, setSessions] = useState([
    { id: 's-01', device: 'Chrome on macOS (Estação Primária)', ip: '189.40.12.88', location: 'São Paulo, Brasil', current: true },
    { id: 's-02', device: 'Terminal CLI Daemon', ip: '10.200.0.15', location: 'Cloud Proxy Cluster', current: false },
  ]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleGenerateKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    const newKey = {
      id: `key-${Date.now()}`,
      name: newKeyName,
      prefix: `syc_live_${Math.random().toString(36).substring(2, 8)}...`,
      created: new Date().toISOString().split('T')[0],
      role: 'READ_WRITE',
    };

    setApiKeys([newKey, ...apiKeys]);
    setNewKeyName('');
  };

  const handleRevokeKey = (id: string) => {
    setApiKeys(apiKeys.filter((k) => k.id !== id));
  };

  const handleCopyKey = (id: string, prefix: string) => {
    navigator.clipboard?.writeText(prefix);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  return (
    <div id="settings-center-view" className="p-4 max-w-5xl mx-auto space-y-4 font-mono text-xs">
      {/* Header */}
      <div className="p-4 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Settings size={16} className="text-white" />
            <h1 className="text-sm font-bold text-white uppercase tracking-wider">
              Configurações & Painel de Segurança do Operador
            </h1>
          </div>
          <p className="text-[11px] text-neutral-400">
            Gerenciamento de credenciais, chaves de API para SIEM, autenticação em dois fatores e preferências.
          </p>
        </div>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-1 bg-neutral-950 p-2 rounded-lg border border-neutral-800 overflow-x-auto text-[11px]">
        {(
          [
            { id: 'PROFILE', label: 'Perfil do Operador', icon: UserIcon },
            { id: 'SECURITY', label: 'Segurança & 2FA', icon: Lock },
            { id: 'API', label: 'Chaves de API (SIEM/SOAR)', icon: Key },
            { id: 'SESSIONS', label: 'Sessões Ativas', icon: Smartphone },
            { id: 'PREFERENCES', label: 'Preferências de Telemetria', icon: Sliders },
          ] as const
        ).map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                isSelected
                  ? 'bg-neutral-800 text-white font-bold'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
              }`}
            >
              <Icon size={13} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="p-5 rounded-lg bg-neutral-950 border border-neutral-800 space-y-4">
        {/* PROFILE TAB */}
        {activeTab === 'PROFILE' && (
          <form onSubmit={handleSaveProfile} className="space-y-4 max-w-xl">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-neutral-800 pb-2">
              Identidade e Credenciais de Campo
            </h3>

            <div className="space-y-1">
              <label className="text-[10px] text-neutral-400 uppercase tracking-wider block">
                Nome Completo / Alias
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-black border border-neutral-800 rounded p-2 text-xs text-white focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-neutral-400 uppercase tracking-wider block">
                E-mail Operacional
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black border border-neutral-800 rounded p-2 text-xs text-white focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-neutral-400 uppercase tracking-wider block">
                Bio / Registro de Atuação
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full bg-black border border-neutral-800 rounded p-2 text-xs text-white focus:outline-none resize-none font-sans"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                className="px-4 py-2 bg-white text-black font-bold rounded hover:bg-neutral-200 text-xs transition-colors"
              >
                Salvar Alterações
              </button>

              {savedSuccess && (
                <span className="text-[11px] text-white flex items-center gap-1 font-bold">
                  <Check size={13} /> Dados salvos com sucesso!
                </span>
              )}
            </div>
          </form>
        )}

        {/* SECURITY & 2FA TAB */}
        {activeTab === 'SECURITY' && (
          <div className="space-y-4 max-w-xl">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-neutral-800 pb-2">
              Autenticação de Dois Fatores (2FA) & Blindagem
            </h3>

            <div className="p-3.5 rounded bg-neutral-900/60 border border-neutral-800 flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="font-bold text-white text-xs">Autenticador TOTP (Google Authenticator / YubiKey)</div>
                <p className="text-[11px] text-neutral-400">
                  Exige token de 6 dígitos gerado pelo aplicativo em cada logon.
                </p>
              </div>

              <button
                onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${
                  twoFactorEnabled ? 'bg-white text-black' : 'bg-neutral-800 text-neutral-300'
                }`}
              >
                {twoFactorEnabled ? 'Ativado ✓' : 'Desativado'}
              </button>
            </div>

            <div className="p-3.5 rounded bg-neutral-900/60 border border-neutral-800 space-y-2">
              <div className="font-bold text-white text-xs">Chaves de Segurança FIDO2 / WebAuthn</div>
              <p className="text-[11px] text-neutral-400">
                Dispositivo de hardware físico YubiKey 5 NFC vinculado.
              </p>
              <button
                onClick={() => alert('Chave de hardware registrada e validada.')}
                className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-white rounded text-[10px]"
              >
                Configurar Nova Chave de Hardware
              </button>
            </div>
          </div>
        )}

        {/* API KEYS TAB */}
        {activeTab === 'API' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800 pb-2">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Chaves de Acesso à API REST da SYCRON
              </h3>
              <span className="text-[10px] text-neutral-400">
                Taxa limite: 10.000 requisições/minuto
              </span>
            </div>

            {/* Generate form */}
            <form onSubmit={handleGenerateKey} className="flex gap-2">
              <input
                type="text"
                required
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="Identificador da chave (ex: Splunk SOAR Ingest)..."
                className="flex-1 bg-black border border-neutral-800 rounded px-3 py-1.5 text-xs text-white placeholder-neutral-400 focus:outline-none"
              />
              <button
                type="submit"
                className="px-4 py-1.5 bg-white text-black font-bold rounded hover:bg-neutral-200 text-xs flex items-center gap-1.5 shrink-0"
              >
                <Plus size={13} />
                <span>Gerar Chave</span>
              </button>
            </form>

            {/* List */}
            <div className="space-y-2">
              {apiKeys.map((k) => (
                <div
                  key={k.id}
                  className="p-3 rounded bg-neutral-900/40 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="space-y-0.5">
                    <div className="font-bold text-white text-xs">{k.name}</div>
                    <div className="flex items-center gap-2 text-[10px] text-neutral-400">
                      <code className="bg-black px-1.5 py-0.2 rounded border border-neutral-800 text-neutral-200">
                        {k.prefix}
                      </code>
                      <span>•</span>
                      <span>Criada em {k.created}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyKey(k.id, k.prefix)}
                      className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-white rounded text-[10px] flex items-center gap-1"
                    >
                      {copiedKeyId === k.id ? <Check size={11} /> : <Copy size={11} />}
                      <span>{copiedKeyId === k.id ? 'Copiada' : 'Copiar'}</span>
                    </button>
                    <button
                      onClick={() => handleRevokeKey(k.id)}
                      className="px-2.5 py-1 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded text-[10px]"
                    >
                      Revogar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SESSIONS TAB */}
        {activeTab === 'SESSIONS' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Sessões Conectadas
              </h3>
              <button
                onClick={() => setSessions(sessions.filter((s) => s.current))}
                className="px-2.5 py-1 bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-neutral-300 rounded text-[10px]"
              >
                Encerrar Outras Sessões
              </button>
            </div>

            <div className="space-y-2">
              {sessions.map((sess) => (
                <div
                  key={sess.id}
                  className="p-3 rounded bg-neutral-900/40 border border-neutral-800 flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-xs">{sess.device}</span>
                      {sess.current && (
                        <span className="px-1.5 py-0.2 rounded bg-white text-black text-[9px] font-bold">
                          ESTA SESSÃO
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-neutral-400">
                      IP: {sess.ip} • {sess.location}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PREFERENCES TAB */}
        {activeTab === 'PREFERENCES' && (
          <div className="space-y-4 max-w-xl">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-neutral-800 pb-2">
              Preferências de Interface & Telemetria
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded bg-neutral-900/40 border border-neutral-800">
                <div>
                  <div className="font-bold text-white text-xs">Frequência de Varredura do Radar</div>
                  <div className="text-[10px] text-neutral-400">Atualização em tempo real via WebSocket</div>
                </div>
                <select className="bg-black border border-neutral-800 text-white text-[11px] rounded p-1">
                  <option>Tempo Real (100ms)</option>
                  <option>Econômico (1s)</option>
                  <option>Manual (Sob Demanda)</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-3 rounded bg-neutral-900/40 border border-neutral-800">
                <div>
                  <div className="font-bold text-white text-xs">Avisos Sonoros Táticos</div>
                  <div className="text-[10px] text-neutral-400">Emitir bipe discreto em incidentes críticos</div>
                </div>
                <input type="checkbox" defaultChecked className="accent-white" />
              </div>

              <div className="flex items-center justify-between p-3 rounded bg-neutral-900/40 border border-neutral-800">
                <div>
                  <div className="font-bold text-white text-xs">Paleta de Cores Monocromática</div>
                  <div className="text-[10px] text-neutral-400">Modo de alto contraste preto e branco profissional</div>
                </div>
                <span className="text-[10px] text-white font-bold">PADRÃO ATIVO</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
