import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Mic,
  Camera,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  ArrowRight,
  Check,
  UserCheck,
} from 'lucide-react';
import {
  PageHeader,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  TextArea,
  Badge,
  StatusBadge,
  Progress,
  Divider,
} from '@/components';
import { mockAssets } from '@/data';
import { mockAiService } from '@/services/mockAiService';
import type { AIAnalysisResult } from '@/types';

type StepMode = 'input' | 'analyzing' | 'review' | 'confirmed';

export const NewHandoverPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const assetQuery = searchParams.get('asset');

  const [selectedAssetCode, setSelectedAssetCode] = useState(assetQuery || 'COMP-03');
  const [rawText, setRawText] = useState(
    'Compressor 03 has abnormal vibration. We replaced the belt yesterday. Motor hasn\'t been checked yet. We\'re keeping it below 70% load.'
  );

  const [stepMode, setStepMode] = useState<StepMode>('input');
  const [analysisStep, setAnalysisStep] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null);
  const [selectedGapAnswer, setSelectedGapAnswer] = useState<'yes' | 'no' | 'not_sure' | null>(null);
  const [bannerToast, setBannerToast] = useState<string | null>(null);

  useEffect(() => {
    if (assetQuery) {
      setSelectedAssetCode(assetQuery);
    }
  }, [assetQuery]);

  const selectedAsset =
    mockAssets.find((a) => a.assetCode === selectedAssetCode) || mockAssets[0];

  // Helper for quick context chip insertions
  const handleChipClick = (chip: string) => {
    const chipPrompts: Record<string, string> = {
      Issue: ' Issue noticed: ',
      'Action taken': ' Action completed: ',
      Pending: ' Still pending: ',
      Workaround: ' Temporary workaround: ',
    };
    const addition = chipPrompts[chip] || ` [${chip}]: `;
    setRawText((prev) => (prev ? `${prev.trim()}\n${addition}` : addition.trim()));
  };

  // Trigger analysis pipeline
  const handleStartAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawText.trim()) return;

    setStepMode('analyzing');
    setAnalysisStep(1);

    // Step 1 -> Step 2
    setTimeout(() => setAnalysisStep(2), 350);
    // Step 2 -> Step 3
    setTimeout(() => setAnalysisStep(3), 750);
    // Step 3 -> Step 4
    setTimeout(() => setAnalysisStep(4), 1150);

    // Call service
    const result = await mockAiService.analyzeHandover(selectedAssetCode, rawText);

    setTimeout(() => {
      setAnalysisResult(result);
      setStepMode('review');
    }, 1450);
  };

  // Handle answering gap question
  const handleAnswerGap = (answer: 'yes' | 'no' | 'not_sure') => {
    if (!analysisResult) return;
    setSelectedGapAnswer(answer);
    const updated = mockAiService.answerGap(analysisResult, answer);
    setAnalysisResult(updated);
  };

  // Handle saving handover
  const handleSaveHandover = () => {
    setStepMode('confirmed');
  };

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {bannerToast && (
        <div className="bg-slate-900 text-white text-xs px-3 py-2 rounded-lg shadow-md flex items-center justify-between animate-fade-in">
          <span>{bannerToast}</span>
          <button
            type="button"
            onClick={() => setBannerToast(null)}
            className="text-slate-400 hover:text-white ml-2"
          >
            &times;
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SCREEN 1: CREATE HANDOVER (INPUT STATE) */}
      {/* ========================================================================= */}
      {stepMode === 'input' && (
        <div className="space-y-4">
          <PageHeader
            title="New Handover"
            subtitle="Capture what the next person needs to know."
            showBackButton
          />

          <form onSubmit={handleStartAnalysis} className="space-y-4">
            {/* Asset Selector */}
            <div className="space-y-1.5">
              <label
                htmlFor="asset-select"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700"
              >
                TARGET ASSET
              </label>
              <select
                id="asset-select"
                value={selectedAssetCode}
                onChange={(e) => setSelectedAssetCode(e.target.value)}
                className="w-full h-11 px-3.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all shadow-2xs"
              >
                {mockAssets.map((asset) => (
                  <option key={asset.id} value={asset.assetCode}>
                    {asset.name} ({asset.assetCode}) — {asset.type}
                  </option>
                ))}
              </select>
            </div>

            {/* Knowledge Capture Area */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="handover-input"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-700"
                >
                  WHAT HAPPENED?
                </label>
                <Badge variant="brand" size="sm" className="font-mono text-[10px]">
                  <Sparkles className="w-3 h-3" /> AI Core
                </Badge>
              </div>

              <TextArea
                id="handover-input"
                rows={5}
                placeholder="Describe what you saw, what you tried, what's still unresolved, or anything the next person should know..."
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
              />

              <div className="flex items-center justify-between text-[11px] text-slate-400 px-0.5">
                <span>{rawText.length} characters</span>
                <span>Unstructured field notes supported</span>
              </div>
            </div>

            {/* Voice & Camera Affordances */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setBannerToast('🎙 Voice recording is coming in the next shift release.')}
                className="flex items-center justify-center gap-2 p-2.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
              >
                <Mic className="w-4 h-4 text-blue-600" />
                <span>🎙 Record</span>
              </button>

              <button
                type="button"
                onClick={() => setBannerToast('📷 Camera evidence capture is simulated in demo.')}
                className="flex items-center justify-center gap-2 p-2.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
              >
                <Camera className="w-4 h-4 text-slate-600" />
                <span>📷 Add evidence</span>
              </button>
            </div>

            {/* Quick Context Chips */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                QUICK CONTEXT CHIPS (OPTIONAL)
              </span>
              <div className="flex flex-wrap gap-1.5">
                {['Issue', 'Action taken', 'Pending', 'Workaround'].map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => handleChipClick(chip)}
                    className="text-xs font-medium px-2.5 py-1 bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 rounded-md border border-slate-200 transition-colors"
                  >
                    + {chip}
                  </button>
                ))}
              </div>
            </div>

            {/* Primary CTA */}
            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                fullWidth
                size="lg"
                disabled={!rawText.trim()}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Analyze Handover
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SCREEN 2: ANALYZING STATE */}
      {/* ========================================================================= */}
      {stepMode === 'analyzing' && (
        <div className="py-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mx-auto animate-pulse">
              <Sparkles className="w-6 h-6" />
            </div>
            <h2 className="text-base font-bold text-slate-900">Understanding handover...</h2>
            <p className="text-xs text-slate-500">
              Structuring facts for {selectedAsset.name}
            </p>
          </div>

          <Card className="border-slate-200 bg-white shadow-sm">
            <CardContent className="p-4 space-y-3 text-xs">
              <div className="flex items-center gap-3">
                {analysisStep >= 1 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-slate-300 shrink-0" />
                )}
                <span className={analysisStep >= 1 ? 'font-medium text-slate-900' : 'text-slate-400'}>
                  Reading your notes
                </span>
              </div>

              <div className="flex items-center gap-3">
                {analysisStep >= 2 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-slate-300 shrink-0" />
                )}
                <span className={analysisStep >= 2 ? 'font-medium text-slate-900' : 'text-slate-400'}>
                  Identifying completed work
                </span>
              </div>

              <div className="flex items-center gap-3">
                {analysisStep >= 3 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-slate-300 shrink-0" />
                )}
                <span className={analysisStep >= 3 ? 'font-medium text-slate-900' : 'text-slate-400'}>
                  Finding unresolved issues
                </span>
              </div>

              <div className="flex items-center gap-3">
                {analysisStep >= 4 ? (
                  <div className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                  </div>
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-slate-300 shrink-0" />
                )}
                <span className={analysisStep >= 4 ? 'font-semibold text-blue-600' : 'text-slate-400'}>
                  Checking what's missing
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SCREEN 3: AI OPERATIONAL STATE + GAP DETECTION */}
      {/* ========================================================================= */}
      {stepMode === 'review' && analysisResult && (
        <div className="space-y-4">
          <PageHeader
            title="Handover analyzed"
            subtitle={`${selectedAsset.name} • Operational state extracted`}
            badge={<StatusBadge status={analysisResult.status} size="sm" />}
          />

          {/* Structured Operational State Card */}
          <Card className="border-slate-300 shadow-xs">
            <CardHeader className="pb-2 bg-slate-50 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500">
                  CURRENT ISSUE
                </span>
                <span className="font-mono text-xs font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {analysisResult.assetCode}
                </span>
              </div>
              <CardTitle className="text-sm font-bold text-slate-900 pt-0.5">
                {analysisResult.issue || 'No critical issue detected'}
              </CardTitle>
            </CardHeader>

            <CardContent className="p-4 space-y-3.5 text-xs">
              {/* Completed */}
              <div>
                <span className="text-slate-400 font-bold block uppercase text-[10px] tracking-wider mb-1">
                  COMPLETED
                </span>
                <ul className="space-y-1">
                  {analysisResult.completed.map((act, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-slate-800 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{act}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Divider className="my-1.5" />

              {/* Pending */}
              <div>
                <span className="text-slate-400 font-bold block uppercase text-[10px] tracking-wider mb-1">
                  PENDING
                </span>
                {analysisResult.pending.length > 0 ? (
                  <ul className="space-y-1">
                    {analysisResult.pending.map((act, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-1.5 text-amber-900 font-medium bg-amber-50 p-1.5 rounded border border-amber-200/60"
                      >
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-500 italic text-[11px]">No pending actions.</p>
                )}
              </div>

              <Divider className="my-1.5" />

              {/* Workaround & Root Cause */}
              <div className="grid grid-cols-1 gap-2">
                <div>
                  <span className="text-slate-400 font-bold block uppercase text-[10px] tracking-wider">
                    WORKAROUND
                  </span>
                  <p className="font-mono text-slate-900 font-semibold mt-0.5 bg-slate-100 p-2 rounded border border-slate-200">
                    {analysisResult.workaround || 'None / Standard operation'}
                  </p>
                </div>

                <div className="pt-1">
                  <span className="text-slate-400 font-bold block uppercase text-[10px] tracking-wider">
                    ROOT CAUSE
                  </span>
                  <p className="text-slate-700 font-medium mt-0.5">
                    {analysisResult.rootCause || 'Under investigation / Unknown'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Readiness Score Card */}
          <Card className="border-slate-200">
            <CardContent className="p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider font-bold text-slate-600">
                  HANDOVER READINESS
                </span>
                <span className="text-base font-bold font-mono text-slate-900">
                  {analysisResult.readinessScore} / 100
                </span>
              </div>

              <Progress value={analysisResult.readinessScore} size="md" />

              {selectedGapAnswer ? (
                <p className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5 pt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>
                    {selectedGapAnswer === 'yes'
                      ? 'Better handover — verified operating state'
                      : 'One more detail captured'}
                  </span>
                </p>
              ) : (
                <p className="text-xs text-amber-800 font-medium flex items-center gap-1.5 pt-0.5">
                  <HelpCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Something important may be missing</span>
                </p>
              )}
            </CardContent>
          </Card>

          {/* AI Gap Detection Follow-up Card */}
          {analysisResult.gap.detected && !selectedGapAnswer && (
            <Card className="border-amber-300 bg-amber-50/60 shadow-2xs">
              <CardHeader className="pb-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>AI FOLLOW-UP</span>
                  </div>
                  <Badge variant="warning" size="sm">
                    Gap Detected
                  </Badge>
                </div>
                <p className="text-xs font-bold text-slate-900 pt-1 leading-snug">
                  "{analysisResult.gap.question}"
                </p>
              </CardHeader>

              <CardContent className="pt-2 space-y-2">
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleAnswerGap('yes')}
                    className="py-2 px-1 text-center bg-white border border-amber-300 rounded-lg text-xs font-semibold text-slate-800 hover:bg-emerald-50 hover:text-emerald-900 hover:border-emerald-300 transition-colors shadow-2xs"
                  >
                    Yes, tested
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAnswerGap('no')}
                    className="py-2 px-1 text-center bg-white border border-amber-300 rounded-lg text-xs font-semibold text-slate-800 hover:bg-amber-100 hover:text-amber-900 hover:border-amber-400 transition-colors shadow-2xs"
                  >
                    No, not yet
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAnswerGap('not_sure')}
                    className="py-2 px-1 text-center bg-white border border-amber-300 rounded-lg text-xs font-semibold text-slate-800 hover:bg-slate-100 transition-colors shadow-2xs"
                  >
                    Not sure
                  </button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action CTAs */}
          <div className="pt-2 space-y-2">
            <Button
              variant="primary"
              fullWidth
              size="lg"
              onClick={handleSaveHandover}
            >
              Save Handover
            </Button>

            <button
              type="button"
              onClick={() => setStepMode('input')}
              className="w-full text-center text-xs text-slate-500 hover:text-slate-800 py-1"
            >
              Review before saving
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SCREEN 4: HANDOVER SUMMARY / CONFIRMED STATE */}
      {/* ========================================================================= */}
      {stepMode === 'confirmed' && (
        <div className="space-y-4">
          <div className="bg-slate-900 text-white rounded-xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> HANDOVER READY
              </span>
              <span className="font-mono text-xs text-slate-400">{selectedAsset.assetCode}</span>
            </div>

            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white tracking-tight">{selectedAsset.name}</h2>
              <p className="text-xs text-slate-300">
                Operational memory captured and ready for oncoming shift.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-800 space-y-2 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Current issue captured</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Work completed recorded</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Pending work identified</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Missing context reviewed</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-400">Handover readiness:</span>
              <span className="text-emerald-400 font-mono text-base font-bold">
                {analysisResult?.readinessScore || 94} / 100
              </span>
            </div>
          </div>

          <div className="pt-2 space-y-2.5">
            <Button
              variant="primary"
              fullWidth
              size="lg"
              leftIcon={<UserCheck className="w-4 h-4" />}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              onClick={() => navigate('/handover/HO-101/next-worker')}
            >
              View for Next Worker
            </Button>

            <Button
              variant="outline"
              fullWidth
              size="md"
              onClick={() => navigate(`/assets/${selectedAsset.assetCode}`)}
            >
              Back to {selectedAsset.name}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
