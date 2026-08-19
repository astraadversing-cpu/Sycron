import React, { useState } from 'react';
import {
  CreditCard,
  Check,
  Shield,
  Zap,
  Building,
  FileText,
  Clock,
  ArrowRight,
  X,
  Lock,
} from 'lucide-react';
import { useSycron } from '../../context/SycronContext';
import { SubscriptionPlanTier } from '../../types';

export const SubscriptionPlans: React.FC = () => {
  const {
    currentPlan,
    upgradePlan,
    invoices,
    currentUser,
  } = useSycron();

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState<SubscriptionPlanTier>('PRO');
  const [cardNumber, setCardNumber] = useState('•••• •••• •••• 8842');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleOpenCheckout = (plan: SubscriptionPlanTier) => {
    setSelectedPlanForCheckout(plan);
    setIsCheckoutOpen(true);
  };

  const handleConfirmCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
      upgradePlan(selectedPlanForCheckout);
      setIsProcessing(false);
      setIsCheckoutOpen(false);
    }, 800);
  };

  const plans = [
    {
      tier: 'FREE' as SubscriptionPlanTier,
      name: 'Community / Operador Básico',
      price: 'R$ 0',
      period: 'Gratuito permanente',
      description: 'Acesso fundamental para acompanhamento de telemetria pública e visualização básica.',
      features: [
        'Acesso ao Mapa Geográfico de Risco',
        'Visualização de Alertas Públicos',
        'Participação em Canais Gerais',
        'Até 5 nós salvos na Teia',
        'Exportação básica de relatórios',
      ],
      current: currentPlan === 'FREE',
    },
    {
      tier: 'PRO' as SubscriptionPlanTier,
      name: 'Analyst / Profissional',
      price: 'R$ 189',
      period: 'por mês / usuário',
      description: 'Para analistas de segurança, peritos e equipes SOC que exigem inteligência profunda.',
      features: [
        'Nós e Correlações Ilimitados na Teia (Mind Map)',
        'Alertas de Zero-Day e Notificações Instantâneas',
        'Acesso a Canais Restritos de Investigação',
        'Geração ilimitada de Relatórios Forenses em PDF com SHA-256',
        'Filtros avançados de IOCs e vetores de rede',
        'Prioridade na validação colaborativa',
      ],
      current: currentPlan === 'PRO',
      recommended: true,
    },
    {
      tier: 'ENTERPRISE' as SubscriptionPlanTier,
      name: 'Enterprise / Centro de Inteligência',
      price: 'R$ 790',
      period: 'por mês / organização',
      description: 'Infraestrutura dedicada para corporações, governos e MSSPs com múltiplos operadores.',
      features: [
        'Tudo incluído no plano Analyst',
        'Assinatura para até 25 Analistas dedicados',
        'Acesso a API REST e Webhooks para SIEM/SOAR',
        'Logs de Auditoria Criptográfica Exportáveis',
        'Acordo de Nível de Serviço (SLA) de 99.9%',
        'Suporte operacional prioritário 24/7',
        'Cluster isolado com chaves HSM customizadas',
      ],
      current: currentPlan === 'ENTERPRISE',
    },
  ];

  return (
    <div id="subscription-plans-view" className="p-4 max-w-7xl mx-auto space-y-5 font-mono text-xs">
      {/* Top Header */}
      <div className="p-4 rounded-lg bg-neutral-950 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <CreditCard size={16} className="text-white" />
            <h1 className="text-sm font-bold text-white uppercase tracking-wider">
              Planos & Assinaturas / Gestão de Licenciamento
            </h1>
            <span className="px-2 py-0.5 rounded bg-white text-black font-bold text-[9px]">
              PLANO ATUAL: {currentPlan}
            </span>
          </div>
          <p className="text-[11px] text-neutral-400">
            Gerencie o nível de licenciamento da sua estação de trabalho e acesse recursos avançados de inteligência.
          </p>
        </div>
      </div>

      {/* Plan Cards Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((p) => (
          <div
            key={p.tier}
            className={`p-5 rounded-lg border flex flex-col justify-between space-y-4 relative ${
              p.current
                ? 'bg-neutral-900/90 border-white text-white shadow-xl'
                : p.recommended
                ? 'bg-neutral-950 border-neutral-700 text-neutral-200'
                : 'bg-neutral-950 border-neutral-800 text-neutral-300'
            }`}
          >
            {p.recommended && !p.current && (
              <span className="absolute -top-2.5 right-4 px-2 py-0.5 rounded bg-white text-black text-[9px] font-bold uppercase tracking-wider">
                Recomendado
              </span>
            )}
            {p.current && (
              <span className="absolute -top-2.5 right-4 px-2 py-0.5 rounded bg-white text-black text-[9px] font-bold uppercase tracking-wider">
                Plano Ativo
              </span>
            )}

            <div className="space-y-3">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white uppercase tracking-wide">{p.name}</h3>
                <p className="text-[11px] text-neutral-400 leading-relaxed">{p.description}</p>
              </div>

              <div className="py-2 border-y border-neutral-800 space-y-0.5">
                <div className="text-2xl font-bold text-white font-mono">{p.price}</div>
                <div className="text-[10px] text-neutral-400">{p.period}</div>
              </div>

              {/* Feature list */}
              <ul className="space-y-2 pt-1">
                {p.features.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-[11px]">
                    <Check size={13} className="text-white mt-0.5 shrink-0" />
                    <span className="text-neutral-300 leading-snug">{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Action button */}
            <div className="pt-3 border-t border-neutral-800">
              {p.current ? (
                <button
                  disabled
                  className="w-full py-2 bg-neutral-800 border border-neutral-700 text-white rounded text-xs font-bold cursor-default"
                >
                  Plano em Operação
                </button>
              ) : (
                <button
                  onClick={() => handleOpenCheckout(p.tier)}
                  className="w-full py-2 bg-white text-black hover:bg-neutral-200 rounded text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Migrar para {p.tier}</span>
                  <ArrowRight size={13} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Invoice & Payment History */}
      <div className="p-4 rounded-lg bg-neutral-950 border border-neutral-800 space-y-3">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5">
          <div className="flex items-center gap-2">
            <FileText size={15} className="text-white" />
            <h3 className="font-bold text-white uppercase tracking-wider text-xs">
              Histórico de Faturas & Recibos
            </h3>
          </div>
          <span className="text-[10px] text-neutral-400">Cartão Final 8842</span>
        </div>

        <div className="space-y-2">
          {invoices.map((inv) => (
            <div
              key={inv.id}
              className="p-3 rounded bg-neutral-900/40 border border-neutral-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-white">{inv.plan}</span>
                  <span className="text-[10px] text-neutral-400">ID: {inv.id}</span>
                </div>
                <div className="text-[10px] text-neutral-400">
                  Emitida em {inv.date} via {inv.method}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-white font-mono">{inv.amount}</span>
                <span className="px-2 py-0.5 rounded bg-neutral-800 text-neutral-200 text-[9px] font-bold">
                  {inv.status}
                </span>
                <button
                  onClick={() => alert(`Download da fatura ${inv.id} iniciado.`)}
                  className="p-1 rounded bg-neutral-800 text-neutral-300 hover:text-white"
                  title="Baixar comprovante"
                >
                  <FileText size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CHECKOUT MODAL */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-neutral-950 border border-neutral-800 rounded-lg p-5 space-y-4 shadow-2xl font-mono text-xs">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <Lock size={15} className="text-white" />
                <h3 className="font-bold text-white uppercase tracking-wider text-sm">
                  Checkout Seguro / SYCRON Pay
                </h3>
              </div>
              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleConfirmCheckout} className="space-y-3">
              <div className="p-3 rounded bg-neutral-900 border border-neutral-800 space-y-1">
                <div className="text-[10px] text-neutral-400 uppercase">Assinatura Selecionada</div>
                <div className="text-sm font-bold text-white">Plano SYCRON {selectedPlanForCheckout}</div>
                <div className="text-xs text-neutral-300">
                  {selectedPlanForCheckout === 'PRO' ? 'R$ 189,00 / mês' : selectedPlanForCheckout === 'ENTERPRISE' ? 'R$ 790,00 / mês' : 'R$ 0,00'}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-neutral-400 uppercase tracking-wider block">
                  Número do Cartão de Crédito Corporativo
                </label>
                <input
                  type="text"
                  required
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full bg-black border border-neutral-800 rounded p-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] text-neutral-400 uppercase tracking-wider block">
                    Validade
                  </label>
                  <input
                    type="text"
                    defaultValue="12/28"
                    className="w-full bg-black border border-neutral-800 rounded p-2 text-xs text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-neutral-400 uppercase tracking-wider block">
                    CVC / CVV
                  </label>
                  <input
                    type="password"
                    defaultValue="982"
                    className="w-full bg-black border border-neutral-800 rounded p-2 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-2 rounded bg-neutral-900/70 border border-neutral-800 text-[10px] text-neutral-400">
                🔒 Transação criptografada ponta-a-ponta via Gateway PCI-DSS Level 1.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsCheckoutOpen(false)}
                  className="px-3 py-1.5 bg-neutral-900 border border-neutral-800 text-neutral-300 rounded text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-4 py-1.5 bg-white text-black font-bold rounded text-xs flex items-center gap-1.5"
                >
                  {isProcessing ? 'Autorizando...' : 'Confirmar Assinatura'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
