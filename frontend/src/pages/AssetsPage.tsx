import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, ArrowRight, Layers } from 'lucide-react';
import { PageHeader, Input, Card, StatusBadge, Button, EmptyState } from '@/components';
import { mockAssets } from '@/data';

type FilterTab = 'all' | 'attention' | 'operational';

export const AssetsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterTab>('all');

  const filteredAssets = mockAssets.filter((asset) => {
    // Search filter
    const matchesSearch =
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.assetCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.location.toLowerCase().includes(searchTerm.toLowerCase());

    // Status filter
    if (statusFilter === 'attention') {
      return matchesSearch && (asset.status === 'needs_attention' || asset.status === 'degraded' || asset.status === 'offline');
    }
    if (statusFilter === 'operational') {
      return matchesSearch && asset.status === 'operational';
    }
    return matchesSearch;
  });

  return (
    <div className="space-y-4">
      <PageHeader
        title="Assets"
        subtitle="Operational memory across your equipment"
        actions={
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => navigate('/handover/new')}
          >
            New Handover
          </Button>
        }
      />

      {/* Search Input */}
      <Input
        placeholder="Search assets..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        leftIcon={<Search className="w-4 h-4 text-slate-400" />}
      />

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-200/70 rounded-lg">
        <button
          type="button"
          onClick={() => setStatusFilter('all')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
            statusFilter === 'all'
              ? 'bg-white text-slate-900 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          All ({mockAssets.length})
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('attention')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
            statusFilter === 'attention'
              ? 'bg-white text-amber-900 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Attention ({mockAssets.filter((a) => a.status === 'needs_attention').length})
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('operational')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
            statusFilter === 'operational'
              ? 'bg-white text-emerald-900 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Operational ({mockAssets.filter((a) => a.status === 'operational').length})
        </button>
      </div>

      {/* Asset Cards List */}
      {filteredAssets.length > 0 ? (
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

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-blue-600 font-medium">
                  <span>View Operational Memory</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Layers className="w-6 h-6 text-slate-400" />}
          title="No assets match your search"
          description={`No equipment found for "${searchTerm}" under ${statusFilter} filter.`}
          actionLabel="Clear Filters"
          onAction={() => {
            setSearchTerm('');
            setStatusFilter('all');
          }}
        />
      )}
    </div>
  );
};
