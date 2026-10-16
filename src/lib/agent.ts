import { DEFAULT_PRESET, getPresetById } from '../data/presets';
import { generatePlainLlmBaseline, synthesizeActivationsAndPitch } from './llm';
import { fetchBrandAffinities, resolveLineup } from './qloo';
import { applyCommercialRules } from './rules';
import {
  AnalyzeResponse,
  EventBrief,
  QlooCallTrace,
  QlooExecutionMode,
} from './types';

/**
 * Crowdprint Autonomous Sponsorship Strategist Agent Pipeline
 * Deterministic, inspectable 5-step pipeline:
 * 1. Resolve Lineup -> Qloo Entity URNs
 * 2. Parallel: Qloo Brand/Tag Insights + Plain-LLM Baseline
 * 3. Deterministic Commercial Rules Filtering (zero LLM hallucination)
 * 4. Grounded Activation & Pitch Synthesis (strict Qloo signal attribution)
 * 5. Telemetry collation & response packaging
 *
 * Specification: docs/AGENTS.md, docs/PRODUCT_REQUIREMENTS.md
 */

export interface RunPipelineOptions {
  forceRefresh?: boolean;
}

export async function runCrowdprintPipeline(
  inputBrief?: Partial<EventBrief>,
  options?: RunPipelineOptions
): Promise<AnalyzeResponse> {
  const startTime = Date.now();

  // 1. Resolve Brief (defaulting to Brooklyn Warehouse Preset if empty)
  let brief: EventBrief;
  if (inputBrief?.presetId) {
    const preset = getPresetById(inputBrief.presetId);
    brief = preset ? { ...preset, ...inputBrief } : { ...DEFAULT_PRESET, ...inputBrief };
  } else if (inputBrief?.lineup && inputBrief.lineup.length > 0) {
    brief = {
      name: inputBrief.name || 'Custom Live Event Showcase',
      tagline: inputBrief.tagline || 'Custom Lineup Sponsorship Curation',
      lineup: inputBrief.lineup,
      city: inputBrief.city || 'New York City, NY',
      venueName: inputBrief.venueName || 'Main Event Hall',
      expectedAttendance: inputBrief.expectedAttendance || 3000,
      constraints: {
        minBudgetTier: inputBrief.constraints?.minBudgetTier ?? 50000,
        blockedCategories: inputBrief.constraints?.blockedCategories || [],
        lockedCompetitors: inputBrief.constraints?.lockedCompetitors || [],
        ageRestriction: inputBrief.constraints?.ageRestriction || 'ALL_AGES',
        ecoConsciousOnly: inputBrief.constraints?.ecoConsciousOnly ?? false,
      },
      presetId: 'custom',
    };
  } else {
    brief = { ...DEFAULT_PRESET };
  }

  const allTraces: QlooCallTrace[] = [];

  // ==========================================
  // STEP 1: Resolve Lineup Artists (Parallel)
  // ==========================================
  const { resolved: resolvedArtists, traces: resolveTraces } = await resolveLineup(
    brief.lineup,
    { forceRefresh: options?.forceRefresh }
  );
  allTraces.push(...resolveTraces);

  const seedEntityIds = resolvedArtists.map((a) => a.entityId);

  // ==========================================
  // STEP 2: Parallel Intelligence Gathering
  // A. Qloo Brand Affinities & Taste Tags
  // ==========================================
  const qlooData = await fetchBrandAffinities(
    seedEntityIds,
    brief.city,
    brief.presetId,
    { forceRefresh: options?.forceRefresh }
  );

  allTraces.push(...qlooData.traces);
  const { candidates: rawCandidates, tags: tasteTags } = qlooData;

  // Recompute precise Jaccard divergence with actual Qloo brand candidates
  const finalBaseline = await generatePlainLlmBaseline(brief, rawCandidates);

  // ==========================================
  // STEP 3: Deterministic Commercial Rules
  // ==========================================
  const { approved: approvedCandidates, rejected: rejectedSponsors } = applyCommercialRules(
    rawCandidates,
    brief.constraints
  );

  // ==========================================
  // STEP 4: Grounded Activation & Pitch Synthesis
  // Generate on-site activations for top approved sponsors
  // ==========================================
  const topSponsorsToSynthesize = approvedCandidates.slice(0, 5);
  const synthesizedApproved = await synthesizeActivationsAndPitch(
    brief,
    topSponsorsToSynthesize,
    tasteTags
  );

  // Append remaining approved sponsors without heavy activations if any
  const remainingApproved = approvedCandidates.slice(5).map((brand) => ({
    ...brand,
    activations: [],
    pitchEmail: {
      sponsorName: brand.name,
      targetPersona: 'Head of Brand Partnerships',
      subjectLine: `Sponsorship Proposal: ${brand.name} at ${brief.name}`,
      valueProposition: `${brand.affinityScore}% empirical Qloo audience affinity overlap.`,
      emailBody: `Sponsorship opportunity for ${brand.name} based on verified ${brand.affinityScore}% audience overlap.`,
    },
  }));

  const allApprovedSponsors = [...synthesizedApproved, ...remainingApproved];

  // ==========================================
  // STEP 5: Final Packaging & Telemetry
  // ==========================================
  const executionDurationMs = Date.now() - startTime;

  // Determine aggregate active mode
  const activeMode: QlooExecutionMode = allTraces.some((t) => t.mode === 'LIVE_QLOO')
    ? 'LIVE_QLOO'
    : allTraces.some((t) => t.mode === 'CACHED_QLOO')
    ? 'CACHED_QLOO'
    : 'MOCK_FIXTURE';

  return {
    brief,
    resolvedArtists,
    approvedSponsors: allApprovedSponsors,
    rejectedSponsors,
    plainLlmBaseline: finalBaseline,
    tasteTags,
    telemetryTraces: allTraces,
    activeMode,
    executionDurationMs,
    timestamp: new Date().toISOString(),
  };
}
