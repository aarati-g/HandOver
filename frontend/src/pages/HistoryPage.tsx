import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Clock, History as HistoryIcon } from 'lucide-react';
import { PageHeader, Card, StatusBadge, LoadingState } from '@/components';
import { api } from '@/services/api';
import { mockAssets, mockRecentHandovers } from '@/data';
import type { OperationalEventSummary } from '@/types';

export const HistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [historyEvents, setHistoryEvents] = useState<OperationalEventSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    api.getHistory('COMP-03').then((res) => {
      if (isMounted) {
        setHistoryEvents(res);
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Operational History"
        subtitle="Recent shift handovers and audit log stream"
      />

      {/* Chronological Event Timeline from Backend */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <HistoryIcon className="w-3.5 h-3.5 text-slate-400" />
          ACTIVE TIMELINE (COMPRESSOR #03)
        </h3>

        <Card>
          <div className="p-4">
            {loading ? (
              <LoadingState label="Loading operational memory..." size="sm" />
            ) : historyEvents.length > 0 ? (
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
              <p className="text-xs text-slate-400 text-center py-2">No event records found.</p>
            )}
          </div>
        </Card>
      </div>

      {/* Recent Handover Cards */}
      <div className="space-y-2 pt-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          ALL RECORDED SHIFT TRANSITIONS
        </h3>

        <div className="space-y-2">
          {mockRecentHandovers.map((rh) => {
            const asset = mockAssets.find((a) => a.assetCode === rh.assetCode);
            return (
              <Card
                key={rh.id}
                variant="interactive"
                onClick={() => navigate(`/assets/${rh.assetCode}`)}
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
                    <span>View Asset State & History</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};
