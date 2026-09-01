import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HelpCircle, CheckCircle2, AlertTriangle, ArrowRight, UserCheck } from 'lucide-react';
import {
  PageHeader,
  Card,
  CardHeader,
  CardContent,
  StatusBadge,
  Badge,
  Progress,
  Button,
  TextArea,
  Divider,
} from '@/components';
import { mockHandovers } from '@/data';

export const HandoverDetailPage: React.FC = () => {
  const { handoverId } = useParams<{ handoverId: string }>();
  const navigate = useNavigate();

  const handover = mockHandovers[handoverId || 'HO-101'] || mockHandovers['HO-101'];
  const [answerText, setAnswerText] = useState('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const state = handover.operationalState;
  const isCompressor = handover.assetCode === 'COMP-03';
  const currentReadiness = isAnswered ? 94 : (isCompressor ? 72 : handover.readiness.score);
  const currentStatus = isAnswered ? 'ready' : (isCompressor ? 'needs_attention' : handover.readiness.status);

  const handleAnswerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!answerText.trim()) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsAnswered(true);
    }, 400);
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title={`${handover.assetCode} Handover`}
        subtitle={`${handover.assetName} • Recorded by ${handover.authorName || 'Technician'}`}
        showBackButton
        badge={<StatusBadge status={currentStatus} size="sm" />}
      />

      {/* Readiness Score & Evaluation Card */}
      <Card className="border-slate-300 shadow-2xs">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-slate-600 block">
                Handover Readiness
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl font-bold text-slate-900 font-mono">
                  {currentReadiness} / 100
                </span>
                <span
                  className={`text-xs font-bold ${
                    currentReadiness >= 90 ? 'text-emerald-700' : 'text-amber-800'
                  }`}
                >
                  {currentReadiness >= 90 ? 'READY' : 'NEEDS ATTENTION'}
                </span>
              </div>
            </div>
            <StatusBadge status={currentStatus} size="md" />
          </div>

          <Progress value={currentReadiness} size="md" />

          <p className="text-[11px] text-slate-500 font-medium">
            Based on the information available for the next worker.
          </p>

          {/* Breakdown Pills */}
          <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px] text-slate-500">
            <div className="flex justify-between bg-slate-50 p-1.5 rounded border border-slate-100">
              <span>Status Defined:</span>
              <span className="font-semibold text-slate-800">20/20</span>
            </div>
            <div className="flex justify-between bg-slate-50 p-1.5 rounded border border-slate-100">
              <span>Issue Clear:</span>
              <span className="font-semibold text-slate-800">15/15</span>
            </div>
            <div className="flex justify-between bg-slate-50 p-1.5 rounded border border-slate-100">
              <span>Actions Logged:</span>
              <span className="font-semibold text-slate-800">15/15</span>
            </div>
            <div className="flex justify-between bg-slate-50 p-1.5 rounded border border-slate-100">
              <span>Testing/Unknowns:</span>
              <span className="font-semibold text-slate-800">{isAnswered ? '10/10' : '4/10'}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Targeted Gap Question Resolution Card */}
      {!isAnswered && handover.gap.detected && (
        <Card className="border-amber-300 bg-amber-50/80 shadow-xs">
          <CardHeader className="pb-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-950">
                <HelpCircle className="w-4 h-4 text-amber-600" />
                <span>AI FOUND A KNOWLEDGE GAP</span>
              </div>
              <Badge variant="warning" size="sm" className="font-mono text-[10px]">
                MEDIUM SEVERITY
              </Badge>
            </div>
            <p className="text-xs font-bold text-slate-900 pt-1 leading-snug">
              "{handover.gap.question}"
            </p>
            <p className="text-[11px] text-slate-600 pt-0.5">
              An important validation step was not confirmed in the handover.
            </p>
          </CardHeader>
          <CardContent className="pt-2">
            <form onSubmit={handleAnswerSubmit} className="space-y-2.5">
              <TextArea
                rows={2}
                placeholder="E.g. Yes, it was tested under normal load and vibration remained elevated."
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                className="bg-white text-xs font-medium"
              />
              <Button
                type="submit"
                variant="secondary"
                size="md"
                fullWidth
                isLoading={isSubmitting}
                className="font-bold bg-amber-600 hover:bg-amber-700 text-white border-amber-700"
              >
                {isSubmitting ? 'Updating handover memory...' : 'Update Handover'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {isAnswered && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-lg p-3 text-xs flex items-center gap-2.5 animate-fade-in shadow-2xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <span className="font-bold block text-emerald-950">Handover updated</span>
            <span className="text-emerald-800 text-[11px]">
              Critical context is now available for the next worker. Readiness increased to 94%.
            </span>
          </div>
        </div>
      )}

      {/* Structured Operational State */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Structured Operational State
        </h3>

        <Card>
          <CardContent className="p-4 space-y-3.5 text-xs">
            {/* Core Issue */}
            <div>
              <span className="text-slate-400 font-medium block uppercase text-[10px] tracking-wider">
                Primary Issue
              </span>
              <p className="font-semibold text-slate-900 text-sm mt-0.5">{state.issue}</p>
            </div>

            <Divider className="my-2" />

            {/* Completed Actions */}
            <div>
              <span className="text-slate-400 font-medium block uppercase text-[10px] tracking-wider mb-1">
                Completed Actions ({state.completedActions.length})
              </span>
              <ul className="space-y-1">
                {state.completedActions.map((act, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{act}</span>
                  </li>
                ))}
                {isAnswered && (
                  <li className="flex items-start gap-1.5 text-emerald-800 font-medium bg-emerald-50 p-1 rounded">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Verification: Tested under normal load ({answerText})</span>
                  </li>
                )}
              </ul>
            </div>

            {/* Pending Actions */}
            <div>
              <span className="text-slate-400 font-medium block uppercase text-[10px] tracking-wider mb-1">
                Pending Actions ({state.pendingActions.length})
              </span>
              <ul className="space-y-1">
                {state.pendingActions.map((act, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-slate-700">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <span>{act}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Workaround */}
            {state.workaround && (
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                <span className="text-slate-500 font-semibold block uppercase text-[10px] tracking-wider">
                  Active Workaround / Parameter Limit
                </span>
                <p className="font-mono text-slate-800 font-medium mt-0.5">{state.workaround}</p>
              </div>
            )}

            {/* Next Action */}
            {state.nextAction && (
              <div className="bg-blue-50/50 p-2.5 rounded-lg border border-blue-100">
                <span className="text-blue-700 font-semibold block uppercase text-[10px] tracking-wider">
                  Recommended Next Action
                </span>
                <p className="text-slate-800 mt-0.5">{state.nextAction}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Next Worker View CTA */}
      <div className="pt-2">
        <Button
          variant="primary"
          fullWidth
          leftIcon={<UserCheck className="w-4 h-4" />}
          rightIcon={<ArrowRight className="w-4 h-4" />}
          onClick={() => navigate(`/handover/${handover.id}/next-worker`)}
        >
          View Oncoming Technician Memory Card
        </Button>
      </div>
    </div>
  );
};
