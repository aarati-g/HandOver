import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';
import { PageHeader, Card, CardContent, Button, TextArea, Badge } from '@/components';
import { mockAssets } from '@/data';

export const NewHandoverPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const assetQuery = searchParams.get('asset');

  const [selectedAsset, setSelectedAsset] = useState(assetQuery || 'COMP-03');
  const [rawText, setRawText] = useState(
    'Machine 03 has abnormal vibration. We replaced the belt, but the motor hasn\'t been inspected. It is currently operating below 70% load.'
  );
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (assetQuery) {
      setSelectedAsset(assetQuery);
    }
  }, [assetQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      navigate('/handover/HO-101');
    }, 600);
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Capture Handover"
        subtitle="Record raw shift knowledge for AI operational memory extraction"
        showBackButton
      />

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Asset Selector */}
        <div className="space-y-1.5">
          <label htmlFor="asset-select" className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
            Target Asset
          </label>
          <select
            id="asset-select"
            value={selectedAsset}
            onChange={(e) => setSelectedAsset(e.target.value)}
            className="w-full h-11 px-3.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all shadow-2xs"
          >
            {mockAssets.map((asset) => (
              <option key={asset.id} value={asset.assetCode}>
                {asset.assetCode} — {asset.name} ({asset.location})
              </option>
            ))}
          </select>
        </div>

        {/* Knowledge Input Area */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="handover-input" className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Messy Shift Knowledge / Observation
            </label>
            <Badge variant="brand" size="sm">
              <Sparkles className="w-3 h-3" /> AI Assisted
            </Badge>
          </div>

          <TextArea
            id="handover-input"
            rows={5}
            placeholder="Describe what happened, parts replaced, workarounds, pending actions, or safety concerns..."
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            helperText="Speak naturally or paste quick shift notes. The AI extracts structured facts, flags unknowns, and checks gaps."
          />
        </div>

        {/* Quick Demo Pre-fill Prompt Banner */}
        <Card variant="subtle" className="border-slate-200">
          <CardContent className="p-3 text-xs text-slate-600 space-y-1.5">
            <span className="font-semibold text-slate-800 block">Sample COMP-03 Test Scenario:</span>
            <p className="font-mono text-[11px] text-slate-500 bg-white p-2 rounded border border-slate-200">
              "Machine 03 has abnormal vibration. We replaced the belt, but the motor hasn't been inspected. It is currently operating below 70% load."
            </p>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="pt-2">
          <Button
            type="submit"
            variant="secondary"
            fullWidth
            isLoading={isProcessing}
            leftIcon={<Sparkles className="w-4 h-4" />}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Extract Operational Memory & Gap Analysis
          </Button>
        </div>
      </form>
    </div>
  );
};
