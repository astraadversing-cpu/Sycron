import React, { useState } from 'react';
import {
  FileText,
  Download,
  Calendar,
  Filter,
  CheckCircle2,
  Share2,
  Shield,
  FileCode,
  Clock,
  Plus,
  ArrowDownToLine,
  Eye,
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { useSycron } from '../../context/SycronContext';
import { IntelligenceReport } from '../../types';

export const ReportsCenter: React.FC = () => {
  const {
    reports,
    createReport,
    alerts,
    nodes,
    regions,
    currentUser,
  } = useSycron();

  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // New report form state
  const [reportTitle, setReportTitle] = useState('Relatório Consolidado de Ameaças Cibernéticas');
  const [reportPeriod, setReportPeriod] = useState('Últimas 24 Horas');
  const [reportRegion, setReportRegion] = useState('Todos os Setores Metropolitanos');
  const [reportType, setReportType] = useState('Consolidado Executivo');

  const selectedReport = reports.find((r) => r.id === selectedReportId) || reports[0];

  // Generate Report in Context
  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    setTimeout(() => {
      createReport(reportType, reportPeriod, reportRegion);
      setIsGenerating(false);
    }, 600);
  };

  // Export as PDF using jsPDF
  const handleExportPDF = (rep: IntelligenceReport) => {
    const doc = new jsPDF();

    // Dark styled header banner
    doc.setFillColor(15, 15, 18);
    doc.rect(0, 0, 210, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('courier', 'bold');
    doc.setFontSize(16);
    doc.text('SYCRON // INTELLIGENCE SYSTEM', 14, 18);

    doc.setFontSize(9);
    doc.setFont('courier', 'normal');
    doc.text('CLASSIFICAÇÃO: TLP:AMBER | RESTRICTED INTELLIGENCE', 14, 26);
    doc.text(`HASH: ${rep.hash.slice(0, 32)}...`, 14, 33);

    // Body title
    doc.setTextColor(20, 20, 20);
    doc.setFontSize(14);
    doc.setFont('courier', 'bold');
    doc.text(rep.title, 14, 52);

    // Metadata box
    doc.setFontSize(9);
    doc.setFont('courier', 'normal');
    doc.text(`PERÍODO: ${rep.period}`, 14, 62);
    doc.text(`SETOR / REGIÃO: ${rep.region}`, 14, 68);
    doc.text(`GERADO POR: ${rep.generatedBy} (${rep.generatedByRole})`, 14, 74);
    doc.text(`DATA / HORA: ${rep.generatedAt}`, 14, 80);

    // Line separator
    doc.setDrawColor(180, 180, 180);
    doc.line(14, 86, 196, 86);

    // Executive Summary
    doc.setFont('courier', 'bold');
    doc.setFontSize(11);
    doc.text('1. RESUMO EXECUTIVO', 14, 96);

    doc.setFont('courier', 'normal');
    doc.setFontSize(9);
    const splitSummary = doc.splitTextToSize(rep.summary, 180);
    doc.text(splitSummary, 14, 104);

    // Telemetry Statistics
    const currentY = 104 + splitSummary.length * 5 + 8;
    doc.setFont('courier', 'bold');
    doc.setFontSize(11);
    doc.text('2. TELEMETRIA CONSOLIDADA', 14, currentY);

    doc.setFont('courier', 'normal');
    doc.setFontSize(9);
    doc.text(`• Total de Incidentes Catalogados: ${rep.incidentsCount}`, 14, currentY + 8);
    doc.text(`• Ameaças de Prioridade Crítica: ${rep.criticalCount}`, 14, currentY + 14);
    doc.text(`• Incidentes Mitigados / Resolvidos: ${rep.mitigatedCount}`, 14, currentY + 20);
    doc.text(`• Nós de Inteligência Correlacionados: ${nodes.length}`, 14, currentY + 26);

    // Incident Table Summary
    const tableY = currentY + 36;
    doc.setFont('courier', 'bold');
    doc.setFontSize(11);
    doc.text('3. PRINCIPAIS INCIDENTES REGISTRADOS', 14, tableY);

    doc.setFont('courier', 'normal');
    doc.setFontSize(8);
    let rowY = tableY + 8;
    alerts.slice(0, 5).forEach((alt, idx) => {
      doc.text(`[${alt.priority}] ${alt.title} — ${alt.location} (${alt.status})`, 14, rowY);
      rowY += 6;
    });

    // Cryptographic authenticity footer
    doc.setDrawColor(200, 200, 200);
    doc.line(14, 275, 196, 275);
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    doc.text(`Documento emitido digitalmente pela plataforma SYCRON. Assinatura SHA-256: ${rep.hash}`, 14, 282);
    doc.text('Connect intelligence. Detect what matters. © SYCRON Cybersecurity.', 14, 287);

    // Trigger download
    doc.save(`sycron-report-${rep.id}.pdf`);
  };

  // Export as JSON
  const handleExportJSON = (rep: IntelligenceReport) => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(rep, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `sycron-report-${rep.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div id="reports-center-view" className="p-4 max-w-7xl mx-auto space-y-4 font-mono text-xs">
      {/* Header */}
      <div className="p-4 rounded-lg bg-neutral-950 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-white" />
            <h1 className="text-sm font-bold text-white uppercase tracking-wider">
              Central de Relatórios & Exportação
            </h1>
            <span className="px-1.5 py-0.2 rounded bg-neutral-900 border border-neutral-700 text-[9px] text-neutral-300">
              {reports.length} Arquivados
            </span>
          </div>
          <p className="text-[11px] text-neutral-400">
            Geração de dossiês analíticos, relatórios forenses e sumários executivos com assinatura SHA-256.
          </p>
        </div>
      </div>

      {/* Generation Form + History List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Generate Report Card (5 cols) */}
        <div className="lg:col-span-5 p-4 rounded-lg bg-neutral-950 border border-neutral-800 space-y-3.5">
          <div className="flex items-center gap-2 border-b border-neutral-800 pb-2.5">
            <Plus size={15} className="text-white" />
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">
              Gerar Novo Relatório
            </h2>
          </div>

          <form onSubmit={handleGenerate} className="space-y-3">
            <div className="space-y-1">
              <label className="text-[10px] text-neutral-400 uppercase tracking-wider block">
                Título do Dossiê
              </label>
              <input
                type="text"
                required
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
                className="w-full bg-black border border-neutral-800 rounded p-2 text-xs text-white placeholder-neutral-400 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="text-[10px] text-neutral-400 uppercase tracking-wider block">
                  Período
                </label>
                <select
                  value={reportPeriod}
                  onChange={(e) => setReportPeriod(e.target.value)}
                  className="w-full bg-black border border-neutral-800 rounded p-2 text-xs text-white focus:outline-none"
                >
                  <option value="Últimas 24 Horas">Últimas 24 Horas</option>
                  <option value="Últimos 7 Dias">Últimos 7 Dias</option>
                  <option value="Últimos 30 Dias">Últimos 30 Dias</option>
                  <option value="Mês Vigente">Mês Vigente</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-neutral-400 uppercase tracking-wider block">
                  Tipo de Relatório
                </label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full bg-black border border-neutral-800 rounded p-2 text-xs text-white focus:outline-none"
                >
                  <option value="Consolidado Executivo">Consolidado Executivo</option>
                  <option value="Análise Forense de Incidentes">Análise Forense</option>
                  <option value="Vulnerabilidades e Correlações">Vulnerabilidades</option>
                  <option value="Auditoria de Rede e Acessos">Auditoria de Rede</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-neutral-400 uppercase tracking-wider block">
                Região / Setor Analisado
              </label>
              <select
                value={reportRegion}
                onChange={(e) => setReportRegion(e.target.value)}
                className="w-full bg-black border border-neutral-800 rounded p-2 text-xs text-white focus:outline-none"
              >
                <option value="Todos os Setores Metropolitanos">Todos os Setores Metropolitanos</option>
                <option value="Setor Central — SP">Setor Central — SP</option>
                <option value="Polo Financeiro Berrini">Polo Financeiro Berrini</option>
                <option value="Eixo Corporativo Paulista">Eixo Corporativo Paulista</option>
                <option value="Hub Tecnológico Faria Lima">Hub Tecnológico Faria Lima</option>
              </select>
            </div>

            <div className="p-2.5 rounded bg-neutral-900/60 border border-neutral-800 text-[10px] text-neutral-400 space-y-1">
              <div className="flex items-center gap-1.5 text-neutral-300 font-semibold">
                <Shield size={12} />
                <span>Autenticidade Criptográfica</span>
              </div>
              <p>
                Todos os relatórios gerados são carimbados com hash SHA-256 e registrados no livro de auditoria da SYCRON.
              </p>
            </div>

            <button
              type="submit"
              disabled={isGenerating}
              className="w-full py-2 bg-white text-black font-bold rounded hover:bg-neutral-200 text-xs transition-colors flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <span>Compilando Dados...</span>
              ) : (
                <>
                  <FileText size={14} />
                  <span>Compilar & Gerar Relatório</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Reports Archive & PDF Inspector (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg flex items-center justify-between">
            <span className="font-bold text-white uppercase tracking-wider text-xs">
              Histórico de Dossiês Gerados ({reports.length})
            </span>
            <span className="text-[10px] text-neutral-400">PDF / JSON Format</span>
          </div>

          <div className="space-y-2.5">
            {reports.map((rep) => {
              const isSelected = selectedReport?.id === rep.id;

              return (
                <div
                  key={rep.id}
                  onClick={() => setSelectedReportId(rep.id)}
                  className={`p-4 rounded-lg border transition-all cursor-pointer space-y-2.5 ${
                    isSelected
                      ? 'bg-neutral-900 border-neutral-500 text-white'
                      : 'bg-neutral-950 hover:bg-neutral-900/60 border-neutral-800 text-neutral-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 text-[10px] text-neutral-400">
                        <span className="px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-300 font-semibold">
                          {rep.type}
                        </span>
                        <span>•</span>
                        <span>{rep.period}</span>
                        <span>•</span>
                        <span>{rep.region}</span>
                      </div>
                      <h3 className="text-xs font-bold text-white">{rep.title}</h3>
                    </div>

                    <span className="text-[10px] text-neutral-400 shrink-0">
                      {rep.generatedAt}
                    </span>
                  </div>

                  <p className="text-[11px] text-neutral-400 line-clamp-2 leading-relaxed">
                    {rep.summary}
                  </p>

                  <div className="pt-2 border-t border-neutral-900 flex flex-wrap items-center justify-between gap-2 text-[10px] text-neutral-400">
                    <div className="flex items-center gap-2">
                      <span>Ameaças: <strong className="text-white">{rep.incidentsCount}</strong></span>
                      <span>•</span>
                      <span>Críticos: <strong className="text-white">{rep.criticalCount}</strong></span>
                      <span>•</span>
                      <span>Mitigados: <strong className="text-white">{rep.mitigatedCount}</strong></span>
                    </div>

                    {/* Export buttons */}
                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleExportPDF(rep)}
                        className="px-2.5 py-1 bg-white text-black font-bold rounded hover:bg-neutral-200 text-[10px] flex items-center gap-1 transition-colors"
                      >
                        <ArrowDownToLine size={11} />
                        <span>Baixar PDF</span>
                      </button>

                      <button
                        onClick={() => handleExportJSON(rep)}
                        className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-white rounded text-[10px] flex items-center gap-1 transition-colors"
                      >
                        <FileCode size={11} />
                        <span>JSON</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
