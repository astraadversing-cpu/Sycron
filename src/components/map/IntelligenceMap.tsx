import React, { useState, useRef } from 'react';
import {
  MapPin,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Shield,
  AlertTriangle,
  Users,
  Activity,
  Filter,
  Eye,
  Share2,
  Plus,
  Layers,
  Search,
  Radio,
  Clock,
  Compass,
} from 'lucide-react';
import { useSycron } from '../../context/SycronContext';
import { RegionZone, SecurityAlert, PriorityLevel } from '../../types';

const EMPTY_REGION: RegionZone = {
  id: '',
  name: 'Nenhum setor cadastrado',
  code: 'AGUARDANDO DADOS',
  coordinates: { x: 400, y: 300, lat: 0, lng: 0 },
  threatLevel: 'LOW',
  activeAlertsCount: 0,
  activeAnalysts: 0,
  description: 'Cadastre um setor para visualizar sua área de risco e telemetria.',
  incidentsHistory: [],
};

interface IntelligenceMapProps {
  isMiniView?: boolean;
  onOpenFullMap?: () => void;
}

export const IntelligenceMap: React.FC<IntelligenceMapProps> = ({
  isMiniView = false,
  onOpenFullMap,
}) => {
  const {
    regions,
    selectedRegionId,
    setSelectedRegionId,
    alerts,
    participants,
    focusEntity,
    setCurrentTab,
  } = useSycron();

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Filters
  const [showParticipantPins, setShowParticipantPins] = useState(true);
  const [showAlertPins, setShowAlertPins] = useState(true);
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<string>('ALL');

  const selectedRegion = regions.find((r) => r.id === selectedRegionId) || regions[0] || EMPTY_REGION;

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 2.5));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.6));
  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Filter alerts by risk level
  const filteredAlerts = alerts.filter((a) => {
    if (selectedRiskFilter === 'ALL') return true;
    return a.priority === selectedRiskFilter;
  });

  const alertsInSelectedRegion = alerts.filter(
    (a) =>
      a.location.toLowerCase().includes(selectedRegion.name.toLowerCase().replace('setor ', '').replace('polo ', '')) ||
      (selectedRegion.id === 'reg-03' && a.location.toLowerCase().includes('paulista')) ||
      (selectedRegion.id === 'reg-01' && a.location.toLowerCase().includes('centro')) ||
      (selectedRegion.id === 'reg-02' && a.location.toLowerCase().includes('berrini'))
  );

  return (
    <div
      id="intelligence-map-component"
      className={`relative w-full ${isMiniView ? 'h-[360px]' : 'h-full min-h-[600px] flex-1'} bg-black border border-neutral-800 rounded-lg overflow-hidden flex flex-col`}
    >
      {/* Top Map Toolbar */}
      <div className="h-11 bg-neutral-950 border-b border-neutral-800 px-3 flex items-center justify-between z-10 text-xs font-mono">
        <div className="flex items-center gap-2">
          <Compass size={15} className="text-white" />
          <span className="font-bold text-white uppercase tracking-wider">
            {isMiniView ? 'Mini Mapa Geográfico' : 'Intelligence Spatial Map'}
          </span>
          <span className="hidden sm:inline text-[10px] text-neutral-400">
            [DATUM: WGS84 // GRID METROPOLITANO]
          </span>
        </div>

        {/* Filters & Actions */}
        <div className="flex items-center gap-1.5">
          {!isMiniView && (
            <div className="hidden md:flex items-center gap-1 bg-black border border-neutral-800 rounded px-2 py-0.5 text-[10px]">
              <span className="text-neutral-400">RISCO:</span>
              {(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setSelectedRiskFilter(lvl)}
                  className={`px-1.5 py-0.5 rounded transition-colors ${
                    selectedRiskFilter === lvl
                      ? 'bg-white text-black font-bold'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          )}

          {isMiniView && onOpenFullMap && (
            <button
              onClick={onOpenFullMap}
              className="px-2 py-1 bg-neutral-900 border border-neutral-700 hover:bg-neutral-800 text-white rounded text-[10px] font-mono transition-colors"
            >
              Expandir Mapa
            </button>
          )}

          {/* Zoom Controls */}
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
              title="Resetar Posição"
            >
              <RotateCcw size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Map Body: Canvas + Inspector Sidebar */}
      <div className="flex-1 relative flex overflow-hidden">
        {/* Interactive SVG Canvas */}
        <div
          id="map-canvas-viewport"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className={`flex-1 h-full relative cursor-grab active:cursor-grabbing bg-black select-none overflow-hidden bg-dot-pattern`}
        >
          <svg
            className="w-full h-full transition-transform duration-75"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: 'center center',
            }}
            viewBox="0 0 800 600"
          >
            <defs>
              {/* Discrete radar radar sweep gradient */}
              <linearGradient id="grid-fade" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0.01" />
              </linearGradient>

              <pattern id="tactical-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#222222" strokeWidth="0.8" />
              </pattern>
            </defs>

            {/* Tactical Grid Background */}
            <rect width="800" height="600" fill="url(#tactical-grid)" />

            {/* Metro Geography Vector Contours (Abstract Metropolitan Outline) */}
            <g id="map-contours" stroke="#333333" fill="none" strokeWidth="1" opacity="0.8">
              <path d="M 120 100 Q 240 80 400 90 T 680 120 T 740 320 T 660 520 T 360 560 T 140 480 Z" strokeDasharray="3,3" />
              <path d="M 180 150 C 290 140, 390 180, 520 160 C 620 150, 680 280, 640 420 C 580 500, 420 500, 260 480 C 160 440, 140 280, 180 150 Z" />
              {/* Main Transit Arterials / Fiber Backbones */}
              <path d="M 150 200 L 380 280 L 520 440 L 680 480" stroke="#444444" strokeWidth="1.5" />
              <path d="M 440 160 L 380 280 L 360 320 L 310 390 L 260 480" stroke="#555555" strokeWidth="1.5" />
              <path d="M 220 180 L 380 280 L 620 300" stroke="#444444" strokeWidth="1.2" />
            </g>

            {/* Region Zones (Polygons / Clusters) */}
            {regions.map((reg) => {
              const isSelected = reg.id === selectedRegionId;
              const { x, y } = reg.coordinates;

              return (
                <g
                  key={reg.id}
                  id={`map-region-group-${reg.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedRegionId(reg.id);
                  }}
                  className="cursor-pointer group"
                >
                  {/* Subtle Zone Coverage Circle */}
                  <circle
                    cx={x}
                    cy={y}
                    r={isSelected ? 65 : 45}
                    fill={isSelected ? '#ffffff' : '#222222'}
                    fillOpacity={isSelected ? 0.08 : 0.04}
                    stroke={isSelected ? '#ffffff' : '#444444'}
                    strokeWidth={isSelected ? 1.5 : 0.8}
                    strokeDasharray={isSelected ? 'none' : '4,3'}
                    className="transition-all duration-200"
                  />

                  {/* Concentric Signal Rings */}
                  <circle
                    cx={x}
                    cy={y}
                    r={isSelected ? 30 : 20}
                    fill="none"
                    stroke={isSelected ? '#ffffff' : '#555555'}
                    strokeWidth="0.8"
                    opacity={isSelected ? 0.8 : 0.4}
                  />

                  {/* Core Node Marker */}
                  <circle
                    cx={x}
                    cy={y}
                    r={isSelected ? 6 : 4}
                    fill={isSelected ? '#ffffff' : '#888888'}
                    stroke="#000000"
                    strokeWidth="1.5"
                  />

                  {/* Region Label Tag */}
                  <rect
                    x={x - 45}
                    y={y + 12}
                    width="90"
                    height="18"
                    rx="2"
                    fill="#000000"
                    stroke={isSelected ? '#ffffff' : '#333333'}
                    strokeWidth="0.8"
                  />
                  <text
                    x={x}
                    y={y + 24}
                    fill={isSelected ? '#ffffff' : '#cccccc'}
                    fontSize="9"
                    fontFamily="monospace"
                    fontWeight={isSelected ? 'bold' : 'normal'}
                    textAnchor="middle"
                  >
                    {reg.code}
                  </text>
                </g>
              );
            })}

            {/* Alert Pin Markers */}
            {showAlertPins &&
              filteredAlerts.map((alt) => {
                const { x, y } = alt.coordinates;
                const isCritical = alt.priority === 'CRITICAL';

                return (
                  <g
                    key={alt.id}
                    id={`map-alert-pin-${alt.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      focusEntity('alert', alt.id);
                    }}
                    className="cursor-pointer group"
                  >
                    {/* Ping Animation for Critical */}
                    {isCritical && (
                      <circle
                        cx={x}
                        cy={y}
                        r="14"
                        fill="none"
                        stroke="#ffffff"
                        strokeWidth="1"
                        opacity="0.6"
                      >
                        <animate
                          attributeName="r"
                          values="8;20;8"
                          dur="2.5s"
                          repeatCount="indefinite"
                        />
                        <animate
                          attributeName="opacity"
                          values="0.8;0.1;0.8"
                          dur="2.5s"
                          repeatCount="indefinite"
                        />
                      </circle>
                    )}

                    {/* Threat Marker Icon */}
                    <polygon
                      points={`${x},${y - 12} ${x + 8},${y + 4} ${x - 8},${y + 4}`}
                      fill={isCritical ? '#ffffff' : '#999999'}
                      stroke="#000000"
                      strokeWidth="1.2"
                    />

                    {/* Alert label on hover / always */}
                    <rect
                      x={x + 10}
                      y={y - 10}
                      width="120"
                      height="16"
                      rx="2"
                      fill="#09090b"
                      stroke="#444444"
                      strokeWidth="0.8"
                      className="opacity-90"
                    />
                    <text
                      x={x + 14}
                      y={y + 1}
                      fill="#ffffff"
                      fontSize="8"
                      fontFamily="monospace"
                    >
                      {alt.title.slice(0, 18)}...
                    </text>
                  </g>
                );
              })}

            {/* Participant Analyst Nodes on the Map */}
            {showParticipantPins &&
              participants.slice(0, 6).map((p, idx) => {
                const px = 200 + ((idx * 90 + 40) % 450);
                const py = 180 + ((idx * 65 + 30) % 300);

                return (
                  <g
                    key={p.id}
                    id={`map-part-pin-${p.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      focusEntity('chat', 'chan-01');
                    }}
                    className="cursor-pointer group"
                  >
                    <circle
                      cx={px}
                      cy={py}
                      r="4"
                      fill="#555555"
                      stroke="#222222"
                      strokeWidth="1"
                    />
                    <text
                      x={px + 7}
                      y={py + 3}
                      fill="#888888"
                      fontSize="7"
                      fontFamily="monospace"
                      className="group-hover:fill-white transition-colors"
                    >
                      {p.name.split(' ')[0]} ({p.role.slice(0, 3)})
                    </text>
                  </g>
                );
              })}
          </svg>

          {/* Map Layer Legend Overlay */}
          <div className="absolute bottom-3 left-3 bg-neutral-950/90 border border-neutral-800 rounded p-2 text-[10px] font-mono space-y-1 backdrop-blur-xs pointer-events-auto">
            <div className="text-neutral-400 font-bold uppercase tracking-wider mb-1">
              Legenda Tática
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-white border border-black inline-block" />
              <span className="text-neutral-300">Alerta Crítico / Incidente Ativo</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-neutral-400 border border-black inline-block" />
              <span className="text-neutral-400">Alerta Médio / Investigação</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-white inline-block" />
              <span className="text-neutral-400">Núcleo Regional / Hub</span>
            </div>
          </div>
        </div>

        {/* Selected Region Detail Inspector Panel */}
        {!isMiniView && (
          <div
            id="map-region-inspector"
            className="w-80 bg-neutral-950 border-l border-neutral-800 p-4 flex flex-col justify-between overflow-y-auto space-y-4 text-xs font-mono"
          >
            <div className="space-y-3">
              {/* Region Title & Code */}
              <div className="border-b border-neutral-800 pb-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-neutral-400 uppercase tracking-widest">
                    Região Selecionada
                  </span>
                  <span
                    className={`px-1.5 py-0.2 rounded text-[9px] font-bold border ${
                      selectedRegion.threatLevel === 'CRITICAL'
                        ? 'bg-white text-black border-white'
                        : selectedRegion.threatLevel === 'HIGH'
                        ? 'bg-neutral-800 text-white border-neutral-600'
                        : 'bg-neutral-900 text-neutral-400 border-neutral-800'
                    }`}
                  >
                    AMEAÇA: {selectedRegion.threatLevel}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white">{selectedRegion.name}</h3>
                <span className="text-[11px] text-neutral-400 font-semibold">{selectedRegion.code}</span>
              </div>

              {/* Description */}
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                {selectedRegion.description}
              </p>

              {/* Telemetry Stats */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="p-2 rounded bg-neutral-900/60 border border-neutral-800 space-y-0.5">
                  <span className="text-[10px] text-neutral-400 uppercase">Alertas Ativos</span>
                  <div className="text-base font-bold text-white">
                    {selectedRegion.activeAlertsCount}
                  </div>
                </div>
                <div className="p-2 rounded bg-neutral-900/60 border border-neutral-800 space-y-0.5">
                  <span className="text-[10px] text-neutral-400 uppercase">Analistas</span>
                  <div className="text-base font-bold text-white">
                    {selectedRegion.activeAnalysts}
                  </div>
                </div>
              </div>

              {/* Incidents in this region */}
              <div className="space-y-1.5 pt-2">
                <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">
                  Alertas no Setor ({alertsInSelectedRegion.length})
                </span>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {alertsInSelectedRegion.length === 0 ? (
                    <div className="p-2 text-center text-neutral-400 text-[11px]">
                      Nenhum incidente crítico aberto no setor.
                    </div>
                  ) : (
                    alertsInSelectedRegion.map((alt) => (
                      <div
                        key={alt.id}
                        onClick={() => focusEntity('alert', alt.id)}
                        className="p-2 rounded bg-neutral-900/40 hover:bg-neutral-900 border border-neutral-800 cursor-pointer space-y-1 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-white truncate pr-2">
                            {alt.title}
                          </span>
                          <span className="text-[9px] text-neutral-400">{alt.time}</span>
                        </div>
                        <div className="flex items-center justify-between text-[9px] text-neutral-400">
                          <span>{alt.type}</span>
                          <span>{alt.confirmations} confirmações</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-neutral-800 space-y-2">
              <button
                onClick={() => setCurrentTab('network')}
                className="w-full py-2 px-3 bg-white text-black font-bold rounded hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2 text-xs"
              >
                <Share2 size={13} />
                <span>Visualizar na Teia (Mind Map)</span>
              </button>

              <button
                onClick={() => setCurrentTab('alerts')}
                className="w-full py-1.5 px-3 bg-neutral-900 border border-neutral-700 hover:bg-neutral-800 text-white rounded transition-colors flex items-center justify-center gap-2 text-xs"
              >
                <Plus size={13} />
                <span>Registrar Alerta no Setor</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
