import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PlusCircle, ArrowRight } from 'lucide-react';
import { PageHeader, StatusBadge, Button, Card, CardHeader, CardTitle, CardContent, Badge, EmptyState } from '@/components';
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
        description={`No machine matching code '${assetId}' is registered in the operational directory.`}
        actionLabel="Back to Assets"
        onAction={() => navigate('/assets')}
      />
    );
  }

  const activeHandover = asset.activeHandoverId ? mockHandovers[asset.activeHandoverId] : null;

  return (
    <div className="space-y-4">
      <PageHeader
        title={asset.name}
        subtitle={`${asset.type} • ${asset.location}`}
        showBackButton
        badge={<StatusBadge status={asset.status} size="sm" />}
      />

      {/* Asset Metadata Card */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Asset Code</span>
            <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              {asset.assetCode}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Operating Location</span>
            <span className="text-slate-800 font-medium">{asset.location}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Last Recorded Log</span>
            <span className="text-slate-800 font-mono">{asset.lastUpdated}</span>
          </div>
          {asset.description && (
            <p className="text-xs text-slate-600 pt-2 border-t border-slate-100 leading-relaxed">
              {asset.description}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Active Operational Memory Card */}
      {activeHandover ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Current Operational Memory
            </h3>
            <span className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
              {activeHandover.readiness.score}% Readiness
            </span>
          </div>

          <Card
            variant="interactive"
            onClick={() => navigate(`/handover/${activeHandover.id}`)}
            className="border-blue-200/80 bg-blue-50/20"
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <Badge variant="brand" size="sm">
                  Active Shift Handover
                </Badge>
                <span className="text-[11px] text-slate-400 font-mono">
                  {activeHandover.id}
                </span>
              </div>
              <CardTitle className="text-sm mt-1">
                {activeHandover.operationalState.issue || 'Operational Update'}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              <p className="text-xs text-slate-600 bg-white/80 p-2.5 rounded-lg border border-slate-200/60 leading-relaxed font-mono text-[11px]">
                "{activeHandover.rawInput}"
              </p>
              <div className="flex items-center justify-between text-xs text-blue-600 font-medium pt-1">
                <span>View Full Memory & Gap Resolution</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <EmptyState
          title="No Active Handover"
          description="This asset is currently in steady operation with no pending handover transitions."
          actionLabel="Record Handover"
          onAction={() => navigate('/handover/new')}
        />
      )}

      {/* Action Footer */}
      <div className="pt-2">
        <Button
          variant="secondary"
          fullWidth
          leftIcon={<PlusCircle className="w-4 h-4" />}
          onClick={() => navigate('/handover/new')}
        >
          Capture New Shift Handover
        </Button>
      </div>
    </div>
  );
};
