import { JUDGE_PRESETS } from '../src/data/presets.ts';
import { applyCommercialRules } from '../src/lib/rules.ts';
import { runCrowdprintPipeline } from '../src/lib/agent.ts';

console.log('\n--- 1. Testing Commercial Rules Unit Test ---');

const mockCandidates = [
  { entityId: 'urn:entity:brand:hendricks', name: "Hendrick's Gin", affinityScore: 88, categories: ['Alcohol', 'Hard Liquor'], sharedTags: [], rawQueryUrl: '' },
  { entityId: 'urn:entity:brand:guinness', name: 'Guinness', affinityScore: 86, categories: ['Alcohol', 'Beer'], sharedTags: [], rawQueryUrl: '' },
  { entityId: 'urn:entity:brand:adidas', name: 'Adidas Originals', affinityScore: 92, categories: ['Sportswear', 'Footwear'], sharedTags: [], rawQueryUrl: '' },
  { entityId: 'urn:entity:brand:aiaiai', name: 'AIAIAI Audio', affinityScore: 95, categories: ['Audio Hardware'], sharedTags: [], rawQueryUrl: '' },
  { entityId: 'urn:entity:brand:carhartt', name: 'Carhartt WIP', affinityScore: 91, categories: ['Streetwear'], sharedTags: [], rawQueryUrl: '' },
];

const testConstraints = {
  blockedCategories: ['Alcohol'],
  lockedCompetitors: ['Adidas'],
  ageRestriction: 'ALL_AGES',
};

const filterResult = applyCommercialRules(mockCandidates, testConstraints);

console.log(`Approved Count: ${filterResult.approved.length} (Expected: 2)`);
console.log(`Rejected Count: ${filterResult.rejected.length} (Expected: 3)`);

for (const rej of filterResult.rejected) {
  console.log(`  Blocked: ${rej.brand.name} | Reason: ${rej.reasonCode} | ${rej.explanation}`);
}

const hendricksRejected = filterResult.rejected.some((r) => r.brand.name.includes("Hendrick's"));
const guinnessRejected = filterResult.rejected.some((r) => r.brand.name.includes('Guinness'));
const adidasRejected = filterResult.rejected.some((r) => r.brand.name.includes('Adidas'));

if (hendricksRejected && guinnessRejected && adidasRejected && filterResult.approved.length === 2) {
  console.log('✓ Commercial Rules Test PASSED (100% compliance)\n');
} else {
  console.error('✗ Commercial Rules Test FAILED\n');
  process.exit(1);
}

console.log('--- 2. Testing End-to-End Agent Pipeline Across All 3 Presets ---');

for (const preset of JUDGE_PRESETS) {
  console.log(`\nTesting Preset: ${preset.name} (${preset.presetId})`);
  const response = await runCrowdprintPipeline(preset);

  console.log(`  • Resolved Artists   : ${response.resolvedArtists.length} (${response.resolvedArtists.map((a) => a.resolvedName).join(', ')})`);
  console.log(`  • Approved Sponsors  : ${response.approvedSponsors.length} (Top: ${response.approvedSponsors[0]?.name} @ ${response.approvedSponsors[0]?.affinityScore}%)`);
  console.log(`  • Rejected Sponsors  : ${response.rejectedSponsors.length} (${response.rejectedSponsors.map((r) => r.brand.name).join(', ')})`);
  console.log(`  • Divergence vs LLM  : ${response.plainLlmBaseline.jaccardDivergenceScore}% Jaccard Divergence`);
  console.log(`  • Telemetry Traces   : ${response.telemetryTraces.length} calls (Mode: ${response.activeMode})`);
  console.log(`  • Execution Latency  : ${response.executionDurationMs}ms`);

  // Assertions
  if (response.approvedSponsors.length === 0) {
    throw new Error(`Preset ${preset.presetId} returned 0 approved sponsors`);
  }
  if (response.rejectedSponsors.length === 0) {
    throw new Error(`Preset ${preset.presetId} expected commercial rejections but got 0`);
  }
  if (!response.approvedSponsors[0].activations || response.approvedSponsors[0].activations.length < 2) {
    throw new Error(`Preset ${preset.presetId} top sponsor missing activations`);
  }
  console.log(`  ✓ Activations cited signal: "${response.approvedSponsors[0].activations[0].qlooSignalCited}"`);
}

console.log('\n============================================================');
console.log('✓ ALL PHASE 1 & 2 BACKEND PIPELINE VERIFICATIONS PASSED');
console.log('============================================================\n');
