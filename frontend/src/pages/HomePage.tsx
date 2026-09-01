import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, ArrowRight, Clock } from 'lucide-react';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, StatusBadge, Badge } from '@/components';
import { mockAssets } from '@/data';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-5">
      {/* Shift Overview Banner */}
      <div className="bg-slate-900 text-white rounded-xl p-4 shadow-sm relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between">
            <Badge variant="outline" size="sm" className="text-slate-300 border-slate-700 bg-slate-800/60">
              Shift Active &bull; Plant Floor A
            </Badge>
            <span className="text-[11px] text-slate-400 font-mono">iQOO AI Core</span>
          </div>

          <div className="space-y-1">
            <h2 className="text-lg font-bold tracking-tight">Preserve Operational State</h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Capture messy shift knowledge. AI extracts structured state, detects gaps, and validates readiness for the next technician.
            </p>
          </div>

          <div className="pt-1 flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<PlusCircle className="w-4 h-4" />}
              onClick={() => navigate('/handover/new')}
            >
              Start Handover
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 hover:text-white"
              onClick={() => navigate('/assets')}
            >
              View Assets
            </Button>
          </div>
        </div>
      </div>

      {/* Critical Handover Attention Card (Demo COMP-03) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Active Attention Handover
          </h3>
          <span className="text-xs text-blue-600 font-medium">1 in progress</span>
        </div>

        <Card
          variant="interactive"
          onClick={() => navigate('/handover/HO-101')}
          className="border-amber-200/80 bg-amber-50/30"
        >
          <CardHeader className="pb-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                  COMP-03
                </span>
                <StatusBadge status="needs_attention" size="sm" />
              </div>
              <span className="text-xs font-semibold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-full">
                72% Ready
              </span>
            </div>
            <CardTitle className="text-sm mt-1">Compressor #03 &bull; Abnormal vibration</CardTitle>
            <CardDescription className="line-clamp-2">
              Belt replaced, motor pending inspection. Gap detected: Load test verification unconfirmed.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 mt-2">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Updated 10m ago
            </span>
            <span className="text-blue-600 font-medium flex items-center gap-1">
              Review Readiness <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Asset Overview List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Monitored Equipment ({mockAssets.length})
          </h3>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-slate-500 hover:text-slate-900"
            onClick={() => navigate('/assets')}
          >
            All Assets <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </div>

        <div className="space-y-2">
          {mockAssets.map((asset) => (
            <Card
              key={asset.id}
              variant="interactive"
              onClick={() => navigate(`/assets/${asset.assetCode}`)}
            >
              <div className="p-3.5 flex items-center justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900">
                      {asset.assetCode}
                    </span>
                    <StatusBadge status={asset.status} size="sm" />
                  </div>
                  <h4 className="text-sm font-medium text-slate-800 truncate">{asset.name}</h4>
                  <p className="text-xs text-slate-400 truncate">{asset.location}</p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[11px] text-slate-400 block font-mono">
                    {asset.lastUpdated}
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-300 ml-auto mt-1" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
