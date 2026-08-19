import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User,
  UserRole,
  NetworkNode,
  NetworkConnection,
  SecurityAlert,
  NewsItem,
  ChatMessage,
  ChatChannel,
  Participant,
  AuditLog,
  RegionZone,
  IntelligenceReport,
  InvoiceItem,
  NotificationItem,
  SubscriptionPlanTier,
} from '../types';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

const EMPTY_USER: User = {
  id: '',
  name: '',
  email: '',
  role: 'User',
  region: '',
  plan: 'FREE',
  joinedDate: '',
  nodesCount: 0,
  confirmedReportsCount: 0,
  twoFactorEnabled: false,
};

export type ActiveTab =
  | 'dashboard'
  | 'map'
  | 'network'
  | 'alerts'
  | 'news'
  | 'chat'
  | 'participants'
  | 'reports'
  | 'subscription'
  | 'audit'
  | 'settings';

interface SycronContextType {
  // Auth
  isAuthenticated: boolean;
  currentUser: User;
  setCurrentUser: React.Dispatch<React.SetStateAction<User>>;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, phone: string, pass: string, terms: boolean) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  switchUserRole: (role: UserRole) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;

  // Subscription
  currentPlan: SubscriptionPlanTier;
  upgradePlan: (tier: SubscriptionPlanTier) => void;
  invoices: InvoiceItem[];

  // Navigation
  currentTab: ActiveTab;
  setCurrentTab: (tab: ActiveTab) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;

  // Data
  regions: RegionZone[];
  selectedRegionId: string | null;
  setSelectedRegionId: (id: string | null) => void;
  
  nodes: NetworkNode[];
  connections: NetworkConnection[];
  selectedNodeId: string | null;
  setSelectedNodeId: (id: string | null) => void;
  createNode: (node: Omit<NetworkNode, 'id' | 'date' | 'time' | 'authorId' | 'authorName' | 'confirmations' | 'attachments' | 'comments'>) => NetworkNode;
  updateNode: (id: string, data: Partial<NetworkNode>) => void;
  deleteNode: (id: string) => void;
  duplicateNode: (id: string) => void;
  confirmNode: (id: string) => void;
  addNodeComment: (nodeId: string, content: string) => void;
  addNodeAttachment: (nodeId: string, attachment: { name: string; size: string; type: string }) => void;
  
  createConnection: (sourceId: string, targetId: string, label?: string, type?: NetworkConnection['type']) => void;
  deleteConnection: (id: string) => void;

  alerts: SecurityAlert[];
  selectedAlertId: string | null;
  setSelectedAlertId: (id: string | null) => void;
  createAlert: (data: Omit<SecurityAlert, 'id' | 'date' | 'time' | 'author' | 'authorId' | 'authorRole' | 'confirmations' | 'reportedCount' | 'evidenceCount'>) => SecurityAlert;
  confirmAlert: (id: string) => void;
  resolveAlert: (id: string) => void;
  disputeAlert: (id: string, reason: string) => void;

  news: NewsItem[];
  selectedNewsId: string | null;
  setSelectedNewsId: (id: string | null) => void;
  createNews: (title: string, content: string, location: string, category: string, image?: string, linkedNodeId?: string) => void;
  confirmNews: (id: string) => void;
  toggleSaveNews: (id: string) => void;
  addNewsComment: (newsId: string, text: string) => void;

  chatChannels: ChatChannel[];
  activeChannelId: string;
  setActiveChannelId: (id: string) => void;
  chatMessages: Record<string, ChatMessage[]>;
  sendChatMessage: (channelId: string, content: string, options?: { attachment?: { name: string; type: string; size: string }; location?: string; linkedNodeId?: string }) => void;

  participants: Participant[];
  auditLogs: AuditLog[];
  reports: IntelligenceReport[];
  createReport: (type: string, period: string, region: string) => IntelligenceReport;

  notifications: NotificationItem[];
  unreadNotifsCount: number;
  markNotifAsRead: (id: string) => void;
  markAllNotifsAsRead: () => void;

  isGlobalSearchOpen: boolean;
  setIsGlobalSearchOpen: (open: boolean) => void;
  
  // Helpers
  addAuditLog: (action: string, details: string, status?: AuditLog['status']) => void;
  focusEntity: (type: 'node' | 'alert' | 'news' | 'region' | 'chat', id: string) => void;
}

