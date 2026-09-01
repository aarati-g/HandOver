import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, ArrowRight } from 'lucide-react';
import { PageHeader, Input, Card, StatusBadge, Button } from '@/components';
import { mockAssets } from '@/data';

export const AssetsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAssets = mockAssets.filter(
    (a) =>
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.assetCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <PageHeader
        title="Asset Registry"
        subtitle="Monitored industrial machines and operational logs"
        actions={
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => navigate('/handover/new')}
          >
            New
          </Button>
        }
      />

      <Input
        placeholder="Filter by code, name, or location..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        leftIcon={<Search className="w-4 h-4 text-slate-400" />}
      />

      <div className="space-y-2.5 pt-1">
        {filteredAssets.map((asset) => (
          <Card
            key={asset.id}
            variant="interactive"
            onClick={() => navigate(`/assets/${asset.assetCode}`)}
          >
            <div className="p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    {asset.assetCode}
                  </span>
                  <StatusBadge status={asset.status} size="sm" />
                </div>
                <span className="text-xs text-slate-400 font-mono">{asset.lastUpdated}</span>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-900">{asset.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{asset.type} &bull; {asset.location}</p>
              </div>

              {asset.activeHandoverId && (
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-blue-600 font-medium">
                  <span>Active handover attached</span>
                  <span className="flex items-center gap-1">
                    Review <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
