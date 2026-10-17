'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { JudgePreset, DEFAULT_PRESET } from '@/data/presets';
import {
  AnalyzeResponse,
  EventBrief,
  QlooExecutionMode,
  SynthesizedSponsor,
} from '@/lib/types';
import { PresetHero } from '@/components/PresetHero';
import { AgentTracePane } from '@/components/AgentTracePane';
import { SponsorCard } from '@/components/SponsorCard';
import { LlmDiffView } from '@/components/LlmDiffView';
import { RejectedRulesLog } from '@/components/RejectedRulesLog';
import { EvidenceDrawer } from '@/components/EvidenceDrawer';
import {
  Sparkles,
  TrendingUp,
  Scale,
  RefreshCw,
  ShieldAlert,
} from 'lucide-react';

export default function Home() {
  const [activePresetId, setActivePresetId] = useState<string>('brooklyn-warehouse');
  const [currentBrief, setCurrentBrief] = useState<EventBrief>(DEFAULT_PRESET);
  const [analysisData, setAnalysisData] = useState<AnalyzeResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedTab, setSelectedTab] = useState<'sponsors' | 'diff' | 'rejected'>('sponsors');
  const [evidenceSponsor, setEvidenceSponsor] = useState<SynthesizedSponsor | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [, startTransition] = useTransition();

  // Function to execute the analysis pipeline
  const runAnalysis = async (brief: EventBrief, forceRefresh: boolean = false) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brief, forceRefresh }),
      });

      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`);
      }

      const data: AnalyzeResponse = await response.json();
      startTransition(() => {
        setAnalysisData(data);
        setCurrentBrief(data.brief);
      });
    } catch (error) {
      console.error('[Crowdprint Analysis Error]:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load: Run default preset on mount
  useEffect(() => {
    runAnalysis(DEFAULT_PRESET);
  }, []);

  // Preset Selection Handler
  const handleSelectPreset = (preset: JudgePreset) => {
    setActivePresetId(preset.presetId);
    setCurrentBrief(preset);
    runAnalysis(preset);
  };

  // Custom Brief Handler
  const handleCustomBrief = (brief: EventBrief) => {
    setActivePresetId('custom');
    setCurrentBrief(brief);
    runAnalysis(brief, true);
  };

  // Re-run Handler
  const handleRefresh = () => {
    runAnalysis(currentBrief, true);
  };

  // Drawer Handler
  const handleInspectEvidence = (sponsor: SynthesizedSponsor) => {
    setEvidenceSponsor(sponsor);
    setIsDrawerOpen(true);
  };

  const activeMode: QlooExecutionMode = analysisData?.activeMode || 'MOCK_FIXTURE';
  const approvedSponsors = analysisData?.approvedSponsors || [];
  const rejectedSponsors = analysisData?.rejectedSponsors || [];
  const resolvedArtists = analysisData?.resolvedArtists || [];
  const telemetryTraces = analysisData?.telemetryTraces || [];
  const tasteTags = analysisData?.tasteTags || [];
  const plainLlmBaseline = analysisData?.plainLlmBaseline;

  return (
    <div className="min-h-screen bg-[#090A0F] text-[#F3F4F6] flex flex-col font-sans selection:bg-[#10B981]/20 selection:text-[#10B981]">
      {/* Top Header & 3-Preset Zero-Typing Bar */}
      <PresetHero
        activePresetId={activePresetId}
        onSelectPreset={handleSelectPreset}
        onSubmitCustomBrief={handleCustomBrief}
        onRefresh={handleRefresh}
        isLoading={isLoading}
        activeMode={activeMode}
      />

      {/* Main Split-Screen Workspace (Manus.im Pattern) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (4 cols) — Brief Spec & Live Execution Trace */}
          <div className="lg:col-span-4 sticky top-48">
            <AgentTracePane
              brief={currentBrief}
              resolvedArtists={resolvedArtists}
              traces={telemetryTraces}
              tasteTags={tasteTags}
              totalRejectedCount={rejectedSponsors.length}
              jaccardDivergenceScore={plainLlmBaseline?.jaccardDivergenceScore ?? 100}
              executionDurationMs={analysisData?.executionDurationMs ?? 0}
            />
          </div>

          {/* Right Column (8 cols) — Segmented Intelligence Workspace */}
          <div className="lg:col-span-8 space-y-6">
            {/* Segmented Control Tab Bar */}
            <div className="p-1.5 rounded-xl bg-[#11131C] border border-white/[0.08] flex items-center justify-between gap-1">
              <div className="flex items-center gap-1 w-full sm:w-auto">
                {/* Tab 1: Ranked Sponsors */}
                <button
                  onClick={() => setSelectedTab('sponsors')}
                  className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-lg text-xs font-mono font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    selectedTab === 'sponsors'
                      ? 'bg-[#181B26] text-white border border-[#10B981]/40 shadow-sm shadow-[#10B981]/10'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#10B981]" />
                  <span>Ranked Sponsors</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/10 text-slate-300">
                    {approvedSponsors.length}
                  </span>
                </button>

                {/* Tab 2: Side-by-Side Qloo vs Plain LLM */}
                <button
                  onClick={() => setSelectedTab('diff')}
                  className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-lg text-xs font-mono font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    selectedTab === 'diff'
                      ? 'bg-[#181B26] text-white border border-amber-500/40 shadow-sm shadow-amber-500/10'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5 text-[#F59E0B]" />
                  <span>Qloo vs. Plain LLM</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/15 text-amber-400">
                    {plainLlmBaseline?.jaccardDivergenceScore ?? 100}% Diff
                  </span>
                </button>

                {/* Tab 3: Commercial Rule Rejections */}
                <button
                  onClick={() => setSelectedTab('rejected')}
                  className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-lg text-xs font-mono font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    selectedTab === 'rejected'
                      ? 'bg-[#181B26] text-white border border-red-500/40 shadow-sm shadow-red-500/10'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Scale className="w-3.5 h-3.5 text-[#EF4444]" />
                  <span>Rule Rejections</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-red-500/15 text-red-400">
                    {rejectedSponsors.length} Blocked
                  </span>
                </button>
              </div>

              {/* Status Indicator */}
              <div className="hidden sm:flex items-center gap-2 pr-2 text-xs font-mono text-slate-500">
                {isLoading ? (
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    Synthesizing...
                  </span>
                ) : (
                  <span>Verified Qloo Signals</span>
                )}
              </div>
            </div>

            {/* Tab 1 Content: Ranked Sponsors */}
            {selectedTab === 'sponsors' && (
              <div className="space-y-4">
                {isLoading && approvedSponsors.length === 0 ? (
                  <div className="p-12 text-center panel-surface rounded-2xl border border-white/[0.08]">
                    <RefreshCw className="w-6 h-6 animate-spin text-[#10B981] mx-auto mb-3" />
                    <p className="text-sm font-mono text-slate-300">
                      Querying Qloo Taste Graph for correlated brands...
                    </p>
                  </div>
                ) : approvedSponsors.length === 0 ? (
                  <div className="p-12 text-center panel-surface rounded-2xl border border-white/[0.08]">
                    <ShieldAlert className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                    <h3 className="text-base font-bold text-white">No Sponsors Approved</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                      All retrieved candidates were filtered by commercial rules. Check the Rule Rejections tab.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {approvedSponsors.map((sponsor, idx) => (
                      <SponsorCard
                        key={sponsor.entityId}
                        sponsor={sponsor}
                        rank={idx + 1}
                        onInspectEvidence={handleInspectEvidence}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab 2 Content: Side-by-Side Qloo vs Plain LLM */}
            {selectedTab === 'diff' && plainLlmBaseline && (
              <LlmDiffView
                comparison={plainLlmBaseline}
                approvedSponsors={approvedSponsors}
              />
            )}

            {/* Tab 3 Content: Commercial Rule Rejections */}
            {selectedTab === 'rejected' && (
              <RejectedRulesLog rejections={rejectedSponsors} />
            )}
          </div>
        </div>
      </main>

      {/* Slide-Over Evidence Inspector Drawer */}
      <EvidenceDrawer
        sponsor={evidenceSponsor}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        resolvedArtists={resolvedArtists}
      />
    </div>
  );
}