const SycronContext = createContext<SycronContextType | undefined>(undefined);

type LocalAccount = { id: string; name: string; email: string; phone: string; passwordHash: string; createdAt: string };

const localAccountsKey = 'sycron.local.accounts';
const localSessionKey = 'sycron.local.session';
const normalizeEmail = (email: string) => email.trim().toLowerCase();

const hashPassword = async (password: string) => {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
};

const readLocalAccounts = (): LocalAccount[] => {
  try { return JSON.parse(localStorage.getItem(localAccountsKey) || '[]') as LocalAccount[]; }
  catch { return []; }
};

const asUser = (account: LocalAccount): User => ({
  id: account.id, name: account.name, email: account.email, phone: account.phone,
  role: 'Contributor', region: '', plan: 'FREE', joinedDate: new Date(account.createdAt).toLocaleDateString('pt-BR'),
  nodesCount: 0, confirmedReportsCount: 0, twoFactorEnabled: false,
});

export const SycronProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User>(EMPTY_USER);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Subscription state
  const [currentPlan, setCurrentPlan] = useState<SubscriptionPlanTier>(currentUser.plan);
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);

  // Navigation
  const [currentTab, setCurrentTab] = useState<ActiveTab>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);

  // Core Data
  const [regions, setRegions] = useState<RegionZone[]>([]);
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);

  const [nodes, setNodes] = useState<NetworkNode[]>([]);
  const [connections, setConnections] = useState<NetworkConnection[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);

  const [news, setNews] = useState<NewsItem[]>([]);
  const [selectedNewsId, setSelectedNewsId] = useState<string | null>(null);

  const [chatChannels, setChatChannels] = useState<ChatChannel[]>([]);
  const [activeChannelId, setActiveChannelId] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>({});

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [reports, setReports] = useState<IntelligenceReport[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState<boolean>(false);

  useEffect(() => {
    if (!supabase) {
      const sessionEmail = localStorage.getItem(localSessionKey);
      const account = readLocalAccounts().find((item) => item.email === sessionEmail);
      if (account) {
        setCurrentUser(asUser(account));
        setIsAuthenticated(true);
      }
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        const user = data.session.user;
        setCurrentUser((prev) => ({
          ...prev,
          id: user.id,
          email: user.email || '',
          name: user.user_metadata.full_name || user.user_metadata.name || user.email?.split('@')[0] || '',
          joinedDate: prev.joinedDate || new Date().toLocaleDateString('pt-BR'),
        }));
        setIsAuthenticated(true);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(Boolean(session));
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  // Generate pseudo SHA-256 hash for audit logs
  const generateHash = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    const hex = Math.abs(hash).toString(16).padStart(8, '0');
    return `${hex}e44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`.substring(0, 64);
  };

  const addAuditLog = (
    action: string,
    details: string,
    status: AuditLog['status'] = 'SUCCESS'
  ) => {
    const now = new Date();
    const dateStr = `${now.toLocaleDateString('pt-BR')} ${now.toLocaleTimeString('pt-BR')}`;
    const newLog: AuditLog = {
      id: `aud-${Date.now().toString(36)}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action,
      details,
      timestamp: dateStr,
      ip: '177.18.204.12',
      hash: generateHash(`${action}:${details}:${dateStr}`),
      status,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const upgradePlan = (tier: SubscriptionPlanTier) => {
    setCurrentPlan(tier);
    setCurrentUser((prev) => ({ ...prev, plan: tier }));
    const now = new Date();
    const newInv: InvoiceItem = {
      id: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      date: now.toLocaleDateString('pt-BR'),
      amount: tier === 'PRO' ? 'R$ 189,00' : tier === 'ENTERPRISE' ? 'R$ 790,00' : 'R$ 0,00',
      plan: `SYCRON ${tier}`,
      status: 'PAGO',
      method: 'Cartão Corporativo •••• 8842',
    };
    setInvoices((prev) => [newInv, ...prev]);
    addAuditLog('SUBSCRIPTION_UPGRADE', `Assinatura migrada para o plano ${tier}`, 'SUCCESS');
  };

  // Auth methods
  const login = async (email: string, pass: string) => {
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail || !pass) return { success: false, error: 'Informe e-mail e senha.' };
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password: pass });
        if (error || !data.session) return { success: false, error: 'E-mail ou senha inválidos.' };
        const user = data.session.user;
        setCurrentUser((prev) => ({ ...prev, id: user.id, email: user.email || normalizedEmail, name: user.user_metadata.full_name || user.email?.split('@')[0] || '', role: prev.role === 'User' ? 'Contributor' : prev.role, joinedDate: prev.joinedDate || new Date().toLocaleDateString('pt-BR') }));
      } else {
        const account = readLocalAccounts().find((item) => item.email === normalizedEmail);
        if (!account || account.passwordHash !== await hashPassword(pass)) return { success: false, error: 'E-mail ou senha inválidos.' };
        localStorage.setItem(localSessionKey, account.email);
        setCurrentUser(asUser(account));
      }
      setIsAuthenticated(true);
      addAuditLog('USER_LOGIN', `Sessão iniciada (${normalizedEmail})`, 'SUCCESS');
      return { success: true };
    } catch {
      return { success: false, error: 'Não foi possível autenticar.' };
    }
  };

  const loginWithGoogle = async () => {
    if (!supabase) {
      throw new Error('Configure o Supabase para ativar o login com Google.');
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    if (error) throw error;
  };

  const register = async (name: string, email: string, phone: string, pass: string, terms: boolean) => {
    const normalizedEmail = normalizeEmail(email);
    if (!name.trim() || !normalizedEmail || !pass || !terms) return { success: false, error: 'Preencha todos os campos obrigatórios.' };
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signUp({ email: normalizedEmail, password: pass, options: { data: { full_name: name.trim(), phone } } });
        if (error) return { success: false, error: 'Não foi possível criar a conta.' };
        if (!data.session) return { success: false, error: 'Confirme o e-mail enviado para ativar sua conta.' };
        setCurrentUser((prev) => ({ ...prev, id: data.session.user.id, name: name.trim(), email: normalizedEmail, phone, role: 'Contributor', joinedDate: new Date().toLocaleDateString('pt-BR') }));
      } else {
        const accounts = readLocalAccounts();
        if (accounts.some((item) => item.email === normalizedEmail)) return { success: false, error: 'Este e-mail já está cadastrado. Faça login.' };
        const account: LocalAccount = { id: `usr-${Date.now().toString(36)}`, name: name.trim(), email: normalizedEmail, phone, passwordHash: await hashPassword(pass), createdAt: new Date().toISOString() };
        localStorage.setItem(localAccountsKey, JSON.stringify([...accounts, account]));
        localStorage.setItem(localSessionKey, account.email);
        setCurrentUser(asUser(account));
      }
      setIsAuthenticated(true);
      addAuditLog('USER_REGISTER', `Conta criada com sucesso: ${normalizedEmail}`, 'SUCCESS');
      return { success: true };
    } catch {
      return { success: false, error: 'Não foi possível criar a conta.' };
    }
  };

  const logout = () => {
    addAuditLog('USER_LOGOUT', 'Sessão encerrada pelo usuário', 'SUCCESS');
    setIsAuthenticated(false);
    localStorage.removeItem(localSessionKey);
  };

  const switchUserRole = (role: UserRole) => {
    setCurrentUser((prev) => ({ ...prev, role }));
    addAuditLog('ROLE_SWITCH', `Permissão alterada em tempo de execução para: ${role}`, 'SUCCESS');
  };

  // Nodes Actions
  const createNode = (
    nodeData: Omit<NetworkNode, 'id' | 'date' | 'time' | 'authorId' | 'authorName' | 'confirmations' | 'attachments' | 'comments'>
  ): NetworkNode => {
    const now = new Date();
    const id = `node-${Date.now().toString(36)}`;
    const newNode: NetworkNode = {
      ...nodeData,
      id,
      date: now.toLocaleDateString('pt-BR'),
      time: now.toLocaleTimeString('pt-BR'),
      authorId: currentUser.id,
      authorName: currentUser.name,
      confirmations: 1,
      userConfirmed: true,
      attachments: [],
      comments: [],
    };

    setNodes((prev) => [...prev, newNode]);
    addAuditLog('CREATE_NODE', `${newNode.title} [${newNode.category}]`, 'SUCCESS');

    // If main node exists, create an automatic organic connection to the root node
    const rootNode = nodes.find((n) => n.isMainBlock) || nodes[0];
    if (rootNode && rootNode.id !== newNode.id) {
      const newConn: NetworkConnection = {
        id: `conn-${Date.now().toString(36)}`,
        sourceId: rootNode.id,
        targetId: newNode.id,
        label: 'Correlação Orgânica',
        type: 'DIRECT',
      };
      setConnections((prev) => [...prev, newConn]);
    }

    // Add a notification
    const newNotif: NotificationItem = {
      id: `notif-${Date.now().toString(36)}`,
      title: 'Novo Bloco de Inteligência Adicionado',
      message: `${newNode.title} foi incorporado à teia de dados colaborativa.`,
      type: 'NETWORK',
      timestamp: `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`,
      read: false,
      linkTab: 'network',
      targetId: newNode.id,
      priority: newNode.priority,
    };
    setNotifications((prev) => [newNotif, ...prev]);

    return newNode;
  };

  const updateNode = (id: string, data: Partial<NetworkNode>) => {
    setNodes((prev) => prev.map((n) => (n.id === id ? { ...n, ...data } : n)));
    addAuditLog('UPDATE_NODE', `Nó ${id} atualizado`, 'SUCCESS');
  };

  const deleteNode = (id: string) => {
    const target = nodes.find((n) => n.id === id);
    setNodes((prev) => prev.filter((n) => n.id !== id));
    setConnections((prev) => prev.filter((c) => c.sourceId !== id && c.targetId !== id));
    if (selectedNodeId === id) setSelectedNodeId(null);
    addAuditLog('DELETE_NODE', `Nó removido: ${target?.title || id}`, 'WARNING');
  };

  const duplicateNode = (id: string) => {
    const original = nodes.find((n) => n.id === id);
    if (!original) return;
    const now = new Date();
    const duplicated: NetworkNode = {
      ...original,
      id: `node-${Date.now().toString(36)}`,
      title: `${original.title} (Cópia)`,
      x: original.x + 40,
      y: original.y + 40,
      date: now.toLocaleDateString('pt-BR'),
      time: now.toLocaleTimeString('pt-BR'),
      authorId: currentUser.id,
      authorName: currentUser.name,
      isMainBlock: false,
    };
    setNodes((prev) => [...prev, duplicated]);
    addAuditLog('DUPLICATE_NODE', `Nó duplicado a partir de ${original.id}`, 'SUCCESS');
  };

  const confirmNode = (id: string) => {
    setNodes((prev) =>
      prev.map((n) => {
        if (n.id === id) {
          const hasConfirmed = n.userConfirmed;
          return {
            ...n,
            confirmations: hasConfirmed ? n.confirmations - 1 : n.confirmations + 1,
            userConfirmed: !hasConfirmed,
          };
        }
        return n;
      })
    );
    addAuditLog('CONFIRM_NODE', `Confirmação de dados no nó ${id}`, 'SUCCESS');
  };

  const addNodeComment = (nodeId: string, content: string) => {
    if (!content.trim()) return;
    const now = new Date();
    const newComment = {
      id: `c-${Date.now().toString(36)}`,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorRole: currentUser.role,
      content,
      timestamp: `${now.toLocaleDateString('pt-BR')} ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
    };
    setNodes((prev) =>
      prev.map((n) => (n.id === nodeId ? { ...n, comments: [...n.comments, newComment] } : n))
    );
    addAuditLog('COMMENT_NODE', `Comentário adicionado ao nó ${nodeId}`, 'SUCCESS');
  };

  const addNodeAttachment = (nodeId: string, attachment: { name: string; size: string; type: string }) => {
    const newAtt = {
      id: `att-${Date.now().toString(36)}`,
      ...attachment,
    };
    setNodes((prev) =>
      prev.map((n) => (n.id === nodeId ? { ...n, attachments: [...n.attachments, newAtt] } : n))
    );
    addAuditLog('ATTACHMENT_NODE', `Evidência anexada ao nó ${nodeId}: ${attachment.name}`, 'SUCCESS');
  };

  // Connection Actions
  const createConnection = (
    sourceId: string,
    targetId: string,
    label: string = 'Conexão Analítica',
    type: NetworkConnection['type'] = 'DIRECT'
  ) => {
    if (sourceId === targetId) return;
    const exists = connections.some(
      (c) =>
        (c.sourceId === sourceId && c.targetId === targetId) ||
        (c.sourceId === targetId && c.targetId === sourceId)
    );
    if (exists) return;

    const newConn: NetworkConnection = {
      id: `conn-${Date.now().toString(36)}`,
      sourceId,
      targetId,
      label,
      type,
    };
    setConnections((prev) => [...prev, newConn]);
    addAuditLog('CONNECT_NODES', `Link estabelecido: ${sourceId} <-> ${targetId}`, 'SUCCESS');
  };

  const deleteConnection = (id: string) => {
    setConnections((prev) => prev.filter((c) => c.id !== id));
    addAuditLog('DELETE_CONNECTION', `Conexão removida: ${id}`, 'WARNING');
  };

  // Alert Actions
  const createAlert = (
    alertData: Omit<SecurityAlert, 'id' | 'date' | 'time' | 'author' | 'authorId' | 'authorRole' | 'confirmations' | 'reportedCount' | 'evidenceCount'>
  ): SecurityAlert => {
    const now = new Date();
    const id = `alt-${Date.now().toString(36)}`;
    const newAlert: SecurityAlert = {
      ...alertData,
      id,
      date: now.toLocaleDateString('pt-BR'),
      time: now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      author: currentUser.name,
      authorId: currentUser.id,
      authorRole: currentUser.role,
      confirmations: 1,
      userConfirmed: true,
      reportedCount: 0,
      evidenceCount: 1,
      isOfficial: currentUser.role === 'Analyst' || currentUser.role === 'Administrator',
    };

    setAlerts((prev) => [newAlert, ...prev]);
    addAuditLog('CREATE_ALERT', `${newAlert.title} (${newAlert.type})`, 'SUCCESS');

    // Also auto-create a node on the Network Mind Map so everything is connected!
    const createdNode = createNode({
      title: `ALERTA: ${newAlert.title}`,
      category: 'ALERT',
      location: newAlert.location,
      coordinates: newAlert.coordinates,
      priority: newAlert.priority,
      description: newAlert.description,
      tags: [newAlert.type.toUpperCase().replace(/\s+/g, '-'), 'ALERTA-NOVO'],
      x: 300 + (Math.random() * 200 - 100),
      y: 250 + (Math.random() * 200 - 100),
      linkedEntityId: newAlert.id,
    });

    // Link them together
    newAlert.linkedNodeId = createdNode.id;

    // Trigger Notification
    const newNotif: NotificationItem = {
      id: `notif-${Date.now().toString(36)}`,
      title: 'Novo Alerta de Segurança Registrado',
      message: `${newAlert.title} em ${newAlert.location}`,
      type: 'ALERT',
      timestamp: newAlert.time,
      read: false,
      linkTab: 'alerts',
      targetId: newAlert.id,
      priority: newAlert.priority,
    };
    setNotifications((prev) => [newNotif, ...prev]);

    return newAlert;
  };

  const confirmAlert = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          const hasConfirmed = a.userConfirmed;
          return {
            ...a,
            confirmations: hasConfirmed ? a.confirmations - 1 : a.confirmations + 1,
            userConfirmed: !hasConfirmed,
          };
        }
        return a;
      })
    );
    addAuditLog('CONFIRM_ALERT', `Validação colaborativa do alerta ${id}`, 'SUCCESS');
  };

  const resolveAlert = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'RESOLVED', priority: 'RESOLVED' } : a))
    );
    addAuditLog('RESOLVE_ALERT', `Alerta ${id} marcado como resolvido`, 'SUCCESS');
  };

  const disputeAlert = (id: string, reason: string) => {
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              status: 'DISPUTED',
              reportedCount: a.reportedCount + 1,
            }
          : a
      )
    );
    addAuditLog('DISPUTE_ALERT', `Disputa registrada para alerta ${id}: ${reason}`, 'WARNING');
  };

  // News Actions
  const createNews = (
    title: string,
    content: string,
    location: string,
    category: string,
    image?: string,
    linkedNodeId?: string
  ) => {
    const now = new Date();
    const newPost: NewsItem = {
      id: `news-${Date.now().toString(36)}`,
      title,
      content,
      image,
      location,
      category,
      author: currentUser.name,
      authorId: currentUser.id,
      authorRole: currentUser.role,
      date: now.toLocaleDateString('pt-BR'),
      time: now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      confirmations: 1,
      userConfirmed: true,
      saved: false,
      comments: [],
      linkedNodeId,
    };
    setNews((prev) => [newPost, ...prev]);
    addAuditLog('CREATE_NEWS', `Publicação: ${title}`, 'SUCCESS');

    // Add Notification
    const newNotif: NotificationItem = {
      id: `notif-${Date.now().toString(36)}`,
      title: 'Nova Notícia Publicada',
      message: `${title} por ${currentUser.name}`,
      type: 'NEWS',
      timestamp: newPost.time,
      read: false,
      linkTab: 'news',
      targetId: newPost.id,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const confirmNews = (id: string) => {
    setNews((prev) =>
      prev.map((n) => {
        if (n.id === id) {
          const has = n.userConfirmed;
          return {
            ...n,
            confirmations: has ? n.confirmations - 1 : n.confirmations + 1,
            userConfirmed: !has,
          };
        }
        return n;
      })
    );
  };

  const toggleSaveNews = (id: string) => {
    setNews((prev) => prev.map((n) => (n.id === id ? { ...n, saved: !n.saved } : n)));
  };

  const addNewsComment = (newsId: string, text: string) => {
    if (!text.trim()) return;
    const now = new Date();
    const comment = {
      id: `nc-${Date.now().toString(36)}`,
      author: currentUser.name,
      role: currentUser.role,
      text,
      time: `${now.toLocaleDateString('pt-BR')} ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
    };
    setNews((prev) =>
      prev.map((n) => (n.id === newsId ? { ...n, comments: [...n.comments, comment] } : n))
    );
  };

  // Chat Actions
  const sendChatMessage = (
    channelId: string,
    content: string,
    options?: { attachment?: { name: string; type: string; size: string }; location?: string; linkedNodeId?: string }
  ) => {
    if (!content.trim() && !options?.attachment) return;
    const now = new Date();
    const newMsg: ChatMessage = {
      id: `msg-${Date.now().toString(36)}`,
      channelId,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorRole: currentUser.role,
      content,
      timestamp: now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      attachment: options?.attachment,
      location: options?.location,
      linkedNodeId: options?.linkedNodeId,
    };

    setChatMessages((prev) => ({
      ...prev,
      [channelId]: [...(prev[channelId] || []), newMsg],
    }));

    setChatChannels((prev) =>
      prev.map((c) =>
        c.id === channelId
          ? {
              ...c,
              messages: [...c.messages, newMsg],
            }
          : c
      )
    );
  };

  // Reports Actions
  const createReport = (type: string, period: string, region: string): IntelligenceReport => {
    const now = new Date();
    const titlesMap: Record<string, string> = {
      INCIDENT_SUMMARY: `Relatório Executivo de Incidentes — ${period}`,
      NETWORK_ACTIVITY: `Dinâmica da Teia de Inteligência — ${period}`,
      THREAT_EVOLUTION: `Evolução de Vetores de Ameaça — ${period}`,
      ANALYST_PERFORMANCE: `Desempenho da Rede Colaborativa — ${period}`,
    };

    const newReport: IntelligenceReport = {
      id: `rep-${Date.now().toString(36)}`,
      title: titlesMap[type] || `Relatório de Inteligência — ${period}`,
      type,
      generatedAt: `${now.toLocaleDateString('pt-BR')} ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
      generatedBy: currentUser.name,
      generatedByRole: currentUser.role,
      period,
      region,
      summary: `Relatório analítico consolidado gerado automaticamente contendo métricas de incidentes, telemetria de rede e correlações de inteligência para ${region}.`,
      incidentsCount: alerts.length,
      criticalCount: alerts.filter((a) => a.priority === 'CRITICAL').length,
      mitigatedCount: alerts.filter((a) => a.status === 'RESOLVED').length,
      fileSize: '5.4 MB',
      hash: generateHash(`REPORT:${type}:${period}:${region}`),
    };

    setReports((prev) => [newReport, ...prev]);
    addAuditLog('GENERATE_REPORT', `Relatório gerado: ${newReport.title}`, 'SUCCESS');

    // Notification
    const newNotif: NotificationItem = {
      id: `notif-${Date.now().toString(36)}`,
      title: 'Novo Relatório Disponível',
      message: `${newReport.title} pronto para visualização e download em PDF.`,
      type: 'REPORT',
      timestamp: now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      read: false,
      linkTab: 'reports',
      targetId: newReport.id,
    };
    setNotifications((prev) => [newNotif, ...prev]);

    return newReport;
  };

  // Notification Actions
  const markNotifAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotifsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unreadNotifsCount = notifications.filter((n) => !n.read).length;

  // Jump to specific entity
  const focusEntity = (type: 'node' | 'alert' | 'news' | 'region' | 'chat', id: string) => {
    if (type === 'node') {
      setSelectedNodeId(id);
      setCurrentTab('network');
    } else if (type === 'alert') {
      setSelectedAlertId(id);
      setCurrentTab('alerts');
    } else if (type === 'news') {
      setSelectedNewsId(id);
      setCurrentTab('news');
    } else if (type === 'region') {
      setSelectedRegionId(id);
      setCurrentTab('map');
    } else if (type === 'chat') {
      setActiveChannelId(id);
      setCurrentTab('chat');
    }
  };

  return (
    <SycronContext.Provider
      value={{
        isAuthenticated,
        currentUser,
        setCurrentUser,
        login,
        register,
        loginWithGoogle,
        logout,
        switchUserRole,
        isAuthModalOpen,
        setIsAuthModalOpen,

        currentPlan,
        upgradePlan,
        invoices,

        currentTab,
        setCurrentTab,
        sidebarOpen,
        setSidebarOpen,

        regions,
        selectedRegionId,
        setSelectedRegionId,

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

        alerts,
        selectedAlertId,
        setSelectedAlertId,
        createAlert,
        confirmAlert,
        resolveAlert,
        disputeAlert,

        news,
        selectedNewsId,
        setSelectedNewsId,
        createNews,
        confirmNews,
        toggleSaveNews,
        addNewsComment,

        chatChannels,
        activeChannelId,
        setActiveChannelId,
        chatMessages,
        sendChatMessage,

        participants,
        auditLogs,
        reports,
        createReport,

        notifications,
        unreadNotifsCount,
        markNotifAsRead,
        markAllNotifsAsRead,

        isGlobalSearchOpen,
        setIsGlobalSearchOpen,

        addAuditLog,
        focusEntity,
      }}
    >
      {children}
    </SycronContext.Provider>
  );
};

export const useSycron = (): SycronContextType => {
  const context = useContext(SycronContext);
  if (!context) {
    throw new Error('useSycron must be used within a SycronProvider');
  }
  return context;
};
