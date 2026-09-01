import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShieldAlert, CheckCircle2, AlertCircle, Check } from 'lucide-react';
import { PageHeader, Card, CardHeader, CardTitle, CardContent, StatusBadge, Badge, Button } from '@/components';
import { mockHandovers } from '@/data';

export const NextWorkerPage: React.FC = () => {
  const { handoverId } = useParams<{ handoverId: string }>();
  const navigate = useNavigate();

  const handover = mockHandovers[handoverId || 'HO-101'] || mockHandovers['HO-101'];
  const state = handover.operationalState;
  const [isAcknowledged, setIsAcknowledged] = useState(false);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Operational Retrieval"
        subtitle={`Shift Handover for Incoming Technician • ${handover.assetCode}`}
        showBackButton
        badge={<StatusBadge status="ready" size="sm" />}
      />

      {/* Hero Operational Brief */}
      <div className="bg-slate-900 text-white rounded-xl p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <Badge variant="outline" size="sm" className="text-slate-300 border-slate-700 bg-slate-800/80">
            {handover.assetCode} &bull; {handover.assetName}
          </Badge>
          <span className="text-[11px] font-mono text-emerald-400 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Handover Ready
          </span>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">
            Current State
          </span>
          <h2 className="text-base font-bold text-white tracking-tight">{state.issue}</h2>
          <p className="text-xs text-slate-300 leading-relaxed font-mono text-[11px] bg-slate-800/80 p-2.5 rounded-lg border border-slate-700 mt-2">
            Workaround: {state.workaround || 'Standard operating limits'}
          </p>
        </div>
      </div>

      {/* Immediate Next Step Card */}
      <Card className="border-blue-300/80 bg-blue-50/30">
        <CardHeader className="pb-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900">
            <AlertCircle className="w-4 h-4 text-blue-600" />
            <span>Immediate Next Action for Your Shift</span>
          </div>
        </CardHeader>
        <CardContent className="pt-1">
          <p className="text-xs text-slate-800 font-medium leading-relaxed">
            {state.nextAction || 'Inspect motor alignment and check bearing temperature under load.'}
          </p>
        </CardContent>
      </Card>

      {/* Completed vs Pending Matrix */}
      <div className="grid grid-cols-1 gap-3">
        {/* Completed */}
        <Card>
          <CardHeader className="pb-1.5">
            <CardTitle className="text-xs uppercase tracking-wider text-slate-500 font-semibold flex items-center justify-between">
              <span>Verified Shift Work</span>
              <span className="text-emerald-600 font-bold">{state.completedActions.length} Completed</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-1.5 text-xs">
            {state.completedActions.map((act, i) => (
              <div key={i} className="flex items-start gap-2 text-slate-700 bg-slate-50 p-2 rounded border border-slate-100">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>{act}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Pending & Unknowns */}
        <Card>
          <CardHeader className="pb-1.5">
            <CardTitle className="text-xs uppercase tracking-wider text-slate-500 font-semibold flex items-center justify-between">
              <span>Pending & Unconfirmed Facts</span>
              <span className="text-amber-600 font-bold">{state.pendingActions.length} Pending</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-2 text-xs">
            {state.pendingActions.map((act, i) => (
              <div key={i} className="flex items-start gap-2 text-slate-700 bg-slate-50 p-2 rounded border border-slate-100">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                <span>{act}</span>
              </div>
            ))}
            {state.unknowns.map((unk, i) => (
              <div key={i} className="text-[11px] text-slate-500 bg-amber-50/50 p-2 rounded border border-amber-200/50">
                <span className="font-semibold text-amber-900 block">Explicit Unknown:</span>
                <span>{unk}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Acknowledgment Action */}
      <div className="pt-2 space-y-2">
        <Button
          variant={isAcknowledged ? 'outline' : 'primary'}
          fullWidth
          size="lg"
          leftIcon={isAcknowledged ? <Check className="w-4 h-4 text-emerald-600" /> : <CheckCircle2 className="w-4 h-4" />}
          onClick={() => setIsAcknowledged(!isAcknowledged)}
        >
          {isAcknowledged ? 'Operational Responsibility Acknowledged' : 'Acknowledge Operational Handover'}
        </Button>

        <Button
          variant="ghost"
          fullWidth
          size="sm"
          className="text-xs text-slate-500"
          onClick={() => navigate('/assets')}
        >
          Back to Asset Registry
        </Button>
      </div>
    </div>
  );
};
