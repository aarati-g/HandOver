import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  PlusCircle,
  HelpCircle,
  History as HistoryIcon,
} from 'lucide-react';
import {
  PageHeader,
  StatusBadge,
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Progress,
  Divider,
  EmptyState,
} from '@/components';
import { mockAssets, mockHandovers } from '@/data';

export const AssetDetailPage: React.FC = () => {
  const { assetId } = useParams<{ assetId: string }>();
  const navigate = useNavigate();

  const asset = mockAssets.find(
    (a) => a.assetCode.toLowerCase() === assetId?.toLowerCase() || a.id === assetId
  );

  if (!asset) {
    return (
      <EmptyState
        title="Asset Not Found"
        description={`No machine matching code '${assetId}' was found.`}
        actionLabel="Back to Assets"
        onAction={() => navigate('/assets')}
      />
    );
  }

  const activeHandover = asset.activeHandoverId ? mockHandovers[asset.activeHandoverId] : null;
  const opState = activeHandover?.operationalState;
  const readinessScore = activeHandover?.readiness.score ?? (asset.status === 'operational' ? 95 : 86);

  return (
    <div className="space-y-4">
      <PageHeader
        title={asset.name}
        subtitle={asset.type}
        showBackButton
        badge={<StatusBadge status={asset.status} size="sm" />}
      />

      {/* Prominent Current State Card */}
      <Card className="border-slate-300 shadow-xs">
        <CardHeader className="pb-2 bg-slate-50/80 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500">
              CURRENT STATE
            </span>
            <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Last updated: {asset.lastUpdated}
            </span>
          </div>
          <CardTitle className="text-base font-bold text-slate-900 pt-1">
            {opState?.issue || asset.whatHappened || 'Normal operational condition'}
          </CardTitle>
        </CardHeader>

        <CardContent className="p-4 space-y-3.5 text-xs">
          {/* What Happened */}
          <div>
            <span className="text-slate-400 font-bold block uppercase text-[10px] tracking-wider">
              WHAT HAPPENED
            </span>
            <p className="text-slate-800 font-medium mt-0.5 leading-relaxed">
              {asset.whatHappened || 'Routine shift operation recorded without anomalies.'}
            </p>
          </div>

          <Divider className="my-2" />

          {/* Completed vs Pending Matrix */}
          <div className="grid grid-cols-1 gap-2.5">
            {/* Completed */}
            <div>
              <span className="text-slate-400 font-bold block uppercase text-[10px] tracking-wider mb-1">
                COMPLETED
              </span>
              {opState && opState.completedActions.length > 0 ? (
                <ul className="space-y-1">
                  {opState.completedActions.map((act, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-slate-800 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{act}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-slate-500 italic text-[11px]">No recent maintenance actions.</p>
              )}
            </div>

            {/* Pending */}
            <div>
              <span className="text-slate-400 font-bold block uppercase text-[10px] tracking-wider mb-1">
                PENDING
              </span>
              {opState && opState.pendingActions.length > 0 ? (
                <ul className="space-y-1">
                  {opState.pendingActions.map((act, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-amber-900 font-medium bg-amber-50/80 p-1.5 rounded border border-amber-200/60">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <span>{act}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-slate-500 italic text-[11px]">No pending actions.</p>
              )}
            </div>
          </div>

          <Divider className="my-2" />

          {/* Workaround & Root Cause */}
          <div className="grid grid-cols-1 gap-2">
            <div>
              <span className="text-slate-400 font-bold block uppercase text-[10px] tracking-wider">
                CURRENT WORKAROUND
              </span>
              <p className="font-mono text-slate-900 font-semibold mt-0.5 bg-slate-100 p-2 rounded border border-slate-200">
                {opState?.workaround || 'Standard operating load / None'}
              </p>
            </div>

            <div className="pt-1">
              <span className="text-slate-400 font-bold block uppercase text-[10px] tracking-wider">
                ROOT CAUSE
              </span>
              <p className="text-slate-700 font-medium mt-0.5">
                {opState?.rootCause || 'Under investigation / Unknown'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Handover Readiness Preview Card */}
      <Card className="border-blue-200 bg-blue-50/20">
        <CardContent className="p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-bold text-slate-600">
              HANDOVER READINESS
            </span>
            <span className="text-base font-bold font-mono text-slate-900">
              {readinessScore} / 100
            </span>
          </div>

          <Progress value={readinessScore} size="md" />

          <p className="text-xs text-amber-800 font-medium flex items-center gap-1.5 pt-0.5">
            <HelpCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>One important detail may still be missing.</span>
          </p>

          <div className="pt-1">
            <Button
              variant="outline"
              size="sm"
              fullWidth
              className="bg-white border-blue-200 text-blue-700 hover:bg-blue-50 font-semibold"
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              onClick={() => navigate(`/handover/${activeHandover?.id || 'HO-101'}`)}
            >
              Review Handover
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Operational History (Vertical Timeline) */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <HistoryIcon className="w-3.5 h-3.5 text-slate-400" />
          OPERATIONAL HISTORY
        </h3>

        <Card>
          <CardContent className="p-4">
            <div className="relative border-l-2 border-slate-200 ml-2.5 space-y-4 py-1">
              {(asset.history || []).map((item, index) => (
                <div key={item.id || index} className="relative pl-5">
                  {/* Timeline dot */}
                  <div className="absolute -left-[7px] top-1 w-3 h-3 rounded-full bg-white border-2 border-slate-400" />
                  <div>
                    <span className="text-[11px] font-mono font-bold text-slate-400 block uppercase">
                      {item.timeLabel}
                    </span>
                    <p className="text-xs font-semibold text-slate-800 mt-0.5">{item.event}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Primary Action Button */}
      <div className="pt-2">
        <Button
          variant="primary"
          fullWidth
          size="lg"
          leftIcon={<PlusCircle className="w-4 h-4" />}
          onClick={() => navigate(`/handover/new?asset=${asset.assetCode}`)}
        >
          + Create Handover
        </Button>
      </div>
    </div>
  );
};
