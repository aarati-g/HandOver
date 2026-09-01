import type { AIAnalysisResult } from '@/types';

export const mockAiService = {
  /**
   * Simulates AI analysis of raw unstructured handover notes.
   * Deterministically extracts structured operational state and identifies missing gaps.
   */
  async analyzeHandover(assetCode: string, input: string): Promise<AIAnalysisResult> {
    // Artificial small deterministic delay (800ms) to allow the progressive pipeline steps to show cleanly
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (assetCode === 'GEN-12') {
      return {
        assetCode: 'GEN-12',
        status: 'operational',
        issue: null,
        completed: ['Weekly automated start test verified', 'Battery terminal voltage logged'],
        pending: [],
        workaround: null,
        rootCause: null,
        operationalContext: 'Normal standby mode',
        readinessScore: 98,
        readinessStatus: 'ready',
        gap: {
          detected: false,
          question: null,
          reason: null,
          severity: null,
        },
        unknowns: [],
        nextAction: 'Routine shift check on next cycle',
      };
    }

    if (assetCode === 'PUMP-07') {
      return {
        assetCode: 'PUMP-07',
        status: 'operational',
        issue: null,
        completed: ['Packing seal lubricated', 'Gland pressure verified at 4.2 bar'],
        pending: [],
        workaround: null,
        rootCause: null,
        operationalContext: 'Continuous water circulation loop',
        readinessScore: 95,
        readinessStatus: 'ready',
        gap: {
          detected: false,
          question: null,
          reason: null,
          severity: null,
        },
        unknowns: [],
        nextAction: 'Monitor packing gland temperature at 24h mark',
      };
    }

    // Default primary test scenario (COMP-03 and general machinery)
    return {
      assetCode: 'COMP-03',
      status: 'needs_attention',
      issue: 'Abnormal vibration',
      completed: ['Belt replaced'],
      pending: ['Motor inspection'],
      workaround: 'Operate below 70% load',
      rootCause: 'Unknown',
      operationalContext: input.length > 0 ? 'Plant floor operation during active shift' : null,
      readinessScore: 86,
      readinessStatus: 'almost_ready',
      gap: {
        detected: true,
        question: 'Was the compressor tested under normal operating load after the belt replacement?',
        reason: 'Belt replacement was completed, but post-repair load testing verification is missing.',
        severity: 'medium',
      },
      unknowns: ['Root cause unconfirmed'],
      nextAction: 'Inspect motor alignment and check bearing temperature under operating load',
    };
  },

  /**
   * Updates the operational state and readiness score based on the technician's targeted gap response.
   */
  answerGap(
    currentState: AIAnalysisResult,
    answer: 'yes' | 'no' | 'not_sure'
  ): AIAnalysisResult {
    const updated = { ...currentState };

    if (answer === 'yes') {
      updated.readinessScore = 94;
      updated.readinessStatus = 'ready';
      updated.completed = [
        ...currentState.completed,
        'Post-repair load test verified under standard load',
      ];
      updated.gap = {
        detected: false,
        question: null,
        reason: null,
        severity: null,
      };
    } else if (answer === 'no') {
      updated.readinessScore = 88;
      updated.readinessStatus = 'almost_ready';
      updated.pending = [
        ...currentState.pending,
        'Post-repair load test verification pending',
      ];
      updated.gap = {
        detected: false,
        question: null,
        reason: null,
        severity: null,
      };
    } else {
      // 'not_sure'
      updated.readinessScore = 86;
      updated.readinessStatus = 'almost_ready';
      updated.unknowns = [
        ...currentState.unknowns,
        'Post-repair load testing status unconfirmed',
      ];
      updated.gap = {
        detected: false,
        question: null,
        reason: null,
        severity: null,
      };
    }

    return updated;
  },
};
