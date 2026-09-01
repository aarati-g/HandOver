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
  Loader2,
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
import { api } from '@/services/api';
import type { AIAnalysisResult } from '@/types';

type StepMode = 'input' | 'analyzing' | 'review' | 'confirmed';

export const NewHandoverPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const assetQuery = searchParams.get('asset');

  const [selectedAssetCode, setSelectedAssetCode] = useState(assetQuery || 'COMP-03');
  const [rawText, setRawText] = useState(
    'Machine 03 has abnormal vibration. We replaced the belt, but the motor hasn\'t been inspected. It is currently operating below 70% load.'
  );

  const [stepMode, setStepMode] = useState<StepMode>('input');
  const [loadingText, setLoadingText] = useState('Reconstructing operational state...');
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null);

  // Gap Answer state
  const [gapAnswer, setGapAnswer] = useState(
    'Yes, it was tested under normal load and vibration remained elevated.'
  );
  const [isAnswering, setIsAnswering] = useState(false);
  const [bannerToast, setBannerToast] = useState<string | null>(null);

  useEffect(() => {
    if (assetQuery) {
      setSelectedAssetCode(assetQuery);
    }
  }, [assetQuery]);

  // Handle AI analysis call to FastAPI backend
  const handleStartAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawText.trim() || stepMode === 'analyzing') return;

    setStepMode('analyzing');
    setLoadingText('Connecting to Handover AI intelligence engine...');

    const timer1 = setTimeout(() => {
      setLoadingText('Extracting structured operational facts...');
    }, 400);

    const timer2 = setTimeout(() => {
      setLoadingText('Reconstructing operational state & detecting gaps...');
    }, 900);

    try {
      const result = await api.analyzeHandover({
        asset_id: selectedAssetCode,
        text: rawText,
      });

      clearTimeout(timer1);
      clearTimeout(timer2);
      setAnalysisResult(result);
      setStepMode('review');
    } catch (err) {
      console.error('Handover analysis failed:', err);
      setStepMode('input');
    }
  };

  // Handle answering gap question with backend
  const handleUpdateHandoverWithGap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!analysisResult || !gapAnswer.trim() || isAnswering) return;

    setIsAnswering(true);
    try {
      const updated = await api.answerHandover(analysisResult.handoverId || 1, {
        answer: gapAnswer,
      });
      setAnalysisResult(updated);
    } catch (err) {
      console.error('Gap answer submission failed:', err);
    } finally {
      setIsAnswering(false);
    }
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
            className="text-slate-400 hover:text-white ml-2 text-sm"
          >
            &times;
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SCREEN 3: CREATE HANDOVER */}
      {/* ========================================================================= */}
      {stepMode === 'input' && (
        <div className="space-y-4">
          <PageHeader
            title="Create Handover"
            subtitle="Capture what the next person needs to know."
            showBackButton
          />

          <form onSubmit={handleStartAnalysis} className="space-y-4">
            {/* Target Asset Banner */}
            <div className="bg-slate-100 p-3 rounded-lg border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                  ASSET
                </span>
                <span className="text-sm font-bold text-slate-900 font-mono">
                  Compressor #03 (COMP-03)
                </span>
              </div>
              <Badge variant="warning" size="sm">
                Attention Required
              </Badge>
            </div>

            {/* Input Capture Area */}
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
                className="font-normal leading-relaxed"
              />

              <div className="flex items-center justify-between text-[11px] text-slate-400 px-0.5">
                <span>{rawText.length} characters</span>
                <span>Unstructured field notes supported</span>
              </div>
            </div>

            {/* Voice & Evidence Placeholders */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setBannerToast('🎙 Voice recording is planned for upcoming field shifts.')}
                className="flex items-center justify-center gap-2 p-2.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
              >
                <Mic className="w-4 h-4 text-blue-600" />
                <span>🎙 Record</span>
              </button>

              <button
                type="button"
                onClick={() => setBannerToast('📷 Camera evidence attachment is simulated for demo.')}
                className="flex items-center justify-center gap-2 p-2.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
              >
                <Camera className="w-4 h-4 text-slate-600" />
                <span>📷 Add evidence</span>
              </button>
            </div>

            {/* Primary Action Button */}
            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                fullWidth
                size="lg"
                disabled={!rawText.trim()}
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="font-bold shadow-xs"
              >
                Analyze Handover
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SCREEN: ANALYZING STATE */}
      {/* ========================================================================= */}
      {stepMode === 'analyzing' && (
        <div className="py-12 space-y-6 text-center">
          <div className="w-14 h-14 rounded-full bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mx-auto animate-pulse shadow-sm">
            <Sparkles className="w-7 h-7" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-base font-bold text-slate-900">Understanding handover...</h2>
            <p className="text-xs text-blue-700 font-medium animate-pulse">{loadingText}</p>
          </div>

          <Card className="border-slate-200 bg-white max-w-xs mx-auto text-left shadow-2xs">
            <CardContent className="p-3.5 space-y-2 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Extracting symptoms & context</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Tracking verified shift actions</span>
              </div>
              <div className="flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 text-blue-600 animate-spin" />
                <span>Calculating readiness breakdown</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SCREEN 4: OPERATIONAL STATE (HERO SCREEN) */}
      {/* ========================================================================= */}
      {stepMode === 'review' && analysisResult && (
        <div className="space-y-4">
          <PageHeader
            title="COMPRESSOR #03"
            subtitle="AI Operational State"
            badge={
              <StatusBadge
                status={analysisResult.readinessScore >= 90 ? 'ready' : 'needs_attention'}
                size="sm"
              />
            }
          />

          {/* Structured Operational State Card */}
          <Card className="border-slate-300 shadow-xs">
            <CardHeader className="pb-2 bg-slate-50 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500">
                  ISSUE
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  Status: <strong className="text-amber-900 uppercase">NEEDS ATTENTION</strong>
                </span>
              </div>
              <CardTitle className="text-base font-bold text-slate-900 pt-0.5">
                {analysisResult.issue || 'Abnormal vibration'}
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
              </div>

              <Divider className="my-1.5" />

              {/* Workaround */}
              <div>
                <span className="text-slate-400 font-bold block uppercase text-[10px] tracking-wider">
                  WORKAROUND
                </span>
                <p className="font-mono text-slate-900 font-semibold mt-0.5 bg-slate-100 p-2 rounded border border-slate-200">
                  {analysisResult.workaround || 'Operate below 70% load'}
                </p>
              </div>

              {/* Root Cause & Unknowns */}
              <div className="grid grid-cols-1 gap-2 pt-1">
                <div>
                  <span className="text-slate-400 font-bold block uppercase text-[10px] tracking-wider">
                    ROOT CAUSE
                  </span>
                  <p className="text-slate-800 font-medium mt-0.5">
                    {analysisResult.rootCause || 'Unknown'}
                  </p>
                </div>

                <div>
                  <span className="text-slate-400 font-bold block uppercase text-[10px] tracking-wider">
                    UNKNOWNS
                  </span>
                  <p className="text-slate-600 mt-0.5 italic text-[11px]">
                    {analysisResult.unknowns.join(', ') || 'Root cause has not been confirmed'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Handover Readiness Card */}
          <Card className="border-slate-300 shadow-2xs">
            <CardContent className="p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase tracking-wider font-bold text-slate-600 block">
                    HANDOVER READINESS
                  </span>
                  <span
                    className={`text-xs font-bold ${
                      analysisResult.readinessScore >= 90 ? 'text-emerald-700' : 'text-amber-800'
                    }`}
                  >
                    {analysisResult.readinessScore >= 90 ? 'READY' : 'NEEDS ATTENTION'}
                  </span>
                </div>
                <span className="text-xl font-bold font-mono text-slate-900">
                  {analysisResult.readinessScore} / 100
                </span>
              </div>

              <Progress value={analysisResult.readinessScore} size="md" />

              {analysisResult.readinessScore >= 90 ? (
                <p className="text-xs text-emerald-800 font-semibold flex items-center gap-1.5 pt-0.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Handover Ready — All critical operational knowledge verified</span>
                </p>
              ) : (
                <p className="text-xs text-amber-800 font-medium flex items-center gap-1.5 pt-0.5">
                  <HelpCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Something important may be missing</span>
                </p>
              )}
            </CardContent>
          </Card>

          {/* GAP DETECTION — WOW MOMENT */}
          {analysisResult.gap.detected && (
            <Card className="border-amber-300 bg-amber-50/70 shadow-xs">
              <CardHeader className="pb-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-950">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>AI FOUND A KNOWLEDGE GAP</span>
                  </div>
                  <Badge variant="warning" size="sm" className="font-mono text-[10px]">
                    MEDIUM SEVERITY
                  </Badge>
                </div>
                <p className="text-xs font-bold text-slate-900 pt-1 leading-snug">
                  "{analysisResult.gap.question}"
                </p>
                {analysisResult.gap.reason && (
                  <p className="text-[11px] text-slate-600 pt-0.5">
                    Reason: {analysisResult.gap.reason}
                  </p>
                )}
              </CardHeader>

              <CardContent className="pt-2">
                <form onSubmit={handleUpdateHandoverWithGap} className="space-y-2.5">
                  <div className="space-y-1">
                    <label
                      htmlFor="gap-answer-input"
                      className="block text-[10px] font-bold uppercase tracking-wider text-slate-600"
                    >
                      ANSWER
                    </label>
                    <TextArea
                      id="gap-answer-input"
                      rows={2}
                      value={gapAnswer}
                      onChange={(e) => setGapAnswer(e.target.value)}
                      className="bg-white text-xs font-medium"
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="secondary"
                    fullWidth
                    size="md"
                    isLoading={isAnswering}
                    leftIcon={<Check className="w-4 h-4" />}
                    className="font-bold bg-amber-600 hover:bg-amber-700 text-white border-amber-700"
                  >
                    Update Handover
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Save & Next Worker Action Buttons */}
          <div className="pt-2 space-y-2">
            <Button
              variant="primary"
              fullWidth
              size="lg"
              leftIcon={<UserCheck className="w-4 h-4" />}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              onClick={() => navigate('/handover/HO-101/next-worker')}
              className="font-bold shadow-xs"
            >
              View for Next Worker
            </Button>

            <Button
              variant="outline"
              fullWidth
              size="sm"
              onClick={() => navigate('/assets/COMP-03')}
              className="text-slate-600 text-xs bg-white"
            >
              Back to Compressor #03
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
