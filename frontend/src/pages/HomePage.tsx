import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, ArrowRight, AlertTriangle, Clock, Layers, User } from 'lucide-react';
import { Button, Card, StatusBadge, Badge } from '@/components';
import { mockAssets, mockRecentHandovers } from '@/data';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();

  // Find the critical attention asset (Compressor #03)
  const attentionAsset = mockAssets.find((a) => a.status === 'needs_attention') || mockAssets[0];

  return (
    <div className="space-y-5">
      {/* Dashboard Brand Header & Hero Area */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900">HANDOVER</h1>
              <Badge variant="brand" size="sm" className="font-mono text-[10px]">
                iQOO AI
              </Badge>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Your operational memory</p>
          </div>
          {/* Subtle profile avatar placeholder */}
          <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-600 shadow-2xs">
            <User className="w-4 h-4" />
          </div>
        </div>

        {/* Hero Quick Action Bar */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <Button
            variant="primary"
            size="md"
            leftIcon={<PlusCircle className="w-4 h-4" />}
            onClick={() => navigate('/handover/new')}
            className="w-full justify-center shadow-xs"
          >
            + New Handover
          </Button>
          <Button
            variant="outline"
            size="md"
            leftIcon={<Layers className="w-4 h-4 text-slate-600" />}
            onClick={() => navigate('/assets')}
            className="w-full justify-center"
          >
            View Assets
          </Button>
        </div>
      </div>

      {/* Attention Required Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            ATTENTION REQUIRED
          </h2>
          <span className="text-[11px] text-amber-800 font-medium">1 action needed</span>
        </div>

        <Card
          variant="interactive"
          onClick={() => navigate(`/assets/${attentionAsset.assetCode}`)}
          className="border-amber-300 bg-amber-50/50 shadow-2xs"
        >
          <div className="p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-amber-200">
                {attentionAsset.assetCode}
              </span>
              <StatusBadge status="needs_attention" size="sm" />
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900">{attentionAsset.name}</h3>
              <p className="text-xs font-medium text-amber-900 mt-0.5">Abnormal vibration</p>
              <p className="text-xs text-slate-600 mt-0.5">Motor inspection pending</p>
            </div>

            <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                Updated {attentionAsset.lastUpdated}
              </span>
              <Button
                variant="secondary"
                size="sm"
                className="h-7 px-3 text-xs bg-amber-600 hover:bg-amber-700 text-white border-amber-700"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/assets/${attentionAsset.assetCode}`);
                }}
              >
                Review
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Assets Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            ASSETS ({mockAssets.length})
          </h2>
          <button
            type="button"
            onClick={() => navigate('/assets')}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
          >
            View all <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="space-y-2">
          {mockAssets.map((asset) => (
            <Card
              key={asset.id}
              variant="interactive"
              onClick={() => navigate(`/assets/${asset.assetCode}`)}
            >
              <div className="p-3.5 flex items-center justify-between gap-3">
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-slate-900 truncate">
                      {asset.name}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500">
                    Type: {asset.type}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Last updated: {asset.lastUpdated}
                  </p>
                </div>

                <div className="text-right shrink-0 flex flex-col items-end gap-1.5">
                  <StatusBadge status={asset.status} size="sm" />
                  <ArrowRight className="w-4 h-4 text-slate-300" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Handovers Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            RECENT HANDOVERS
          </h2>
          <button
            type="button"
            onClick={() => navigate('/history')}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
          >
            History <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="space-y-2">
          {mockRecentHandovers.map((event) => (
            <Card
              key={event.id}
              variant="interactive"
              onClick={() => navigate(`/handover/${event.handoverId}`)}
            >
              <div className="p-3 flex items-center justify-between gap-3 text-xs">
                <div className="min-w-0">
                  <h4 className="font-semibold text-slate-800">{event.assetName}</h4>
                  <p className="text-slate-500 mt-0.5">{event.title}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {event.timeLabel}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
