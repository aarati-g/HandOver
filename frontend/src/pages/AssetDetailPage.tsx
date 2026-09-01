import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  PlusCircle,
  HelpCircle,
  History as HistoryIcon,
  ShieldAlert,
  ArrowUpRight,
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
  LoadingState,
  Badge,
} from '@/components';
import { api } from '@/services/api';
import type { Asset, OperationalEventSummary, StateChange } from '@/types';

export const AssetDetailPage: React.FC = () => {
  const { assetId } = useParams<{ assetId: string }>();
  const navigate = useNavigate();

  const [asset, setAsset] = useState<Asset | null>(null);
  const [historyEvents, setHistoryEvents] = useState<OperationalEventSummary[]>([]);
  const [stateChanges, setStateChanges] = useState<StateChange[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const targetCode = assetId || 'COMP-03';

    Promise.all([
      api.getAsset(targetCode),
      api.getHistory(targetCode),
      api.compareStates({
        previous_state: {
          issue: 'Normal standby operation',
          current_status: 'operational',
          completed_actions: ['Routine shift inspection'],
          pending_actions: [],
        },
        current_state: {
          issue: 'Abnormal vibration',
          current_status: 'needs_attention',
          completed_actions: ['Belt replaced'],
          pending_actions: ['Motor inspection'],
        },
      }),
    ]).then(([assetRes, histRes, compRes]) => {
      if (isMounted) {
        setAsset(assetRes);
        setHistoryEvents(histRes);
        if (compRes?.has_changes) {
          setStateChanges(compRes.changes);
        }
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [assetId]);

  if (loading) {
    return <LoadingState label="Loading operational memory..." />;
  }

  if (!asset) {
    return (
      <EmptyState
        title="Asset Not Found"
        description={`No machine matching code '${assetId}' was found in the operational registry.`}
        actionLabel="Back to Assets"
        onAction={() => navigate('/assets')}
      />
    );
  }

  const isCompressor = asset.assetCode === 'COMP-03';
  const latestIssue = isCompressor ? 'Abnormal vibration' : asset.whatHappened || 'Normal operational condition';
  const readinessScore = isCompressor ? 72 : 95;

  return (
    <div className="space-y-4">
      <PageHeader
        title={asset.name}
        subtitle={`${asset.type} • ${asset.location}`}
        showBackButton
        badge={<StatusBadge status={asset.status} size="sm" />}
      />

      {/* Asset Overview Card */}
      <Card className="border-slate-300 shadow-xs">
        <CardHeader className="pb-2 bg-slate-50/80 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500">
              CURRENT STATE
            </span>
            <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Last handover: {asset.lastUpdated}
            </span>
          </div>
          <CardTitle className="text-base font-bold text-slate-900 pt-1">
            {latestIssue}
          </CardTitle>
        </CardHeader>

        <CardContent className="p-4 space-y-3 text-xs">
          {/* What happened */}
          <div>
            <span className="text-slate-400 font-bold block uppercase text-[10px] tracking-wider">
              LATEST OBSERVATION
            </span>
            <p className="text-slate-800 font-medium mt-0.5 leading-relaxed">
              {isCompressor
                ? 'Abnormal vibration reported during shift. Belt replaced yesterday; motor inspection remains pending.'
                : asset.whatHappened || 'Routine maintenance and shift handover verified without active anomalies.'}
            </p>
          </div>

          {isCompressor && (
            <>
              <Divider className="my-2" />
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-50 p-2 rounded border border-slate-100">
                  <span className="text-slate-400 font-bold block uppercase text-[9px] tracking-wider">
                    COMPLETED
                  </span>
                  <span className="text-emerald-700 font-semibold flex items-center gap-1 mt-0.5 text-[11px]">
                    <CheckCircle2 className="w-3 h-3" /> Belt replaced
                  </span>
                </div>
                <div className="bg-amber-50 p-2 rounded border border-amber-200/60">
                  <span className="text-amber-800 font-bold block uppercase text-[9px] tracking-wider">
                    PENDING
                  </span>
                  <span className="text-amber-900 font-semibold flex items-center gap-1 mt-0.5 text-[11px]">
                    <AlertTriangle className="w-3 h-3 text-amber-600" /> Motor inspection
                  </span>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Handover Readiness Card */}
      <Card className="border-blue-200 bg-blue-50/20">
        <CardContent className="p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-slate-600 block">
                HANDOVER READINESS
              </span>
              <span className="text-xs font-semibold text-amber-800">
                {readinessScore < 90 ? 'NEEDS ATTENTION' : 'READY'}
              </span>
            </div>
            <span className="text-base font-bold font-mono text-slate-900">
              {readinessScore} / 100
            </span>
          </div>

          <Progress value={readinessScore} size="md" />

          {readinessScore < 90 ? (
            <p className="text-xs text-amber-800 font-medium flex items-center gap-1.5 pt-0.5">
              <HelpCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>One important detail may still be missing.</span>
            </p>
          ) : (
            <p className="text-xs text-emerald-800 font-medium flex items-center gap-1.5 pt-0.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Operational context complete for oncoming shift.</span>
            </p>
          )}
        </CardContent>
      </Card>

      {/* Primary and Secondary Action CTAs */}
      <div className="space-y-2 pt-1">
        <Button
          variant="primary"
          fullWidth
          size="lg"
          leftIcon={<PlusCircle className="w-4 h-4" />}
          onClick={() => navigate(`/handover/new?asset=${asset.assetCode}`)}
          className="font-bold shadow-xs"
        >
          Create Handover
        </Button>

        <Button
          variant="outline"
          fullWidth
          size="md"
          rightIcon={<ArrowUpRight className="w-4 h-4" />}
          onClick={() => navigate('/handover/HO-101/next-worker')}
          className="font-semibold text-slate-700 bg-white"
        >
          View Operational Memory
        </Button>
      </div>

      {/* Semantic Change Detection Matrix */}
      {isCompressor && stateChanges.length > 0 && (
        <div className="space-y-2 pt-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
            CHANGED SINCE LAST UPDATE
          </h3>

          <Card className="border-amber-200/80 bg-amber-50/30">
            <CardContent className="p-3 space-y-2 text-xs">
              <div className="flex items-center justify-between border-b border-amber-200/40 pb-1.5">
                <span className="font-semibold text-slate-700">Vibration:</span>
                <div className="flex items-center gap-1.5 font-mono text-[11px]">
                  <span className="text-slate-400">Normal</span>
                  <span className="text-slate-300">&rarr;</span>
                  <span className="text-rose-700 font-bold">Elevated</span>
                  <Badge variant="danger" size="sm" className="h-4 text-[9px] px-1">
                    HIGH
                  </Badge>
                </div>
              </div>

              <div className="flex items-center justify-between border-b border-amber-200/40 pb-1.5">
                <span className="font-semibold text-slate-700">Status:</span>
                <div className="flex items-center gap-1.5 font-mono text-[11px]">
                  <span className="text-emerald-700">Operational</span>
                  <span className="text-slate-300">&rarr;</span>
                  <span className="text-amber-800 font-bold">Needs Attention</span>
                  <Badge variant="warning" size="sm" className="h-4 text-[9px] px-1">
                    HIGH
                  </Badge>
                </div>
              </div>

              <div className="flex items-center justify-between pt-0.5">
                <span className="font-semibold text-slate-700">Pending work:</span>
                <div className="flex items-center gap-1.5 font-mono text-[11px]">
                  <span className="text-slate-400">None</span>
                  <span className="text-slate-300">&rarr;</span>
                  <span className="text-slate-800 font-bold">Motor inspection</span>
                  <Badge variant="neutral" size="sm" className="h-4 text-[9px] px-1">
                    MED
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Operational History (Vertical Timeline) */}
      <div className="space-y-2 pt-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <HistoryIcon className="w-3.5 h-3.5 text-slate-400" />
          OPERATIONAL HISTORY
        </h3>

        <Card>
          <CardContent className="p-4">
            {historyEvents.length > 0 ? (
              <div className="relative border-l-2 border-slate-200 ml-2.5 space-y-4 py-1">
                {historyEvents.map((item, index) => (
                  <div key={index} className="relative pl-5">
                    <div className="absolute -left-[7px] top-1 w-3 h-3 rounded-full bg-white border-2 border-slate-400" />
                    <div>
                      <span className="text-[10px] font-mono font-bold text-slate-400 block uppercase">
                        {item.type.replace(/_/g, ' ')}
                      </span>
                      <p className="text-xs font-semibold text-slate-800 mt-0.5">{item.summary}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-xs text-slate-400">
                No recent event history recorded.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
