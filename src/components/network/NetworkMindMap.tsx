import React, { useState, useRef, useEffect } from 'react';
import {
  Share2,
  Plus,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Search,
  Filter,
  Link as LinkIcon,
  Unlink,
  Trash2,
  Copy,
  Edit,
  MessageSquare,
  Paperclip,
  X,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Clock,
  User as UserIcon,
  Shield,
  Layers,
  Sparkles,
  Maximize2,
  FileDown,
  Info,
} from 'lucide-react';
import { useSycron } from '../../context/SycronContext';
import { NetworkNode, NetworkConnection, NodeCategory, PriorityLevel } from '../../types';

interface NetworkMindMapProps {
  isMiniView?: boolean;
  onExpand?: () => void;
}

export const NetworkMindMap: React.FC<NetworkMindMapProps> = ({
  isMiniView = false,
  onExpand,
}) => {
  const {
    nodes,
    connections,
    selectedNodeId,
    setSelectedNodeId,
    createNode,
    updateNode,
    deleteNode,
    duplicateNode,
    confirmNode,
    addNodeComment,
    addNodeAttachment,
    createConnection,
    deleteConnection,
    currentUser,
    focusEntity,
  } = useSycron();

  // Canvas Viewport Transformation
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Node Dragging State
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Interactive Linking Tool (Connect Mode)
  const [isConnectMode, setIsConnectMode] = useState(false);
  const [connectSourceNodeId, setConnectSourceNodeId] = useState<string | null>(null);

  // Search and Category Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');

  // Modals & Panels
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [attachmentName, setAttachmentName] = useState('');

  // Create/Edit Node Form State
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<NodeCategory>('INFORMATION');
  const [formLocation, setFormLocation] = useState('São Paulo — Eixo Central');
  const [formPriority, setFormPriority] = useState<PriorityLevel>('HIGH');
  const [formDescription, setFormDescription] = useState('');
  const [formTags, setFormTags] = useState('');

  const svgRef = useRef<SVGSVGElement>(null);

  // Selected node object
  const activeNode = nodes.find((n) => n.id === selectedNodeId) || null;

  // Zoom handlers
  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.2, 2.2));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.2, 0.5));
  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Canvas Pan Handlers
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.target === svgRef.current || (e.target as HTMLElement).tagName === 'rect') {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    } else if (draggingNodeId && svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      const rawX = (e.clientX - rect.left - pan.x) / zoom;
      const rawY = (e.clientY - rect.top - pan.y) / zoom;

      updateNode(draggingNodeId, {
        x: Math.round(rawX - dragOffset.x),
        y: Math.round(rawY - dragOffset.y),
      });
    }
  };

  const handleCanvasMouseUp = () => {
    setIsPanning(false);
    setDraggingNodeId(null);
  };

  // Node Click & Interaction
  const handleNodeMouseDown = (e: React.MouseEvent, node: NetworkNode) => {
    e.stopPropagation();

    if (isConnectMode) {
      if (!connectSourceNodeId) {
        setConnectSourceNodeId(node.id);
      } else if (connectSourceNodeId !== node.id) {
        createConnection(connectSourceNodeId, node.id, 'Correlação Analítica', 'DIRECT');
        setConnectSourceNodeId(null);
        setIsConnectMode(false);
      }
      return;
    }

    setSelectedNodeId(node.id);
    setDraggingNodeId(node.id);

    if (svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      const nodeScreenX = node.x * zoom + pan.x + rect.left;
      const nodeScreenY = node.y * zoom + pan.y + rect.top;
      setDragOffset({
        x: (e.clientX - nodeScreenX) / zoom,
        y: (e.clientY - nodeScreenY) / zoom,
      });
    }
  };

  // Create Node Submit
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const tagsArray = formTags
      .split(',')
      .map((t) => t.trim().toUpperCase())
      .filter((t) => t.length > 0);

    // Pick dynamic position near canvas center
    const posX = 400 + (Math.random() * 200 - 100);
    const posY = 300 + (Math.random() * 200 - 100);

    createNode({
      title: formTitle,
      category: formCategory,
      location: formLocation || 'Geral',
      priority: formPriority,
      description: formDescription || 'Sem descrição analítica detalhada.',
      tags: tagsArray.length ? tagsArray : [formCategory],
      x: posX,
      y: posY,
    });

    setIsCreateModalOpen(false);
    setFormTitle('');
    setFormDescription('');
    setFormTags('');
  };

  // Edit Node Submit
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeNode || !formTitle.trim()) return;

    const tagsArray = formTags
      .split(',')
      .map((t) => t.trim().toUpperCase())
      .filter((t) => t.length > 0);

    updateNode(activeNode.id, {
      title: formTitle,
      category: formCategory,
      location: formLocation,
      priority: formPriority,
      description: formDescription,
      tags: tagsArray,
    });

    setIsEditModalOpen(false);
  };

  const openEditModal = () => {
    if (!activeNode) return;
    setFormTitle(activeNode.title);
    setFormCategory(activeNode.category);
    setFormLocation(activeNode.location);
    setFormPriority(activeNode.priority);
    setFormDescription(activeNode.description);
    setFormTags(activeNode.tags.join(', '));
    setIsEditModalOpen(true);
  };

  // Add Comment Handler
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeNode || !commentInput.trim()) return;
    addNodeComment(activeNode.id, commentInput);
    setCommentInput('');
  };

  // Add Attachment Handler
  const handleAddAttachment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeNode || !attachmentName.trim()) return;
    addNodeAttachment(activeNode.id, {
      name: attachmentName,
      size: `${(Math.random() * 8 + 0.5).toFixed(1)} MB`,
      type: attachmentName.split('.').pop()?.toUpperCase() || 'DATA',
    });
    setAttachmentName('');
  };

  // Organic expansion helper
  const handleSimulateCollaborativeGrowth = () => {
    const templates = [
      {
        title: 'TELEMETRIA: Rajada de Pacotes UDP Malformados',
        category: 'INFORMATION' as NodeCategory,
        priority: 'HIGH' as PriorityLevel,
        location: 'Roteador BGP Primário',
        description: 'Pico repentino de tráfego UDP em porta 53 com cabeçalho truncado.',
        tags: ['UDP-FLOOD', 'BGP', 'TELEMETRIA'],
      },
      {
        title: 'PARTICIPANTE: Equipe DFIR Externa Alocada',
        category: 'PARTICIPANTE' as NodeCategory,
        priority: 'MEDIUM' as PriorityLevel,
        location: 'Laboratório Pericial',
        description: 'Peritos forenses realizando análise de memória RAM dos servidores afetados.',
        tags: ['DFIR', 'FORENSE', 'MEMORIA'],
      },
      {
        title: 'EVIDÊNCIA: Dump de Tráfego Wi-Fi em Modo Promíscuo',
        category: 'INCIDENT' as NodeCategory,
        priority: 'LOW' as PriorityLevel,
        location: 'Av. Paulista x R. Bela Cintra',
        description: 'Captura PCAP de 4.5 GB contendo beacons forjados de rede corporativa.',
        tags: ['PCAP', 'WIFI', 'SNIFFING'],
      },
    ];

    const pick = templates[Math.floor(Math.random() * templates.length)];
    createNode({
      ...pick,
      x: 350 + (Math.random() * 300 - 150),
      y: 280 + (Math.random() * 300 - 150),
    });
  };

  // Filter nodes
  const filteredNodes = nodes.filter((n) => {
    const matchesCategory =
      selectedCategoryFilter === 'ALL' || n.category === selectedCategoryFilter;
    const matchesSearch =
      !searchQuery ||
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div
      id="network-mindmap-container"
      className={`relative w-full ${isMiniView ? 'h-[360px]' : 'h-full min-h-[620px] flex-1'} bg-black border border-neutral-800 rounded-lg overflow-hidden flex flex-col`}
    >
      {/* Top Controls Toolbar */}
      <div className="h-11 bg-neutral-950 border-b border-neutral-800 px-3 flex items-center justify-between z-10 text-xs font-mono">
        <div className="flex items-center gap-2">
          <Share2 size={15} className="text-white" />
          <span className="font-bold text-white uppercase tracking-wider">
            {isMiniView ? 'Teia de Inteligência' : 'Data Mind Map / Intelligence Network'}
          </span>
          <span className="hidden sm:inline text-[10px] text-neutral-400">
            [NÓS: {nodes.length} | LINKS: {connections.length}]
          </span>
        </div>

        {/* Toolbar Action Buttons */}
        <div className="flex items-center gap-1.5">
          {!isMiniView && (
            <>
              {/* Organic Growth Trigger */}
              <button
                id="btn-simulate-growth"
                onClick={handleSimulateCollaborativeGrowth}
                className="hidden md:flex items-center gap-1 px-2.5 py-1 bg-neutral-900 border border-neutral-800 hover:border-neutral-600 text-neutral-300 hover:text-white rounded text-[10px] transition-colors"
                title="Alimentar rede com novo dado colaborativo"
              >
                <Sparkles size={12} className="text-white" />
                <span>Alimentar Teia</span>
              </button>

              {/* Connect Mode Toggle */}
              <button
                id="btn-connect-mode"
                onClick={() => {
                  setIsConnectMode(!isConnectMode);
                  setConnectSourceNodeId(null);
                }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-[10px] border transition-colors ${
                  isConnectMode
                    ? 'bg-white text-black font-bold border-white animate-pulse'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:text-white'
                }`}
                title="Modo Conectar: Selecione dois blocos para ligar"
              >
                <LinkIcon size={12} />
                <span>{isConnectMode ? 'Selecione 2 Nós...' : 'Conectar Blocos'}</span>
              </button>

              {/* Create Node Trigger */}
              <button
                id="btn-create-node-modal"
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center gap-1 px-2.5 py-1 bg-white text-black font-bold rounded hover:bg-neutral-200 text-[10px] transition-colors"
              >
                <Plus size={13} />
                <span>Novo Bloco</span>
              </button>
            </>
          )}

          {isMiniView && onExpand && (
            <button
              onClick={onExpand}
              className="px-2 py-1 bg-neutral-900 border border-neutral-700 hover:bg-neutral-800 text-white rounded text-[10px] transition-colors"
            >
              Expandir Teia
            </button>
          )}

          {/* Zoom controls */}
          <div className="flex items-center gap-0.5 bg-neutral-900 border border-neutral-800 rounded p-0.5">
            <button
              onClick={handleZoomIn}
              className="p-1 text-neutral-300 hover:text-white hover:bg-neutral-800 rounded"
              title="Zoom In"
            >
              <ZoomIn size={13} />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-1 text-neutral-300 hover:text-white hover:bg-neutral-800 rounded"
              title="Zoom Out"
            >
              <ZoomOut size={13} />
            </button>
            <button
              onClick={handleReset}
              className="p-1 text-neutral-300 hover:text-white hover:bg-neutral-800 rounded"
              title="Resetar Câmera"
            >
              <RotateCcw size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Category filter bar (full view) */}
      {!isMiniView && (
        <div className="bg-black/90 border-b border-neutral-900 px-3 py-1.5 flex items-center justify-between gap-2 overflow-x-auto text-[11px] font-mono z-10">
          <div className="flex items-center gap-1">
            <Filter size={12} className="text-neutral-400 mr-1" />
            {(['ALL', 'REGION', 'ALERT', 'PARTICIPANTE', 'NEWS', 'INCIDENT', 'INFORMATION'] as const).map(
              (cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategoryFilter(cat)}
                  className={`px-2 py-0.5 rounded whitespace-nowrap transition-colors ${
                    selectedCategoryFilter === cat
                      ? 'bg-neutral-800 text-white font-semibold'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              )
            )}
          </div>

          <div className="relative min-w-[180px]">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filtrar blocos..."
              className="w-full bg-neutral-950 border border-neutral-800 rounded px-2 py-0.5 text-[11px] font-mono text-white placeholder-neutral-400 focus:outline-none focus:border-neutral-600"
            />
          </div>
        </div>
      )}

      {/* Main Interactive Canvas & Inspector */}
      <div className="flex-1 relative flex overflow-hidden">
        {/* SVG Interactive Canvas */}
        <div
          id="mindmap-viewport"
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          className="flex-1 h-full relative cursor-grab active:cursor-grabbing bg-black select-none overflow-hidden bg-grid-pattern"
        >
          <svg
            ref={svgRef}
            className="w-full h-full"
            viewBox="0 0 1000 800"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: 'center center',
            }}
          >
            <defs>
              <marker
                id="arrow"
                viewBox="0 0 10 10"
                refX="22"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#777777" />
              </marker>
              <marker
                id="arrow-active"
                viewBox="0 0 10 10"
                refX="22"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#ffffff" />
              </marker>
            </defs>

            {/* Render Connecting Bezier Lines between Nodes */}
            <g id="network-connections-layer">
              {connections.map((conn) => {
                const source = nodes.find((n) => n.id === conn.sourceId);
                const target = nodes.find((n) => n.id === conn.targetId);
                if (!source || !target) return null;

                const isConnectedToSelected =
                  selectedNodeId === source.id || selectedNodeId === target.id;

                // Calculate smooth cubic bezier path
                const dx = target.x - source.x;
                const dy = target.y - source.y;
                const cx1 = source.x + dx / 2;
                const cy1 = source.y;
                const cx2 = source.x + dx / 2;
                const cy2 = target.y;

                const pathData = `M ${source.x} ${source.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${target.x} ${target.y}`;
                const midX = (source.x + target.x) / 2;
                const midY = (source.y + target.y) / 2;

                return (
                  <g key={conn.id} className="group/conn cursor-pointer">
                    {/* Hover hit area */}
                    <path
                      d={pathData}
                      fill="none"
                      stroke="transparent"
                      strokeWidth="16"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`Desconectar ligação (${conn.label || 'Link'})?`)) {
                          deleteConnection(conn.id);
                        }
                      }}
                    />

                    {/* Visible line */}
                    <path
                      d={pathData}
                      fill="none"
                      stroke={isConnectedToSelected ? '#ffffff' : '#3f3f46'}
                      strokeWidth={isConnectedToSelected ? 1.8 : 1.2}
                      strokeDasharray={conn.type === 'CORRELATED' ? '4,4' : 'none'}
                      markerEnd={isConnectedToSelected ? 'url(#arrow-active)' : 'url(#arrow)'}
                      className="transition-all duration-150 group-hover/conn:stroke-neutral-300"
                    />

                    {/* Connection Label tag */}
                    {conn.label && (
                      <g
                        transform={`translate(${midX}, ${midY})`}
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteConnection(conn.id);
                        }}
                      >
                        <rect
                          x="-45"
                          y="-8"
                          width="90"
                          height="16"
                          rx="2"
                          fill="#09090b"
                          stroke={isConnectedToSelected ? '#71717a' : '#27272a'}
                          strokeWidth="0.8"
                        />
                        <text
                          x="0"
                          y="3"
                          fill={isConnectedToSelected ? '#ffffff' : '#a1a1aa'}
                          fontSize="7.5"
                          fontFamily="monospace"
                          textAnchor="middle"
                        >
                          {conn.label}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </g>

            {/* Render Node Blocks */}
            <g id="network-nodes-layer">
              {filteredNodes.map((node) => {
                const isSelected = selectedNodeId === node.id;
                const isSourceConnect = connectSourceNodeId === node.id;
                const isRoot = node.isMainBlock;

                const nodeWidth = isRoot ? 220 : 190;
                const nodeHeight = isRoot ? 110 : 95;

                return (
                  <g
                    key={node.id}
                    id={`mindmap-node-${node.id}`}
                    transform={`translate(${node.x - nodeWidth / 2}, ${node.y - nodeHeight / 2})`}
                    onMouseDown={(e) => handleNodeMouseDown(e, node)}
                    className="cursor-pointer select-none group"
                  >
                    {/* Outer Glow / Focus Ring */}
                    {(isSelected || isSourceConnect) && (
                      <rect
                        x="-4"
                        y="-4"
                        width={nodeWidth + 8}
                        height={nodeHeight + 8}
                        rx="4"
                        fill="none"
                        stroke="#ffffff"
                        strokeWidth="1.5"
                        strokeDasharray={isSourceConnect ? '3,3' : 'none'}
                        className={isSourceConnect ? 'animate-pulse' : ''}
                      />
                    )}

                    {/* Node Card Background */}
                    <rect
                      x="0"
                      y="0"
                      width={nodeWidth}
                      height={nodeHeight}
                      rx="3"
                      fill={isRoot ? '#121214' : '#09090b'}
                      stroke={isSelected ? '#ffffff' : isRoot ? '#52525b' : '#27272a'}
                      strokeWidth={isRoot ? 1.5 : 1}
                      className="transition-all duration-150 group-hover:stroke-neutral-400"
                    />

                    {/* Node Category Top Stripe */}
                    <rect
                      x="0"
                      y="0"
                      width={nodeWidth}
                      height="20"
                      rx="2"
                      fill={isRoot ? '#27272a' : '#18181b'}
                    />

                    {/* Category Label */}
                    <text
                      x="8"
                      y="14"
                      fill="#ffffff"
                      fontSize="8.5"
                      fontFamily="monospace"
                      fontWeight="bold"
                      letterSpacing="0.5"
                    >
                      [{node.category}]
                    </text>

                    {/* Priority Badge */}
                    <text
                      x={nodeWidth - 8}
                      y="14"
                      fill={
                        node.priority === 'CRITICAL'
                          ? '#ffffff'
                          : node.priority === 'HIGH'
                          ? '#d4d4d8'
                          : '#a1a1aa'
                      }
                      fontSize="7.5"
                      fontFamily="monospace"
                      textAnchor="end"
                      fontWeight="bold"
                    >
                      {node.priority}
                    </text>

                    {/* Title */}
                    <text
                      x="8"
                      y="37"
                      fill="#ffffff"
                      fontSize="9.5"
                      fontFamily="monospace"
                      fontWeight="600"
                      width={nodeWidth - 16}
                    >
                      {node.title.length > 24 ? `${node.title.slice(0, 24)}...` : node.title}
                    </text>

                    {/* Location */}
                    <text
                      x="8"
                      y="52"
                      fill="#a1a1aa"
                      fontSize="8"
                      fontFamily="monospace"
                    >
                      📍 {node.location.slice(0, 26)}
                    </text>

                    {/* Metadata line: Author & Time */}
                    <text
                      x="8"
                      y="66"
                      fill="#71717a"
                      fontSize="7.5"
                      fontFamily="monospace"
                    >
                      👤 {node.authorName.split(' ')[0]} • {node.time}
                    </text>

                    {/* Bottom stats footer inside card */}
                    <line
                      x1="0"
                      y1={nodeHeight - 20}
                      x2={nodeWidth}
                      y2={nodeHeight - 20}
                      stroke="#27272a"
                      strokeWidth="0.8"
                    />

                    <text
                      x="8"
                      y={nodeHeight - 7}
                      fill="#a1a1aa"
                      fontSize="7.5"
                      fontFamily="monospace"
                    >
                      ✓ {node.confirmations} confs
                    </text>

                    <text
                      x={nodeWidth - 8}
                      y={nodeHeight - 7}
                      fill="#71717a"
                      fontSize="7.5"
                      fontFamily="monospace"
                      textAnchor="end"
                    >
                      💬 {node.comments.length} • 📎 {node.attachments.length}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>

          {/* Quick instructions floating banner */}
          <div className="absolute bottom-3 left-3 bg-neutral-950/90 border border-neutral-800 rounded p-2 text-[10px] font-mono text-neutral-400 backdrop-blur-xs hidden md:block">
            <span>💡 Arraste para mover blocos • Clique para inspecionar • Use &quot;Conectar Blocos&quot; para ligar dados</span>
          </div>
        </div>

        {/* Node Detail Inspector Drawer */}
        {activeNode && !isMiniView && (
          <div
            id="mindmap-node-inspector"
            className="w-88 bg-neutral-950 border-l border-neutral-800 flex flex-col justify-between overflow-y-auto text-xs font-mono z-20"
          >
            {/* Header */}
            <div className="p-3.5 border-b border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 rounded bg-neutral-800 text-white font-bold text-[10px]">
                  {activeNode.category}
                </span>
                <span className="text-[10px] text-neutral-400">ID: {activeNode.id}</span>
              </div>
              <button
                onClick={() => setSelectedNodeId(null)}
                className="text-neutral-400 hover:text-white p-1 rounded"
              >
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 p-3.5 space-y-4 overflow-y-auto">
              {/* Title & Priority */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span
                    className={`px-1.5 py-0.2 rounded text-[9px] font-bold border ${
                      activeNode.priority === 'CRITICAL'
                        ? 'bg-white text-black border-white'
                        : activeNode.priority === 'HIGH'
                        ? 'bg-neutral-800 text-white border-neutral-600'
                        : 'bg-neutral-900 text-neutral-400 border-neutral-800'
                    }`}
                  >
                    PRIORIDADE: {activeNode.priority}
                  </span>
                  <span className="text-[10px] text-neutral-400">
                    {activeNode.date} às {activeNode.time}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white leading-snug">{activeNode.title}</h3>
              </div>

              {/* Metadata rows */}
              <div className="p-2.5 rounded bg-neutral-900/60 border border-neutral-800 space-y-1.5 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400 flex items-center gap-1">
                    <MapPin size={12} /> Localização:
                  </span>
                  <span className="text-white font-medium truncate max-w-[150px]">
                    {activeNode.location}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400 flex items-center gap-1">
                    <UserIcon size={12} /> Autor:
                  </span>
                  <span className="text-white font-medium">{activeNode.authorName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400 flex items-center gap-1">
                    <CheckCircle2 size={12} /> Confirmações:
                  </span>
                  <span className="text-white font-bold">{activeNode.confirmations} analistas</span>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
                  Descrição Analítica
                </span>
                <p className="text-[11px] text-neutral-300 leading-relaxed bg-black/60 p-2.5 rounded border border-neutral-900">
                  {activeNode.description}
                </p>
              </div>

              {/* Tags */}
              <div className="space-y-1">
                <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
                  Tags & IOCs
                </span>
                <div className="flex flex-wrap gap-1">
                  {activeNode.tags.map((t) => (
                    <span
                      key={t}
                      className="px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-[9px] text-neutral-300"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Attachments / Evidences */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-1">
                    <Paperclip size={11} /> Anexos & Evidências ({activeNode.attachments.length})
                  </span>
                </div>

                <div className="space-y-1">
                  {activeNode.attachments.length === 0 ? (
                    <div className="p-2 text-center text-neutral-400 text-[10px]">
                      Nenhuma evidência anexada a este bloco.
                    </div>
                  ) : (
                    activeNode.attachments.map((att) => (
                      <div
                        key={att.id}
                        className="p-1.5 rounded bg-neutral-900 border border-neutral-800 flex items-center justify-between text-[10px]"
                      >
                        <div className="flex items-center gap-2 truncate pr-2">
                          <span className="px-1 py-0.2 rounded bg-neutral-800 text-neutral-300 font-mono text-[9px]">
                            {att.type}
                          </span>
                          <span className="text-white truncate">{att.name}</span>
                        </div>
                        <span className="text-neutral-400 shrink-0">{att.size}</span>
                      </div>
                    ))
                  )}

                  {/* Add attachment form */}
                  <form onSubmit={handleAddAttachment} className="flex gap-1 pt-1">
                    <input
                      type="text"
                      value={attachmentName}
                      onChange={(e) => setAttachmentName(e.target.value)}
                      placeholder="Nome do arquivo (ex: dump.pcap)..."
                      className="flex-1 bg-black border border-neutral-800 rounded px-2 py-1 text-[10px] text-white placeholder-neutral-400 focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-white rounded text-[10px]"
                    >
                      Anexar
                    </button>
                  </form>
                </div>
              </div>

              {/* Collaborative Comments */}
              <div className="space-y-2">
                <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-1">
                  <MessageSquare size={11} /> Discussão Colaborativa ({activeNode.comments.length})
                </span>

                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {activeNode.comments.length === 0 ? (
                    <div className="p-2 text-center text-neutral-400 text-[10px]">
                      Nenhum comentário adicionado ainda.
                    </div>
                  ) : (
                    activeNode.comments.map((c) => (
                      <div
                        key={c.id}
                        className="p-2 rounded bg-neutral-900/80 border border-neutral-800 space-y-0.5 text-[10px]"
                      >
                        <div className="flex items-center justify-between text-neutral-400">
                          <span className="font-semibold text-neutral-200">
                            {c.authorName} ({c.authorRole})
                          </span>
                          <span>{c.timestamp}</span>
                        </div>
                        <p className="text-neutral-300 leading-relaxed">{c.content}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Add comment input */}
                <form onSubmit={handleAddComment} className="space-y-1.5 pt-1">
                  <textarea
                    rows={2}
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    placeholder="Adicionar nota técnica ou correlação..."
                    className="w-full bg-black border border-neutral-800 rounded p-2 text-[11px] text-white placeholder-neutral-400 focus:outline-none focus:border-neutral-600 resize-none"
                  />
                  <button
                    type="submit"
                    className="w-full py-1 bg-neutral-800 hover:bg-neutral-700 text-white rounded text-[10px] font-semibold transition-colors"
                  >
                    Comentar no Bloco
                  </button>
                </form>
              </div>
            </div>

            {/* Inspector Footer Actions */}
            <div className="p-3 border-t border-neutral-800 bg-neutral-950 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => confirmNode(activeNode.id)}
                  className={`py-1.5 px-2 rounded border text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors ${
                    activeNode.userConfirmed
                      ? 'bg-white text-black border-white'
                      : 'bg-neutral-900 border-neutral-700 text-neutral-200 hover:text-white hover:bg-neutral-800'
                  }`}
                >
                  <CheckCircle2 size={13} />
                  <span>{activeNode.userConfirmed ? 'Confirmado ✓' : 'Confirmar Dado'}</span>
                </button>

                <button
                  onClick={openEditModal}
                  className="py-1.5 px-2 bg-neutral-900 border border-neutral-700 hover:bg-neutral-800 text-white rounded text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Edit size={13} />
                  <span>Editar</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => duplicateNode(activeNode.id)}
                  className="py-1.5 px-2 bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-neutral-300 rounded text-[10px] flex items-center justify-center gap-1 transition-colors"
                >
                  <Copy size={12} />
                  <span>Duplicar</span>
                </button>

                <button
                  onClick={() => {
                    if (window.confirm(`Excluir permanentemente o bloco "${activeNode.title}"?`)) {
                      deleteNode(activeNode.id);
                    }
                  }}
                  className="py-1.5 px-2 bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-neutral-300 hover:text-white rounded text-[10px] flex items-center justify-center gap-1 transition-colors"
                >
                  <Trash2 size={12} />
                  <span>Excluir</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CREATE NODE MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-neutral-950 border border-neutral-800 rounded-lg p-5 space-y-4 shadow-2xl font-mono text-xs">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <Plus size={16} className="text-white" />
                <h3 className="font-bold text-white uppercase tracking-wider text-sm">
                  Adicionar Bloco de Inteligência
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
                  Título da Informação
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Ex: Ponto de Injeção SQL em Endpoint de Autenticação..."
                  className="w-full bg-black border border-neutral-800 rounded p-2 text-xs text-white placeholder-neutral-400 focus:outline-none focus:border-neutral-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-neutral-400 uppercase tracking-wider block">
                    Categoria do Bloco
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as NodeCategory)}
                    className="w-full bg-black border border-neutral-800 rounded p-2 text-xs text-white focus:outline-none"
                  >
                    <option value="INFORMATION">INFORMAÇÃO / EVIDÊNCIA</option>
                    <option value="ALERT">ALERTA DE SEGURANÇA</option>
                    <option value="INCIDENT">OCORRÊNCIA</option>
                    <option value="NEWS">NOTÍCIA / RELATO</option>
                    <option value="PARTICIPANTE">PARTICIPANTE / EQUIPE</option>
                    <option value="REGION">REGIÃO / SETOR</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-neutral-400 uppercase tracking-wider block">
                    Nível de Prioridade
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
                    <option value="RESOLVED">RESOLVED (Resolvido)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-neutral-400 uppercase tracking-wider block">
                  Localização / Vetor de Rede
                </label>
                <input
                  type="text"
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  placeholder="Ex: Av. Paulista, 1374 ou IP 185.220.101.5..."
                  className="w-full bg-black border border-neutral-800 rounded p-2 text-xs text-white placeholder-neutral-400 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-neutral-400 uppercase tracking-wider block">
                  Descrição Analítica & Detalhes
                </label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Descreva o vetor identificado, impacto potencial e evidências observadas..."
                  className="w-full bg-black border border-neutral-800 rounded p-2 text-xs text-white placeholder-neutral-400 focus:outline-none resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-neutral-400 uppercase tracking-wider block">
                  Tags / IOCs (separadas por vírgula)
                </label>
                <input
                  type="text"
                  value={formTags}
                  onChange={(e) => setFormTags(e.target.value)}
                  placeholder="SQLI, AUTH, CVE-2024-XXXX, ZERO-DAY"
                  className="w-full bg-black border border-neutral-800 rounded p-2 text-xs text-white placeholder-neutral-400 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-3 py-1.5 bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-neutral-300 rounded text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-white text-black font-bold rounded hover:bg-neutral-200 text-xs"
                >
                  Incorporar à Teia
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT NODE MODAL */}
      {isEditModalOpen && activeNode && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-neutral-950 border border-neutral-800 rounded-lg p-5 space-y-4 shadow-2xl font-mono text-xs">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="font-bold text-white uppercase tracking-wider text-sm">
                Editar Bloco de Inteligência
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] text-neutral-400 uppercase tracking-wider block">
                  Título
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full bg-black border border-neutral-800 rounded p-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-neutral-400 uppercase tracking-wider block">
                    Categoria
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as NodeCategory)}
                    className="w-full bg-black border border-neutral-800 rounded p-2 text-xs text-white focus:outline-none"
                  >
                    <option value="INFORMATION">INFORMAÇÃO / EVIDÊNCIA</option>
                    <option value="ALERT">ALERTA DE SEGURANÇA</option>
                    <option value="INCIDENT">OCORRÊNCIA</option>
                    <option value="NEWS">NOTÍCIA / RELATO</option>
                    <option value="PARTICIPANTE">PARTICIPANTE / EQUIPE</option>
                    <option value="REGION">REGIÃO / SETOR</option>
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
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="LOW">LOW</option>
                    <option value="RESOLVED">RESOLVED</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-neutral-400 uppercase tracking-wider block">
                  Localização
                </label>
                <input
                  type="text"
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  className="w-full bg-black border border-neutral-800 rounded p-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-neutral-400 uppercase tracking-wider block">
                  Descrição
                </label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full bg-black border border-neutral-800 rounded p-2 text-xs text-white focus:outline-none resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-neutral-400 uppercase tracking-wider block">
                  Tags (vírgula)
                </label>
                <input
                  type="text"
                  value={formTags}
                  onChange={(e) => setFormTags(e.target.value)}
                  className="w-full bg-black border border-neutral-800 rounded p-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-3 py-1.5 bg-neutral-900 border border-neutral-800 text-neutral-300 rounded text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-white text-black font-bold rounded text-xs"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
