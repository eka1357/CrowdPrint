'use client';

import React, { useState, useEffect, useTransition, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { JudgePreset, DEFAULT_PRESET } from '@/data/presets';
import {
  AnalyzeResponse,
  EventBrief,
  QlooExecutionMode,
  SynthesizedSponsor,
  QlooBrandCandidate,
  CommercialConstraints,
} from '@/lib/types';
import { applyCommercialRules } from '@/lib/rules';
import { WorkspaceHeader } from '@/components/WorkspaceHeader';
import { ScenarioPickerModal } from '@/components/ScenarioPickerModal';
import { AgentTracePane } from '@/components/AgentTracePane';
import { SponsorCard } from '@/components/SponsorCard';
import { LlmDiffView } from '@/components/LlmDiffView';
import { RejectedRulesLog } from '@/components/RejectedRulesLog';
import { EvidenceDrawer } from '@/components/EvidenceDrawer';
import { ActiveGuardrailsBar } from '@/components/ActiveGuardrailsBar';
import { ExportDossierModal } from '@/components/ExportDossierModal';
import { CountUp } from '@/components/ui/CountUp';
import {
  RefreshCw,
  ShieldAlert,
  FileText,
} from 'lucide-react';

export default function Home() {
  const [activePresetId, setActivePresetId] = useState<string>('brooklyn-warehouse');
  const [currentBrief, setCurrentBrief] = useState<EventBrief>(DEFAULT_PRESET);
  const [activeConstraints, setActiveConstraints] = useState<CommercialConstraints>(DEFAULT_PRESET.constraints);
  const [analysisData, setAnalysisData] = useState<AnalyzeResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedTab, setSelectedTab] = useState<'sponsors' | 'diff' | 'rejected'>('sponsors');
  const [evidenceSponsor, setEvidenceSponsor] = useState<SynthesizedSponsor | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [isScenarioModalOpen, setIsScenarioModalOpen] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
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
        setActiveConstraints(data.brief.constraints);
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
    setActiveConstraints(preset.constraints);
    runAnalysis(preset);
  };

  // Custom Brief Handler
  const handleCustomBrief = (brief: EventBrief) => {
    setActivePresetId('custom');
    setCurrentBrief(brief);
    setActiveConstraints(brief.constraints);
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

  // Reset Constraints to Brief Baseline
  const handleResetConstraints = () => {
    setActiveConstraints(currentBrief.constraints);
  };

  // -------------------------------------------------------------
  // DYNAMIC "WHAT-IF" RULE ENGINE (Evaluates in <10ms client-side)
  // -------------------------------------------------------------
  const candidatePool: QlooBrandCandidate[] = useMemo(() => {
    if (analysisData?.allEvaluatedBrands && analysisData.allEvaluatedBrands.length > 0) {
      return analysisData.allEvaluatedBrands;
    }
    const existingApproved = analysisData?.approvedSponsors || [];
    const existingRejected = (analysisData?.rejectedSponsors || []).map((r) => r.brand);
    const map = new Map<string, QlooBrandCandidate>();
    for (const b of [...existingApproved, ...existingRejected]) {
      map.set(b.entityId, b);
    }
    return Array.from(map.values());
  }, [analysisData]);

  const synthesizedMap = useMemo(() => {
    const map = new Map<string, SynthesizedSponsor>();
    for (const s of analysisData?.approvedSponsors || []) {
      map.set(s.entityId, s);
      map.set(s.name.toLowerCase(), s);
    }
    return map;
  }, [analysisData?.approvedSponsors]);

  const { currentApproved, currentRejected } = useMemo(() => {
    if (candidatePool.length === 0) {
      return {
        currentApproved: analysisData?.approvedSponsors || [],
        currentRejected: analysisData?.rejectedSponsors || [],
      };
    }

    const { approved, rejected } = applyCommercialRules(candidatePool, activeConstraints);

    const formattedApproved: SynthesizedSponsor[] = approved.map((cand) => {
      const existing = synthesizedMap.get(cand.entityId) || synthesizedMap.get(cand.name.toLowerCase());
      if (existing) {
        return {
          ...cand,
          activations: existing.activations,
          pitchEmail: existing.pitchEmail,
          evidenceNotes: existing.evidenceNotes,
        };
      }

      // Dynamic synthesis for newly unlocked brand candidates
      const tags = analysisData?.tasteTags || ['Live Music', 'Experiential'];
      const slug = cand.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      return {
        ...cand,
        activations: [
          {
            id: `act-1-${slug}`,
            title: `${cand.name} Immersive Brand Footprint`,
            qlooSignalCited: tags[0] || 'Empirical Audience Affinity',
            creativeExtension: `Interactive festival installation grounded in audience taste profile (${tags.slice(0, 2).join(' & ')}).`,
            suggestedZone: 'Main Promenade / Central Hangar',
            estimatedReach: '1,500+ daily visitors',
          },
          {
            id: `act-2-${slug}`,
            title: `${cand.name} VIP Lounge Integration`,
            qlooSignalCited: tags[1] || 'Cultural Tastemaker Overlap',
            creativeExtension: `Curated VIP lounge footprint with product showcase and hospitality credentials.`,
            suggestedZone: 'Backstage / VIP Mezzanine',
            estimatedReach: '400 VIPs',
          },
        ],
        pitchEmail: {
          sponsorName: cand.name,
          targetPersona: 'Head of Experiential & Brand Partnerships',
          subjectLine: `Partnership Proposal: ${cand.name} x ${currentBrief.name}`,
          valueProposition: `${cand.affinityScore}% empirical Qloo audience affinity overlap with festival lineup.`,
          emailBody: `Hi team,\n\nOur audience intelligence engine (powered by Qloo's Taste Graph) identified a ${cand.affinityScore}% empirical affinity overlap between ${cand.name} and the audience for ${currentBrief.name} in ${currentBrief.city}.\n\nGiven the strong cultural correlation with fans of ${currentBrief.lineup.slice(0, 3).join(', ')}, we would love to propose a custom activation footprint.\n\nBest regards,\nPartnerships Team`,
        },
      };
    });

    return {
      currentApproved: formattedApproved,
      currentRejected: rejected,
    };
  }, [candidatePool, activeConstraints, synthesizedMap, analysisData?.tasteTags, analysisData?.approvedSponsors, analysisData?.rejectedSponsors, currentBrief]);

  const isConstraintsModified = useMemo(() => {
    const initial = currentBrief.constraints;
    const initialLocked = (initial.lockedCompetitors || []).slice().sort().join(',');
    const currLocked = (activeConstraints.lockedCompetitors || []).slice().sort().join(',');
    if (initialLocked !== currLocked) return true;

    const initialBlocked = (initial.blockedCategories || []).slice().sort().join(',');
    const currBlocked = (activeConstraints.blockedCategories || []).slice().sort().join(',');
    if (initialBlocked !== currBlocked) return true;

    if (Boolean(initial.ecoConsciousOnly) !== Boolean(activeConstraints.ecoConsciousOnly)) return true;
    if ((initial.minBudgetTier || 0) !== (activeConstraints.minBudgetTier || 0)) return true;

    return false;
  }, [currentBrief.constraints, activeConstraints]);

  const activeMode: QlooExecutionMode = analysisData?.activeMode || 'MOCK_FIXTURE';
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
        onOpenExportDossier={() => setIsExportModalOpen(true)}
        selectedTab={selectedTab}
        onSelectTab={setSelectedTab}
        approvedCount={currentApproved.length}
        rejectedCount={currentRejected.length}
        divergenceScore={divergenceScore}
        isAgentPaneOpen={isAgentPaneOpen}
        onToggleAgentPane={() => setIsAgentPaneOpen(!isAgentPaneOpen)}
      />

      {/* 2. Main Split-Screen Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Main Content Canvas */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 min-w-0">
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Mobile Tab Switcher */}
            <div className="md:hidden flex items-center justify-between p-1 rounded-xl bg-zinc-950 border border-zinc-800/80 gap-1 overflow-x-auto">
              <button
                type="button"
                onClick={() => setSelectedTab('sponsors')}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-mono font-medium text-center transition-colors ${
                  selectedTab === 'sponsors' ? 'bg-zinc-800 text-white font-semibold' : 'text-zinc-400'
                }`}
              >
                Sponsors ({currentApproved.length})
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
                Rejected ({currentRejected.length})
              </button>
            </div>

            {/* TAB 1: 01 Sponsor Shortlist */}
            {selectedTab === 'sponsors' && (
              <div className="space-y-6">
                {/* 4-Stat Strip: Crisp numbers + semantic dots */}
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
                      <CountUp to={currentApproved.length} duration={0.6} />
                    </div>
                    <div className="text-xs font-mono text-zinc-400 flex items-center gap-1.5 mt-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                      <span>Approved Deals</span>
                    </div>
                  </div>

                  {/* Stat 3: Blocked by Rules */}
                  <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-850 flex flex-col justify-center shadow-sm">
                    <div className="text-2xl font-semibold font-mono text-zinc-100 leading-tight">
                      <CountUp to={currentRejected.length} duration={0.6} />
                    </div>
                    <div className="text-xs font-mono text-zinc-400 flex items-center gap-1.5 mt-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                      <span>Blocked by Rules</span>
                    </div>
                  </div>

                  {/* Stat 4: Divergence vs LLM */}
                  <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-850 flex flex-col justify-center shadow-sm">
                    <div className="text-2xl font-semibold font-mono text-zinc-100 leading-tight">
                      <CountUp to={divergenceScore} suffix="%" duration={1} />
                    </div>
                    <div className="text-xs font-mono text-zinc-400 flex items-center gap-1.5 mt-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                      <span>LLM Divergence</span>
                    </div>
                  </div>
                </div>

                {/* Interactive "What-If" Commercial Guardrails Bar */}
                <ActiveGuardrailsBar
                  constraints={activeConstraints}
                  initialConstraints={currentBrief.constraints}
                  onUpdateConstraints={setActiveConstraints}
                  onResetConstraints={handleResetConstraints}
                  isModified={isConstraintsModified}
                  approvedCount={currentApproved.length}
                  rejectedCount={currentRejected.length}
                />

                {/* Sponsor Shortlist Section Header with 1-Click Export Dossier Button */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div>
                    <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-zinc-100 flex items-center gap-2">
                      <span>Approved Brand Partnerships</span>
                      <span className="text-xs font-normal text-zinc-400">
                        ({currentApproved.length} qualified)
                      </span>
                    </h3>
                    <p className="text-xs text-zinc-400 font-mono mt-0.5">
                      Empirically correlated via Qloo Taste Graph • Enforcing deterministic compliance
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsExportModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-850 text-xs font-mono text-zinc-200 hover:text-white border border-zinc-750 hover:border-emerald-500/50 transition-all cursor-pointer shadow-xs shrink-0"
                    title="Export complete sponsorship memorandum as PDF / Markdown"
                  >
                    <FileText className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Export Dossier</span>
                  </button>
                </div>

                {/* Sponsor Cards List */}
                <div className="space-y-4">
                  {isLoading && currentApproved.length === 0 ? (
                    <div className="p-12 text-center rounded-2xl bg-zinc-950/70 border border-zinc-800">
                      <RefreshCw className="w-6 h-6 animate-spin text-emerald-400 mx-auto mb-3" />
                      <p className="text-sm font-mono text-zinc-300">
                        Querying Qloo Taste Graph for correlated brand entities...
                      </p>
                    </div>
                  ) : currentApproved.length === 0 ? (
                    <div className="p-12 text-center rounded-2xl bg-zinc-950/70 border border-zinc-800">
                      <ShieldAlert className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                      <h3 className="text-base font-bold text-white">No Sponsors Approved Under Active Guardrails</h3>
                      <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
                        All retrieved brand candidates were intercepted. Use the guardrails bar above to test disabling a constraint or view the Rejections tab.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3.5">
                      {currentApproved.map((sponsor, idx) => (
                        <SponsorCard
                          key={sponsor.entityId}
                          sponsor={sponsor}
                          rank={idx + 1}
                          onInspectEvidence={handleInspectEvidence}
                          anchorVenues={analysisData?.anchorVenues}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: 02 Qloo vs. Plain LLM */}
            {selectedTab === 'diff' && plainLlmBaseline && (
              <LlmDiffView
                comparison={plainLlmBaseline}
                approvedSponsors={currentApproved}
              />
            )}

            {/* TAB 3: 03 Rule Rejections */}
            {selectedTab === 'rejected' && (
              <div className="space-y-4">
                {/* Interactive Guardrails Bar on Rejections Tab */}
                <ActiveGuardrailsBar
                  constraints={activeConstraints}
                  initialConstraints={currentBrief.constraints}
                  onUpdateConstraints={setActiveConstraints}
                  onResetConstraints={handleResetConstraints}
                  isModified={isConstraintsModified}
                  approvedCount={currentApproved.length}
                  rejectedCount={currentRejected.length}
                />

                <RejectedRulesLog rejections={currentRejected} />
              </div>
            )}
          </div>
        </main>

        {/* 3. Docked 340px Agent Computer Pane */}
        {isAgentPaneOpen && (
          <aside className="w-[340px] shrink-0 h-full border-l border-white/[0.07] bg-zinc-950/95 shadow-2xl hidden lg:block overflow-hidden z-20">
            <AgentTracePane
              resolvedArtists={resolvedArtists}
              traces={telemetryTraces}
              totalRejectedCount={currentRejected.length}
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
                  totalRejectedCount={currentRejected.length}
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
        anchorVenues={analysisData?.anchorVenues}
      />

      {/* 6. Executive Sponsorship Dossier Modal */}
      <ExportDossierModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        brief={currentBrief}
        resolvedArtists={resolvedArtists}
        approvedSponsors={currentApproved}
        rejectedSponsors={currentRejected}
        anchorVenues={analysisData?.anchorVenues}
        tasteTags={analysisData?.tasteTags || []}
      />
    </div>
  );
}
