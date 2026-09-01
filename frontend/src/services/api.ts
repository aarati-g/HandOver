import type {
  Asset,
  AIAnalysisResult,
  HandoverAnalyzePayload,
  HandoverAnswerPayload,
  OperationalEventSummary,
  StateComparisonResponse,
  Handover,
} from '@/types';
import { mockAssets, mockHandovers } from '@/data';

const RAW_API_URL = import.meta.env.VITE_API_URL !== undefined
  ? import.meta.env.VITE_API_URL
  : (import.meta.env.PROD ? '' : 'http://localhost:8000');

// Normalize base url: relative /api for single-service production, or full URL in dev/override
const API_BASE = RAW_API_URL
  ? (RAW_API_URL.endsWith('/api') ? RAW_API_URL : `${RAW_API_URL.replace(/\/$/, '')}/api`)
  : '/api';

/**
 * Robust fetch wrapper that calls FastAPI backend and falls back cleanly
 * to local mock state if backend is offline.
 */
export const api = {
  /**
   * GET /api/assets
   */
  async getAssets(): Promise<Asset[]> {
    try {
      const res = await fetch(`${API_BASE}/assets`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data.map((item: any) => ({
        id: item.asset_code,
        assetCode: item.asset_code,
        name: item.name,
        type: item.type,
        location: item.location || 'Facility Floor',
        status: item.status || 'operational',
        lastUpdated: item.asset_code === 'COMP-03' ? '2 days ago' : item.asset_code === 'GEN-12' ? '5 hours ago' : 'Yesterday',
        whatHappened: item.asset_code === 'COMP-03' ? 'Abnormal vibration was reported during operation.' : undefined,
        activeHandoverId: item.asset_code === 'COMP-03' ? 'HO-101' : undefined,
      }));
    } catch (err) {
      console.warn('Backend unavailable, using mock asset directory:', err);
      return mockAssets;
    }
  },

  /**
   * GET /api/assets/{asset_id}
   */
  async getAsset(assetId: string): Promise<Asset> {
    try {
      const res = await fetch(`${API_BASE}/assets/${assetId}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const item = await res.json();
      const matchedMock = mockAssets.find((a) => a.assetCode === item.asset_code);
      return {
        id: item.asset_code,
        assetCode: item.asset_code,
        name: item.name,
        type: item.type,
        location: item.location || matchedMock?.location || 'Plant Floor',
        status: item.status || matchedMock?.status || 'operational',
        lastUpdated: matchedMock?.lastUpdated || 'Recently',
        whatHappened: matchedMock?.whatHappened || 'Operational state recorded.',
        activeHandoverId: matchedMock?.activeHandoverId,
        history: matchedMock?.history,
      };
    } catch (err) {
      console.warn(`Backend fetch for asset ${assetId} failed, using mock data:`, err);
      const found = mockAssets.find((a) => a.assetCode.toLowerCase() === assetId.toLowerCase());
      if (found) return found;
      return mockAssets[0];
    }
  },

  /**
   * POST /api/handovers/analyze
   */
  async analyzeHandover(payload: HandoverAnalyzePayload): Promise<AIAnalysisResult> {
    try {
      const res = await fetch(`${API_BASE}/handovers/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const state = data.operational_state;
      return {
        assetCode: data.asset_id,
        status: state.current_status,
        issue: state.issue,
        completed: state.completed_actions || [],
        pending: state.pending_actions || [],
        workaround: state.workaround,
        rootCause: state.root_cause || 'Unknown',
        operationalContext: state.operational_context,
        readinessScore: data.readiness_score || 72,
        readinessStatus: data.readiness?.status || 'needs_attention',
        gap: {
          detected: data.gap?.detected ?? true,
          question: data.gap?.question || 'Was the machine tested under normal operating load after the belt replacement?',
          reason: data.gap?.reason || 'Operating-load test not confirmed',
          severity: data.gap?.severity || 'medium',
        },
        unknowns: state.unknowns || ['Root cause has not been confirmed'],
        nextAction: state.next_action || 'Inspect motor and verify vibration under normal operating load',
        handoverId: data.handover_id || 1,
      };
    } catch (err) {
      console.warn('Backend analyze unavailable, using deterministic AI mock response:', err);
      return {
        assetCode: payload.asset_id,
        status: 'needs_attention',
        issue: 'Abnormal vibration',
        completed: ['Belt replaced'],
        pending: ['Motor inspection'],
        workaround: 'Operate below 70% load',
        rootCause: 'Unknown',
        operationalContext: 'Reported operating below 70% load during shift',
        readinessScore: 72,
        readinessStatus: 'needs_attention',
        gap: {
          detected: true,
          question: 'Was the machine tested under normal operating load after the belt replacement?',
          reason: 'Operating-load test not confirmed',
          severity: 'medium',
        },
        unknowns: ['Root cause has not been confirmed'],
        nextAction: 'Inspect motor and verify vibration under normal operating load',
        handoverId: 1,
      };
    }
  },

  /**
   * POST /api/handovers/{handover_id}/answer
   */
  async answerHandover(
    handoverId: number | string,
    payload: HandoverAnswerPayload
  ): Promise<AIAnalysisResult> {
    try {
      const res = await fetch(`${API_BASE}/handovers/${handoverId}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const state = data.operational_state;
      return {
        assetCode: data.asset_id,
        status: state.current_status,
        issue: state.issue,
        completed: state.completed_actions || [],
        pending: state.pending_actions || [],
        workaround: state.workaround,
        rootCause: state.root_cause || 'Unknown',
        operationalContext: state.operational_context,
        readinessScore: data.readiness_score || 94,
        readinessStatus: data.readiness?.status || 'ready',
        gap: {
          detected: data.gap?.detected ?? false,
          question: data.gap?.question || null,
          reason: data.gap?.reason || null,
          severity: data.gap?.severity || null,
        },
        unknowns: state.unknowns || [],
        nextAction: state.next_action || 'Perform motor bearing & alignment inspection',
        handoverId: data.handover_id || handoverId,
      };
    } catch (err) {
      console.warn('Backend answer unavailable, using mock response:', err);
      return {
        assetCode: 'COMP-03',
        status: 'needs_attention',
        issue: 'Abnormal vibration',
        completed: ['Belt replaced', `Verification test: ${payload.answer}`],
        pending: ['Motor inspection'],
        workaround: 'Operate below 70% load',
        rootCause: 'Unknown',
        operationalContext: 'Reported operating below 70% load during shift | Verified under normal load: vibration remained elevated',
        readinessScore: 94,
        readinessStatus: 'ready',
        gap: {
          detected: false,
          question: null,
          reason: null,
          severity: null,
        },
        unknowns: ['Root cause has not been confirmed'],
        nextAction: 'Perform motor bearing & alignment inspection',
        handoverId,
      };
    }
  },

  /**
   * GET /api/handovers/{handover_id}
   */
  async getHandover(handoverId: number | string): Promise<Handover | null> {
    try {
      const res = await fetch(`${API_BASE}/handovers/${handoverId}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return {
        id: String(data.id),
        assetId: data.asset_id,
        assetCode: data.asset_id,
        assetName: data.asset_id === 'COMP-03' ? 'Compressor #03' : data.asset_id === 'GEN-12' ? 'Generator #12' : 'Pump #07',
        rawInput: data.raw_input,
        operationalState: data.operational_state,
        gap: data.gap,
        readiness: data.readiness,
        createdAt: data.created_at,
        updatedAt: data.created_at,
        authorName: 'Technician',
      };
    } catch (err) {
      console.warn(`Backend fetch for handover ${handoverId} failed, using mock data:`, err);
      return mockHandovers['HO-101'] || null;
    }
  },

  /**
   * GET /api/assets/{asset_id}/history
   */
  async getHistory(assetId: string): Promise<OperationalEventSummary[]> {
    try {
      const res = await fetch(`${API_BASE}/assets/${assetId}/history`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn(`Backend fetch for history of ${assetId} failed, using mock timeline:`, err);
      return [
        {
          type: 'HANDOVER_CREATED',
          timestamp: new Date(Date.now() - 2 * 86400000).toISOString(),
          summary: 'Abnormal vibration reported',
          handover_id: 1,
        },
        {
          type: 'GAP_DETECTED',
          timestamp: new Date(Date.now() - 2 * 86400000).toISOString(),
          summary: 'Operating-load test not confirmed',
          handover_id: 1,
        },
        {
          type: 'GAP_ANSWERED',
          timestamp: new Date(Date.now() - 1 * 86400000).toISOString(),
          summary: 'Tested under normal load; vibration remained elevated',
          handover_id: 1,
        },
        {
          type: 'READINESS_CHANGED',
          timestamp: new Date(Date.now() - 1 * 86400000).toISOString(),
          summary: 'Readiness evaluated at 94% (ready)',
          handover_id: 1,
        },
      ];
    }
  },

  /**
   * POST /api/handovers/compare
   */
  async compareStates(payload: { previous_state?: any; current_state: any }): Promise<StateComparisonResponse> {
    try {
      const res = await fetch(`${API_BASE}/handovers/compare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      return {
        has_changes: true,
        changes: [
          {
            field: 'current_status',
            previous: 'operational',
            current: 'needs_attention',
            severity: 'high',
          },
          {
            field: 'issue',
            previous: 'Normal operation',
            current: 'Abnormal vibration',
            severity: 'high',
          },
          {
            field: 'pending_actions',
            previous: 'None',
            current: 'Motor inspection',
            severity: 'medium',
          },
        ],
      };
    }
  },
};
