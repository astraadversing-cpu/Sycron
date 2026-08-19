import React, { useState } from 'react';
import {
  Newspaper,
  Plus,
  Search,
  CheckCircle2,
  Bookmark,
  Share2,
  MessageSquare,
  MapPin,
  Clock,
  User as UserIcon,
  X,
  Flag,
  Send,
  ExternalLink,
} from 'lucide-react';
import { useSycron } from '../../context/SycronContext';

export const NewsFeed: React.FC = () => {
  const {
    news,
    createNews,
    confirmNews,
    toggleSaveNews,
    addNewsComment,
    currentUser,
    focusEntity,
  } = useSycron();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Comment input per news id
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  // Create news form
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [location, setLocation] = useState('São Paulo / Região Metropolitana');
  const [category, setCategory] = useState('Threat Intelligence');

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    createNews(title, content, location, category);
    setIsCreateOpen(false);
    setTitle('');
    setContent('');
  };

  const handleCommentSubmit = (newsId: string, e: React.FormEvent) => {
    e.preventDefault();
    const text = commentInputs[newsId];
    if (!text || !text.trim()) return;

    addNewsComment(newsId, text);
    setCommentInputs((prev) => ({ ...prev, [newsId]: '' }));
  };

  const filteredNews = news.filter((item) => {
    const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div id="sycron-news-feed" className="p-4 max-w-5xl mx-auto space-y-4 font-mono text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg bg-neutral-950 border border-neutral-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Newspaper size={16} className="text-white" />
            <h1 className="text-sm font-bold text-white uppercase tracking-wider">
              Sycron News / Inteligência & Comunicados
            </h1>
          </div>
          <p className="text-[11px] text-neutral-400">
            Boletins técnicos, relatos de campo e comunicados de segurança publicados pelos membros da rede.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="px-3.5 py-2 bg-white text-black font-bold rounded hover:bg-neutral-200 text-xs flex items-center gap-2 transition-colors self-start sm:self-auto"
        >
          <Plus size={14} />
          <span>Publicar Notícia</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-neutral-950 p-3 rounded-lg border border-neutral-800">
        <div className="flex items-center gap-1 overflow-x-auto text-[11px]">
          {['ALL', 'Threat Intelligence', 'Network Security', 'Relatório Mensal', 'Vulnerabilidades'].map(
            (cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-neutral-800 text-white font-bold'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {cat === 'ALL' ? 'Todas' : cat}
              </button>
            )
          )}
        </div>

        <div className="relative min-w-[220px]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar notícias..."
            className="w-full bg-black border border-neutral-800 rounded px-2.5 py-1 text-[11px] text-white placeholder-neutral-400 focus:outline-none"
          />
        </div>
      </div>

      {/* News List */}
      <div className="space-y-4">
        {filteredNews.length === 0 ? (
          <div className="p-12 text-center text-neutral-400 bg-neutral-950 border border-neutral-800 rounded-lg">
            Nenhuma publicação encontrada no feed.
          </div>
        ) : (
          filteredNews.map((item) => (
            <article
              key={item.id}
              className="p-5 rounded-lg bg-neutral-950 border border-neutral-800 space-y-3.5 shadow-sm"
            >
              {/* Post Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[10px] text-neutral-400">
                    <span className="px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-300 font-bold uppercase">
                      {item.category}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin size={10} /> {item.location}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock size={10} /> {item.date} às {item.time}
                    </span>
                  </div>

                  <h2 className="text-sm font-bold text-white leading-snug">{item.title}</h2>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => toggleSaveNews(item.id)}
                    className={`p-1.5 rounded transition-colors ${
                      item.saved ? 'text-white bg-neutral-900' : 'text-neutral-400 hover:text-white'
                    }`}
                    title={item.saved ? 'Salvo' : 'Salvar publicação'}
                  >
                    <Bookmark size={15} />
                  </button>
                </div>
              </div>

              {/* Author info */}
              <div className="flex items-center gap-2 text-[11px] text-neutral-400 pb-1 border-b border-neutral-900">
                <div className="w-5 h-5 rounded bg-neutral-800 border border-neutral-700 flex items-center justify-center text-[10px] text-white">
                  {item.author.charAt(0)}
                </div>
                <span>
                  Publicado por <strong className="text-neutral-200">{item.author}</strong> ({item.authorRole})
                </span>
              </div>

              {/* Content Body */}
              <p className="text-xs text-neutral-300 leading-relaxed font-sans">
                {item.content}
              </p>

              {/* Interactive Toolbar */}
              <div className="pt-2 border-t border-neutral-900 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => confirmNews(item.id)}
                    className={`px-2.5 py-1 rounded border text-[10px] font-bold flex items-center gap-1.5 transition-colors ${
                      item.userConfirmed
                        ? 'bg-white text-black border-white'
                        : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-800'
                    }`}
                  >
                    <CheckCircle2 size={12} />
                    <span>
                      {item.userConfirmed ? 'Confirmado ✓' : 'Confirmar Informação'} ({item.confirmations})
                    </span>
                  </button>

                  {item.linkedNodeId && (
                    <button
                      onClick={() => focusEntity('node', item.linkedNodeId!)}
                      className="px-2.5 py-1 bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-neutral-300 hover:text-white rounded text-[10px] flex items-center gap-1 transition-colors"
                    >
                      <Share2 size={11} />
                      <span>Ver Nó Vinculado</span>
                    </button>
                  )}
                </div>

                <div className="text-[10px] text-neutral-400 flex items-center gap-1">
                  <MessageSquare size={11} />
                  <span>{item.comments.length} comentários técnicos</span>
                </div>
              </div>

              {/* Comments Thread */}
              {item.comments.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-neutral-900/60">
                  {item.comments.map((c) => (
                    <div
                      key={c.id}
                      className="p-2 rounded bg-neutral-900/50 border border-neutral-800/80 space-y-1 text-[11px]"
                    >
                      <div className="flex items-center justify-between text-[10px] text-neutral-400">
                        <span className="font-semibold text-neutral-200">
                          {c.author} ({c.role})
                        </span>
                        <span>{c.time}</span>
                      </div>
                      <p className="text-neutral-300">{c.text}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Comment Input */}
              <form
                onSubmit={(e) => handleCommentSubmit(item.id, e)}
                className="flex items-center gap-2 pt-1"
              >
                <input
                  type="text"
                  value={commentInputs[item.id] || ''}
                  onChange={(e) =>
                    setCommentInputs((prev) => ({ ...prev, [item.id]: e.target.value }))
                  }
                  placeholder="Escreva uma observação ou confirmação analítica..."
                  className="flex-1 bg-black border border-neutral-800 rounded px-3 py-1.5 text-xs text-white placeholder-neutral-400 focus:outline-none focus:border-neutral-600"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-neutral-900 border border-neutral-700 hover:bg-neutral-800 text-white rounded text-xs flex items-center gap-1 transition-colors"
                >
                  <Send size={12} />
                  <span>Comentar</span>
                </button>
              </form>
            </article>
          ))
        )}
      </div>

      {/* CREATE NEWS MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-neutral-950 border border-neutral-800 rounded-lg p-5 space-y-4 shadow-2xl font-mono text-xs">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <Newspaper size={16} className="text-white" />
                <h3 className="font-bold text-white uppercase tracking-wider text-sm">
                  Publicar Notícia / Boletim Técnico
                </h3>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] text-neutral-400 uppercase tracking-wider block">
                  Título da Notícia
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Alerta de Campanha de Ransomware em Hospitais..."
                  className="w-full bg-black border border-neutral-800 rounded p-2 text-xs text-white placeholder-neutral-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-neutral-400 uppercase tracking-wider block">
                    Categoria
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-black border border-neutral-800 rounded p-2 text-xs text-white focus:outline-none"
                  >
                    <option value="Threat Intelligence">Threat Intelligence</option>
                    <option value="Network Security">Network Security</option>
                    <option value="Relatório Mensal">Relatório Mensal</option>
                    <option value="Vulnerabilidades">Vulnerabilidades</option>
                    <option value="Avisos Gerais">Avisos Gerais</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-neutral-400 uppercase tracking-wider block">
                    Região de Referência
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-black border border-neutral-800 rounded p-2 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-neutral-400 uppercase tracking-wider block">
                  Conteúdo do Relato / Análise
                </label>
                <textarea
                  rows={4}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Descreva detalhadamente o evento, vetores, recomendações e impacto..."
                  className="w-full bg-black border border-neutral-800 rounded p-2 text-xs text-white placeholder-neutral-400 focus:outline-none resize-none font-sans"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-3 py-1.5 bg-neutral-900 border border-neutral-800 text-neutral-300 rounded text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-white text-black font-bold rounded text-xs"
                >
                  Publicar no Feed
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
