import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Clock } from 'lucide-react';
import { PageHeader, Card, StatusBadge } from '@/components';
import { mockAssets, mockRecentHandovers } from '@/data';

export const HistoryPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <PageHeader
        title="Operational History"
        subtitle="Recent shift handovers and state updates"
      />

      <div className="space-y-3">
        {mockRecentHandovers.map((rh) => {
          const asset = mockAssets.find((a) => a.assetCode === rh.assetCode);
          return (
            <Card
              key={rh.id}
              variant="interactive"
              onClick={() => navigate(`/handover/${rh.handoverId}`)}
            >
              <div className="p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {rh.assetCode}
                    </span>
                    {asset && <StatusBadge status={asset.status} size="sm" />}
                  </div>
                  <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {rh.timeLabel}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-slate-900">{rh.assetName}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{rh.title}</p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-blue-600 font-medium">
                  <span>View Full Handover Record</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
