export type AssetStatus = 'operational' | 'needs_attention' | 'degraded' | 'offline';

export type ReadinessStatus = 'incomplete' | 'needs_attention' | 'almost_ready' | 'ready';

export type GapSeverity = 'low' | 'medium' | 'high';

export interface OperationalHistoryItem {
  id: string;
  timeLabel: string; // e.g. "Today", "Yesterday", "2 days ago"
  event: string; // e.g. "Status checked", "Belt replacement recorded", "Abnormal vibration reported"
  type?: 'status' | 'maintenance' | 'issue' | 'handover';
}

export interface RecentHandoverEvent {
  id: string;
  assetCode: string;
  assetName: string;
  title: string;
  timeLabel: string;
  handoverId: string;
}

export interface Asset {
  id: string;
  assetCode: string;
  name: string;
  type: string;
  location: string;
  status: AssetStatus;
  lastUpdated: string;
  description?: string;
  whatHappened?: string;
  activeHandoverId?: string;
  history?: OperationalHistoryItem[];
}

export interface OperationalState {
  issue: string | null;
  currentStatus: AssetStatus;
  completedActions: string[];
  pendingActions: string[];
  workaround: string | null;
  rootCause: string | null;
  operationalContext: string | null;
  risks: string[];
  unknowns: string[];
  nextAction: string | null;
  confidence: number;
}

export interface HandoverGap {
  detected: boolean;
  question: string | null;
  reason: string | null;
  severity: GapSeverity | null;
}

export interface ReadinessBreakdown {
  currentStatus: number;
  issue: number;
  completedActions: number;
  pendingActions: number;
  operationalContext: number;
  workaround: number;
  nextAction: number;
  unknowns: number;
}

export interface ReadinessDetail {
  score: number;
  status: ReadinessStatus;
  breakdown: ReadinessBreakdown;
}

export interface ChangeEvent {
  field: string;
  previousValue: string | null;
  currentValue: string | null;
  severity: 'low' | 'medium' | 'high';
  timestamp: string;
}

export interface Handover {
  id: string;
  assetId: string;
  assetCode: string;
  assetName: string;
  rawInput: string;
  operationalState: OperationalState;
  gap: HandoverGap;
  readiness: ReadinessDetail;
  createdAt: string;
  updatedAt: string;
  authorName?: string;
}

export interface AIAnalysisResult {
  assetCode: string;
  status: AssetStatus;
  issue: string | null;
  completed: string[];
  pending: string[];
  workaround: string | null;
  rootCause: string | null;
  operationalContext: string | null;
  readinessScore: number;
  readinessStatus: ReadinessStatus;
  gap: HandoverGap;
  unknowns: string[];
  nextAction: string | null;
}

export interface HealthStatus {
  status: string;
  service: string;
}
