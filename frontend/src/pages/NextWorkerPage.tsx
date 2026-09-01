import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  Check,
  UserCheck,
  AlertTriangle,
} from 'lucide-react';
import { PageHeader, Card, CardHeader, CardTitle, CardContent, StatusBadge, Badge, Button } from '@/components';

export const NextWorkerPage: React.FC = () => {
  const navigate = useNavigate();
  const [isAcknowledged, setIsAcknowledged] = useState(false);

  return (
    <div className="space-y-4">
      <PageHeader
        title="What You Need To Know"
        subtitle="Operational briefing for oncoming technician"
        showBackButton
        badge={<StatusBadge status="needs_attention" size="sm" />}
      />

      {/* Hero Operational Brief Banner */}
      <div className="bg-slate-900 text-white rounded-xl p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <Badge variant="outline" size="sm" className="text-slate-300 border-slate-700 bg-slate-800/80">
            COMP-03 &bull; Compressor #03
          </Badge>
          <span className="text-[11px] font-mono text-amber-400 font-semibold flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" /> Shift Attention
          </span>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">
              CURRENT STATE
            </span>
            <span className="text-[10px] font-bold text-amber-400 uppercase">
              Needs Attention
            </span>
          </div>
          <h2 className="text-base font-bold text-white tracking-tight">Abnormal vibration</h2>
        </div>

        <div className="bg-slate-800/90 p-2.5 rounded-lg border border-slate-700 text-xs font-mono text-[11px] text-slate-300 flex items-center justify-between">
          <span>Workaround:</span>
          <strong className="text-amber-300">Operate below 70% load</strong>
        </div>
      </div>

      {/* Immediate Next Action Card */}
      <Card className="border-blue-300 bg-blue-50/40 shadow-2xs">
        <CardHeader className="pb-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900">
            <AlertCircle className="w-4 h-4 text-blue-600" />
            <span>NEXT ACTION FOR YOUR SHIFT</span>
          </div>
        </CardHeader>
        <CardContent className="pt-1">
          <p className="text-xs text-slate-800 font-semibold leading-relaxed">
            Motor inspection & check bearing alignment under operating load.
          </p>
        </CardContent>
      </Card>

      {/* Completed vs Unresolved Matrix */}
      <div className="grid grid-cols-1 gap-2.5">
        {/* Completed */}
        <Card>
          <CardHeader className="pb-1.5 bg-slate-50 border-b border-slate-100">
            <CardTitle className="text-xs uppercase tracking-wider text-slate-500 font-bold flex items-center justify-between">
              <span>COMPLETED WORK</span>
              <span className="text-emerald-700 font-bold">Verified</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 space-y-1.5 text-xs">
            <div className="flex items-start gap-2 text-slate-800 font-medium bg-slate-50 p-2 rounded border border-slate-100">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Belt replaced</span>
            </div>
            <div className="flex items-start gap-2 text-slate-800 font-medium bg-slate-50 p-2 rounded border border-slate-100">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Tested under normal load; vibration remained elevated</span>
            </div>
          </CardContent>
        </Card>

        {/* Still Unresolved & Important Unknowns */}
        <Card className="border-amber-200">
          <CardHeader className="pb-1.5 bg-amber-50/50 border-b border-amber-100">
            <CardTitle className="text-xs uppercase tracking-wider text-amber-900 font-bold flex items-center justify-between">
              <span>STILL UNRESOLVED</span>
              <span className="text-amber-800 font-bold">Pending Action</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 space-y-2 text-xs">
            <div className="flex items-start gap-2 text-amber-950 font-semibold bg-amber-50 p-2 rounded border border-amber-200/60">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>Motor inspection</span>
            </div>
            <div className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded border border-slate-200">
              <span className="font-bold text-slate-800 block uppercase text-[10px] tracking-wider">
                IMPORTANT UNKNOWN:
              </span>
              <span>Root cause has not been confirmed</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Acknowledgment Action */}
      <div className="pt-2 space-y-2">
        <Button
          variant={isAcknowledged ? 'outline' : 'primary'}
          fullWidth
          size="lg"
          leftIcon={isAcknowledged ? <Check className="w-4 h-4 text-emerald-600" /> : <UserCheck className="w-4 h-4" />}
          onClick={() => setIsAcknowledged(!isAcknowledged)}
          className="font-bold shadow-xs"
        >
          {isAcknowledged
            ? 'Operational Responsibility Acknowledged'
            : 'Acknowledge Operational Handover'}
        </Button>

        <Button
          variant="ghost"
          fullWidth
          size="sm"
          className="text-xs text-slate-500 hover:text-slate-900"
          onClick={() => navigate('/assets/COMP-03')}
        >
          Back to Compressor #03
        </Button>
      </div>
    </div>
  );
};
