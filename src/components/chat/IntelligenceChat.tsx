import React, { useState } from 'react';
import {
  MessageSquare,
  Send,
  Paperclip,
  MapPin,
  Share2,
  Pin,
  Search,
  Users,
  Shield,
  FileText,
  Clock,
  Radio,
  Image as ImageIcon,
  Compass,
} from 'lucide-react';
import { useSycron } from '../../context/SycronContext';
import { ChatChannel, ChatMessage } from '../../types';

export const IntelligenceChat: React.FC = () => {
  const {
    chatChannels,
    activeChannelId,
    setActiveChannelId,
    sendChatMessage,
    currentUser,
    focusEntity,
  } = useSycron();

  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [channelTypeFilter, setChannelTypeFilter] = useState<string>('ALL');

  const activeChannel =
    chatChannels.find((c) => c.id === activeChannelId) || chatChannels[0];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeChannel) return;

    sendChatMessage(activeChannel.id, messageInput);
    setMessageInput('');
  };

  const handleAttachLocation = () => {
    if (!activeChannel) return;
    sendChatMessage(activeChannel.id, '📍 Coordenadas de campo compartilhadas: -23.561684, -46.655981 (Setor Central / SP)', {
      attachment: {
        name: 'geotag_paulista_hub.kml',
        size: '12 KB',
        type: 'GEODATA',
      },
      location: '-23.561684, -46.655981',
    });
  };

  const handleAttachNode = () => {
    if (!activeChannel) return;
    sendChatMessage(
      activeChannel.id,
      '🔗 Bloco da Teia correlacionado: [NODE-02: Vetor de Phishing Financeiro Berrini]. Recomenda-se quarentena.',
      {
        attachment: {
          name: 'network_correlation_node02.json',
          size: '48 KB',
          type: 'NODE',
        },
        linkedNodeId: 'node-alert-01',
      }
    );
  };

  const handleAttachFile = () => {
    const fileName = prompt('Nome do arquivo de telemetria para envio:', 'dump_snort_traffic.pcap');
    if (fileName && activeChannel) {
      sendChatMessage(activeChannel.id, `📎 Arquivo de evidência anexado: ${fileName}`, {
        attachment: {
          name: fileName,
          size: '3.8 MB',
          type: fileName.split('.').pop()?.toUpperCase() || 'FILE',
        },
      });
    }
  };

  // Filter channels
  const filteredChannels = chatChannels.filter((c) => {
    const matchesType = channelTypeFilter === 'ALL' || c.type === channelTypeFilter;
    const matchesSearch =
      !searchQuery ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div
      id="intelligence-chat-view"
      className="p-4 max-w-7xl mx-auto h-[calc(100vh-100px)] min-h-[580px] flex flex-col font-mono text-xs"
    >
      {/* Container Box */}
      <div className="flex-1 bg-neutral-950 border border-neutral-800 rounded-lg flex overflow-hidden">
        {/* Left Channel Sidebar */}
        <div className="w-72 bg-neutral-950 border-r border-neutral-800 flex flex-col shrink-0">
          {/* Channel Header & Search */}
          <div className="p-3 border-b border-neutral-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare size={15} className="text-white" />
                <span className="font-bold text-white uppercase tracking-wider text-xs">
                  Canais de Operação
                </span>
              </div>
              <span className="text-[10px] text-neutral-400">
                {chatChannels.length} canais
              </span>
            </div>

            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar canal..."
                className="w-full bg-black border border-neutral-800 rounded px-2 py-1 text-[11px] text-white placeholder-neutral-400 focus:outline-none"
              />
            </div>

            {/* Type selector */}
            <div className="flex gap-1 text-[9px]">
              {(['ALL', 'REGION', 'INCIDENT', 'NODE', 'DIRECT'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setChannelTypeFilter(t)}
                  className={`px-1.5 py-0.5 rounded transition-colors ${
                    channelTypeFilter === t
                      ? 'bg-white text-black font-bold'
                      : 'text-neutral-400 hover:text-white bg-neutral-900'
                  }`}
                >
                  {t === 'ALL' ? 'Todos' : t}
                </button>
              ))}
            </div>
          </div>

          {/* Channel List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {filteredChannels.map((chan) => {
              const isSelected = chan.id === activeChannel?.id;

              return (
                <button
                  key={chan.id}
                  onClick={() => setActiveChannelId(chan.id)}
                  className={`w-full text-left p-2 rounded transition-all flex items-start gap-2 ${
                    isSelected
                      ? 'bg-neutral-900 border border-neutral-700 text-white'
                      : 'hover:bg-neutral-900/50 border border-transparent text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <div className="p-1 rounded bg-neutral-800 border border-neutral-700 text-neutral-300 mt-0.5 shrink-0">
                    {chan.type === 'REGION' && <MapPin size={12} />}
                    {chan.type === 'INCIDENT' && <Shield size={12} />}
                    {chan.type === 'NODE' && <Share2 size={12} />}
                    {chan.type === 'DIRECT' && <Users size={12} />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-white truncate">{chan.name}</span>
                      <span className="text-[9px] text-neutral-400 uppercase">{chan.type}</span>
                    </div>
                    <p className="text-[10px] text-neutral-400 truncate">{chan.description}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* User status footer */}
          <div className="p-3 border-t border-neutral-800 bg-black flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <span className="text-[10px] text-neutral-300">Conectado via TLS 1.3</span>
            </div>
            <span className="text-[9px] text-neutral-400">{currentUser.name.split(' ')[0]}</span>
          </div>
        </div>

        {/* Right Chat Area */}
        {activeChannel ? (
          <div className="flex-1 flex flex-col bg-black">
            {/* Top Channel Info */}
            <div className="h-12 px-4 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <span className="px-1.5 py-0.5 rounded bg-neutral-800 text-white font-bold text-[10px]">
                  {activeChannel.type}
                </span>
                <h2 className="text-xs font-bold text-white truncate">{activeChannel.name}</h2>
                <span className="hidden md:inline text-[10px] text-neutral-400">
                  — {activeChannel.description}
                </span>
              </div>

              <div className="flex items-center gap-2 text-[10px] text-neutral-400">
                <span>{activeChannel.participantsCount} membros</span>
              </div>
            </div>

            {/* Pinned Messages Banner */}
            {activeChannel.pinnedMessages && activeChannel.pinnedMessages.length > 0 && (
              <div className="bg-neutral-900/90 border-b border-neutral-800 px-4 py-2 flex items-center gap-2 text-[11px] text-neutral-300">
                <Pin size={12} className="text-white shrink-0" />
                <span className="font-semibold text-white">Fixado:</span>
                <span className="truncate">{activeChannel.pinnedMessages[0]}</span>
              </div>
            )}

            {/* Message Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-dot-pattern">
              {activeChannel.messages.map((msg) => {
                const isMe = msg.authorId === currentUser.id;

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1`}
                  >
                    {/* Author & Timestamp */}
                    <div className="flex items-center gap-2 text-[10px] text-neutral-400">
                      <span className="font-bold text-neutral-200">
                        {msg.authorName} ({msg.authorRole})
                      </span>
                      <span>{msg.timestamp}</span>
                    </div>

                    {/* Message Bubble */}
                    <div
                      className={`max-w-xl p-3 rounded-lg border text-xs leading-relaxed ${
                        isMe
                          ? 'bg-neutral-900 border-neutral-700 text-white'
                          : 'bg-neutral-950 border-neutral-800 text-neutral-200'
                      }`}
                    >
                      <p>{msg.content}</p>

                      {/* Attached File/Item */}
                      {msg.attachment && (
                        <div className="mt-2 p-2 rounded bg-black/80 border border-neutral-800 flex items-center justify-between gap-2 text-[10px]">
                          <div className="flex items-center gap-2 truncate">
                            <FileText size={13} className="text-white shrink-0" />
                            <span className="text-white font-semibold truncate">
                              {msg.attachment.name}
                            </span>
                          </div>
                          <span className="text-neutral-400 shrink-0">
                            {msg.attachment.size}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input & Action Bar */}
            <div className="p-3 bg-neutral-950 border-t border-neutral-800 space-y-2">
              <form onSubmit={handleSend} className="flex items-center gap-2">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder={`Mensagem em #${activeChannel.name}...`}
                  className="flex-1 bg-black border border-neutral-800 rounded px-3 py-2 text-xs text-white placeholder-neutral-400 focus:outline-none focus:border-neutral-600"
                />

                <button
                  type="submit"
                  className="px-4 py-2 bg-white text-black font-bold rounded hover:bg-neutral-200 text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Send size={13} />
                  <span>Enviar</span>
                </button>
              </form>

              {/* Attachments toolbar */}
              <div className="flex items-center gap-2 text-[10px] text-neutral-400">
                <span>Anexar à transmissão:</span>
                <button
                  type="button"
                  onClick={handleAttachFile}
                  className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 hover:border-neutral-600 hover:text-white flex items-center gap-1 transition-colors"
                >
                  <Paperclip size={11} />
                  <span>Arquivo / Dump</span>
                </button>
                <button
                  type="button"
                  onClick={handleAttachLocation}
                  className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 hover:border-neutral-600 hover:text-white flex items-center gap-1 transition-colors"
                >
                  <MapPin size={11} />
                  <span>Coordenadas</span>
                </button>
                <button
                  type="button"
                  onClick={handleAttachNode}
                  className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 hover:border-neutral-600 hover:text-white flex items-center gap-1 transition-colors"
                >
                  <Share2 size={11} />
                  <span>Nó da Teia</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-neutral-400">
            Selecione um canal operacional para iniciar a comunicação.
          </div>
        )}
      </div>
    </div>
  );
};
