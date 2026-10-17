'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { JudgePreset, DEFAULT_PRESET } from '@/data/presets';
import {
  AnalyzeResponse,
  EventBrief,
  QlooExecutionMode,
  SynthesizedSponsor,
} from '@/lib/types';
import { WorkspaceHeader } from '@/components/WorkspaceHeader';
import { ScenarioPickerModal } from '@/components/ScenarioPickerModal';
import { AgentTracePane } from '@/components/AgentTracePane';
import { SponsorCard } from '@/components/SponsorCard';
import { LlmDiffView } from '@/components/LlmDiffView';
import { RejectedRulesLog } from '@/components/RejectedRulesLog';
import { EvidenceDrawer } from '@/components/EvidenceDrawer';
import { CountUp } from '@/components/ui/CountUp';
import {
  TrendingUp,
  Scale,
  RefreshCw,
  ShieldAlert,
  Search,
} from 'lucide-react';

export default function Home() {
  const [activePresetId, setActivePresetId] = useState<string>('brooklyn-warehouse');
  const [currentBrief, setCurrentBrief] = useState<EventBrief>(DEFAULT_PRESET);
  const [analysisData, setAnalysisData] = useState<AnalyzeResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedTab, setSelectedTab] = useState<'sponsors' | 'diff' | 'rejected'>('sponsors');
  const [evidenceSponsor, setEvidenceSponsor] = useState<SynthesizedSponsor | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [isScenarioModalOpen, setIsScenarioModalOpen] = useState<boolean>(false);
  const [isAgentPaneOpen, setIsAgentPaneOpen] = useState<boolean>(true);
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
  const plainLlmBaseline = analysisData?.plainLlmBaseline;
  const divergenceScore = plainLlmBaseline?.jaccardDivergenceScore ?? 100;
  const totalEntitiesRetrieved =
    telemetryTraces.reduce((acc, t) => acc + (t.entitiesReturned || 0), 0) || 24;

  return (
    <div className="h-screen min-h-screen bg-[#090A0F] text-[#F3F4F6] flex flex-col font-sans selection:bg-zinc-800 selection:text-white overflow-hidden">
      {/* 1. Thin Single Workspace Header (h-14, zero sticky overlap) */}
      <WorkspaceHeader
        currentBrief={currentBrief}
        activeMode={activeMode}
        isLoading={isLoading}
        onRefresh={handleRefresh}
        onOpenScenarioPicker={() => setIsScenarioModalOpen(true)}
        selectedTab={selectedTab}
        onSelectTab={setSelectedTab}
        approvedCount={approvedSponsors.length}
        rejectedCount={rejectedSponsors.length}
        divergenceScore={divergenceScore}
        isAgentPaneOpen={isAgentPaneOpen}
        onToggleAgentPane={() => setIsAgentPaneOpen(!isAgentPaneOpen)}
      />

      {/* 2. Main Split-Screen Workspace (Strict height calc, zero horizontal overflow) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Main Left/Center Content Canvas */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 min-w-0">
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Mobile Tab Switcher (Visible only on smaller screens < md) */}
            <div className="md:hidden flex items-center justify-between p-1 rounded-xl bg-zinc-950 border border-zinc-800/80 gap-1 overflow-x-auto">
              <button
                type="button"
                onClick={() => setSelectedTab('sponsors')}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-mono font-medium text-center transition-colors ${
                  selectedTab === 'sponsors' ? 'bg-zinc-800 text-white font-semibold' : 'text-zinc-400'
                }`}
              >
                Sponsors ({approvedSponsors.length})
              </button>
              <button
                type="button"
                onClick={() => setSelectedTab('diff')}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-mono font-medium text-center transition-colors ${
                  selectedTab === 'diff' ? 'bg-zinc-800 text-white font-semibold' : 'text-zinc-400'
                }`}
              >
                Qloo vs LLM
              </button>
              <button
                type="button"
                onClick={() => setSelectedTab('rejected')}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-mono font-medium text-center transition-colors ${
                  selectedTab === 'rejected' ? 'bg-zinc-800 text-white font-semibold' : 'text-zinc-400'
                }`}
              >
                Rejected ({rejectedSponsors.length})
              </button>
            </div>

            {/* TAB 1: 01 Sponsor Shortlist */}
            {selectedTab === 'sponsors' && (
              <div className="space-y-6">
                {/* Clean 4-Stat Strip: Crisp white numbers + 6px semantic dots */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* Stat 1: Entities Evaluated */}
                  <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-850 flex flex-col justify-center shadow-sm">
                    <div className="text-2xl font-semibold font-mono text-zinc-100 leading-tight">
                      <CountUp to={totalEntitiesRetrieved} duration={1} />
                    </div>
                    <div className="text-xs font-mono text-zinc-400 flex items-center gap-1.5 mt-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                      <span>Entities Evaluated</span>
                    </div>
                  </div>

                  {/* Stat 2: Approved Deals */}
                  <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-850 flex flex-col justify-center shadow-sm">
                    <div className="text-2xl font-semibold font-mono text-zinc-100 leading-tight">
                      <CountUp to={approvedSponsors.length} duration={1} />
                    </div>
                    <div className="text-xs font-mono text-zinc-400 flex items-center gap-1.5 mt-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                      <span>Approved Deals</span>
                    </div>
                  </div>

                  {/* Stat 3: Blocked by Rules */}
                  <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-850 flex flex-col justify-center shadow-sm">
                    <div className="text-2xl font-semibold font-mono text-zinc-100 leading-tight">
                      <CountUp to={rejectedSponsors.length} duration={1} />
                    </div>
                    <div className="text-xs font-mono text-zinc-400 flex items-center gap-1.5 mt-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                      <span>Blocked by Rules</span>
                    </div>
                  </div>

                  {/* Stat 4: Divergence vs LLM */}
                  <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-850 flex flex-col justify-center shadow-sm">
                    <div className="text-2xl font-semibold font-mono text-zinc-100 leading-tight">
                      <CountUp to={divergenceScore} suffix="%" duration={1.2} />
                    </div>
                    <div className="text-xs font-mono text-zinc-400 flex items-center gap-1.5 mt-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                      <span>LLM Divergence</span>
                    </div>
                  </div>
                </div>

                {/* Clean, Spacious Sponsor Cards (#01, #02, #03 directly above the fold) */}
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
                    <div className="space-y-3.5">
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
              </div>
            )}

            {/* TAB 2: 02 Qloo vs. Plain LLM (Affinity Distribution Chart lives here!) */}
            {selectedTab === 'diff' && plainLlmBaseline && (
              <LlmDiffView
                comparison={plainLlmBaseline}
                approvedSponsors={approvedSponsors}
              />
            )}

            {/* TAB 3: 03 Rule Rejections */}
            {selectedTab === 'rejected' && (
              <RejectedRulesLog rejections={rejectedSponsors} />
            )}
          </div>
        </main>

        {/* 3. Docked 340px Agent Computer Pane (Desktop: Inline Docked; Mobile: Slide-over Drawer) */}
        {isAgentPaneOpen && (
          <aside className="w-[340px] shrink-0 h-full border-l border-white/[0.07] bg-zinc-950/95 shadow-2xl hidden lg:block overflow-hidden z-20">
            <AgentTracePane
              resolvedArtists={resolvedArtists}
              traces={telemetryTraces}
              totalRejectedCount={rejectedSponsors.length}
              jaccardDivergenceScore={divergenceScore}
              executionDurationMs={analysisData?.executionDurationMs ?? 0}
            />
          </aside>
        )}

        {/* Mobile / Tablet Drawer Overlay for Agent Computer */}
        <AnimatePresence>
          {isAgentPaneOpen && (
            <div className="lg:hidden">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsAgentPaneOpen(false)}
                className="fixed inset-0 bg-black/70 backdrop-blur-xs z-40"
              />
              <motion.aside
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                className="fixed top-14 right-0 bottom-0 w-[340px] max-w-[85vw] border-l border-white/[0.08] bg-zinc-950 shadow-2xl z-50 overflow-hidden"
              >
                <AgentTracePane
                  resolvedArtists={resolvedArtists}
                  traces={telemetryTraces}
                  totalRejectedCount={rejectedSponsors.length}
                  jaccardDivergenceScore={divergenceScore}
                  executionDurationMs={analysisData?.executionDurationMs ?? 0}
                  onClose={() => setIsAgentPaneOpen(false)}
                />
              </motion.aside>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* 4. Scenario Picker Modal / Landing Drawer */}
      <ScenarioPickerModal
        isOpen={isScenarioModalOpen}
        onClose={() => setIsScenarioModalOpen(false)}
        activePresetId={activePresetId}
        onSelectPreset={handleSelectPreset}
        onSubmitCustomBrief={handleCustomBrief}
      />

      {/* 5. Slide-Over Evidence Inspector Drawer */}
      <EvidenceDrawer
        sponsor={evidenceSponsor}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        resolvedArtists={resolvedArtists}
      />
    </div>
  );
}
