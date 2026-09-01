export type AssetStatus = 'operational' | 'needs_attention' | 'degraded' | 'offline';

export type ReadinessStatus = 'incomplete' | 'needs_attention' | 'almost_ready' | 'ready';

export type GapSeverity = 'low' | 'medium' | 'high';

export interface Asset {
  id: string;
  assetCode: string;
  name: string;
  type: string;
  location: string;
  status: AssetStatus;
  lastUpdated: string;
  description?: string;
  activeHandoverId?: string;
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

export interface HealthStatus {
  status: string;
  service: string;
}
