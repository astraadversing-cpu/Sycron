export type UserRole = 'User' | 'Contributor' | 'Analyst' | 'Moderator' | 'Administrator';

export type PriorityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'RESOLVED';

export type NodeCategory = 'REGION' | 'ALERT' | 'PARTICIPANTE' | 'PARTICIPANT' | 'NEWS' | 'INCIDENT' | 'INFORMATION';

export type SubscriptionPlanTier = 'FREE' | 'PRO' | 'ENTERPRISE';

export type AlertType = 
  | 'Atividade suspeita' 
  | 'Fraude' 
  | 'Furto' 
  | 'Roubo' 
  | 'Ameaça' 
  | 'Incidente digital' 
  | 'Vulnerabilidade' 
  | 'Pessoa desaparecida' 
  | 'Ocorrência' 
  | 'Outro';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  region: string;
  plan: SubscriptionPlanTier;
  joinedDate: string;
  nodesCount: number;
  confirmedReportsCount: number;
  twoFactorEnabled: boolean;
}

export interface NodeAttachment {
  id: string;
  name: string;
  size: string;
  type: string;
  url?: string;
}

export interface NodeComment {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  authorAvatar?: string;
  content: string;
  timestamp: string;
}

export interface NetworkNode {
  id: string;
  title: string;
  category: NodeCategory;
  location: string;
  coordinates?: { x: number; y: number; lat?: number; lng?: number };
  date: string;
  time: string;
  authorId: string;
  authorName: string;
  priority: PriorityLevel;
  description: string;
  confirmations: number;
  userConfirmed?: boolean;
  tags: string[];
  attachments: NodeAttachment[];
  comments: NodeComment[];
  x: number;
  y: number;
  isMainBlock?: boolean;
  linkedEntityId?: string;
}

export interface NetworkConnection {
  id: string;
  sourceId: string;
  targetId: string;
  label?: string;
  type: 'DIRECT' | 'CORRELATED' | 'GEOGRAPHIC' | 'INVESTIGATION';
}

export interface SecurityAlert {
  id: string;
  title: string;
  type: AlertType;
  location: string;
  coordinates: { x: number; y: number; lat: number; lng: number };
  date: string;
  time: string;
  description: string;
  priority: PriorityLevel;
  author: string;
  authorId: string;
  authorRole: UserRole;
  status: 'OPEN' | 'INVESTIGATING' | 'CONFIRMED' | 'RESOLVED' | 'DISPUTED';
  confirmations: number;
  userConfirmed?: boolean;
  reportedCount: number;
  linkedNodeId?: string;
  evidenceCount: number;
  isOfficial?: boolean;
}

export interface NewsItem {
  id: string;
  title: string;
  content: string;
  image?: string;
  location: string;
  category: string;
  author: string;
  authorId: string;
  authorRole: UserRole;
  date: string;
  time: string;
  confirmations: number;
  userConfirmed?: boolean;
  saved?: boolean;
  comments: Array<{
    id: string;
    author: string;
    role: UserRole;
    text: string;
    time: string;
  }>;
  linkedNodeId?: string;
}

export interface ChatMessage {
  id: string;
  channelId: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  authorAvatar?: string;
  content: string;
  timestamp: string;
  pinned?: boolean;
  attachment?: {
    name: string;
    type: string;
    size: string;
  };
  location?: string;
  linkedNodeId?: string;
}

export interface ChatChannel {
  id: string;
  name: string;
  type: 'DIRECT' | 'REGION' | 'INCIDENT' | 'NODE';
  description: string;
  participantsCount: number;
  unreadCount?: number;
  pinnedMessages?: string[];
  messages: ChatMessage[];
  linkedEntityId?: string;
}

export interface Participant {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'ONLINE' | 'BUSY' | 'OFFLINE';
  region: string;
  avatar?: string;
  bio: string;
  specialties: string[];
  reputationScore: number;
  contributionsCount: number;
  verifiedAlertsCount: number;
  joinedDate: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  details: string;
  timestamp: string;
  ip: string;
  hash: string;
  status: 'SUCCESS' | 'WARNING' | 'FAILURE';
}

export interface RegionZone {
  id: string;
  name: string;
  code: string;
  coordinates: { x: number; y: number; lat: number; lng: number };
  threatLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  activeAlertsCount: number;
  activeAnalysts: number;
  description: string;
  incidentsHistory: number[];
}

export interface IntelligenceReport {
  id: string;
  title: string;
  period: string;
  region: string;
  type: string;
  summary: string;
  generatedAt: string;
  generatedBy: string;
  generatedByRole: string;
  incidentsCount: number;
  criticalCount: number;
  mitigatedCount: number;
  fileSize: string;
  hash: string;
}

export interface InvoiceItem {
  id: string;
  date: string;
  amount: string;
  plan: string;
  status: string;
  method: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'ALERT' | 'NETWORK' | 'NEWS' | 'SUBSCRIPTION' | 'REPORT' | 'SECURITY';
  timestamp: string;
  read: boolean;
  linkTab?: string;
  targetId?: string;
  priority?: PriorityLevel;
}
