'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { motion } from 'motion/react';
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
import { BklitAffinityChart } from '@/components/BklitAffinityChart';
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
    <div className="min-h-screen bg-[#090A0F] text-[#F3F4F6] flex flex-col font-sans selection:bg-zinc-800 selection:text-white">
      {/* Top Header & 3-Preset Zero-Typing Bar (Strict max-w-[1400px]) */}
      <PresetHero
        activePresetId={activePresetId}
        onSelectPreset={handleSelectPreset}
        onSubmitCustomBrief={handleCustomBrief}
        onRefresh={handleRefresh}
        isLoading={isLoading}
        activeMode={activeMode}
      />

      {/* Main Split-Screen Workspace (Strict max-w-[1400px], Zero Horizontal Overflow) */}
      <main className="flex-1 max-w-[1400px] w-full mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (4 cols) — Manus.im Agent Computer Sandbox */}
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

          {/* Right Column (8 cols) — High-Craft Artifact & Data Canvas */}
          <div className="lg:col-span-8 space-y-6 min-w-0">
            {/* Real Bklit Composable Affinity Chart at Top of Workspace */}
            {selectedTab === 'sponsors' && approvedSponsors.length > 0 && (
              <BklitAffinityChart
                sponsors={approvedSponsors}
                comparison={plainLlmBaseline}
                title="Qloo Taste Graph Affinity Distribution"
                subtitle="Empirical brand correlation ranking vs. un-grounded plain LLM baseline with crosshair inspection"
              />
            )}

            {/* Segmented Control Tab Bar - Clean Single-Line whitespace-nowrap with motion layoutId */}
            <div className="p-1.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar whitespace-nowrap shadow-sm">
              <div className="flex items-center gap-1 shrink-0">
                {/* Tab 1: Ranked Sponsors */}
                <button
                  type="button"
                  onClick={() => setSelectedTab('sponsors')}
                  className={`relative px-4 py-2 rounded-lg text-xs font-mono font-medium transition-colors whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                    selectedTab === 'sponsors'
                      ? 'text-white font-semibold'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {selectedTab === 'sponsors' && (
                    <motion.div
                      layoutId="activeWorkspaceTabPill"
                      className="absolute inset-0 bg-zinc-900 border border-zinc-700/80 rounded-lg shadow-sm -z-10"
                      transition={{ type: 'spring', bounce: 0.18, duration: 0.4 }}
                    />
                  )}
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Ranked Sponsors</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-zinc-800 text-zinc-300 border border-zinc-700/60">
                    {approvedSponsors.length}
                  </span>
                </button>

                {/* Tab 2: Side-by-Side Qloo vs Plain LLM */}
                <button
                  type="button"
                  onClick={() => setSelectedTab('diff')}
                  className={`relative px-4 py-2 rounded-lg text-xs font-mono font-medium transition-colors whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                    selectedTab === 'diff'
                      ? 'text-white font-semibold'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {selectedTab === 'diff' && (
                    <motion.div
                      layoutId="activeWorkspaceTabPill"
                      className="absolute inset-0 bg-zinc-900 border border-zinc-700/80 rounded-lg shadow-sm -z-10"
                      transition={{ type: 'spring', bounce: 0.18, duration: 0.4 }}
                    />
                  )}
                  <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                  <span>Qloo vs. Plain LLM</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-zinc-800 text-amber-400 border border-zinc-700/60">
                    {plainLlmBaseline?.jaccardDivergenceScore ?? 100}% Diff
                  </span>
                </button>

                {/* Tab 3: Commercial Rule Rejections */}
                <button
                  type="button"
                  onClick={() => setSelectedTab('rejected')}
                  className={`relative px-4 py-2 rounded-lg text-xs font-mono font-medium transition-colors whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                    selectedTab === 'rejected'
                      ? 'text-white font-semibold'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {selectedTab === 'rejected' && (
                    <motion.div
                      layoutId="activeWorkspaceTabPill"
                      className="absolute inset-0 bg-zinc-900 border border-zinc-700/80 rounded-lg shadow-sm -z-10"
                      transition={{ type: 'spring', bounce: 0.18, duration: 0.4 }}
                    />
                  )}
                  <Scale className="w-3.5 h-3.5 text-red-400" />
                  <span>Rule Rejections</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-zinc-800 text-red-400 border border-zinc-700/60">
                    {rejectedSponsors.length} Blocked
                  </span>
                </button>
              </div>

              {/* Status Indicator */}
              <div className="hidden sm:flex items-center gap-2 pr-2 text-xs font-mono text-zinc-500 shrink-0">
                {isLoading ? (
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    Synthesizing...
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-zinc-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Verified Qloo Grounding
                  </span>
                )}
              </div>
            </div>

            {/* Tab 1 Content: Ranked Sponsors */}
            {selectedTab === 'sponsors' && (
              <div className="space-y-4">
                {isLoading && approvedSponsors.length === 0 ? (
                  <div className="p-12 text-center rounded-2xl bg-zinc-950/70 border border-zinc-800">
                    <RefreshCw className="w-6 h-6 animate-spin text-emerald-400 mx-auto mb-3" />
                    <p className="text-sm font-mono text-zinc-300">
                      Querying Qloo Taste Graph for correlated brand entities...
                    </p>
                  </div>
                ) : approvedSponsors.length === 0 ? (
                  <div className="p-12 text-center rounded-2xl bg-zinc-950/70 border border-zinc-800">
                    <ShieldAlert className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                    <h3 className="text-base font-bold text-white">No Sponsors Approved</h3>
                    <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
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
