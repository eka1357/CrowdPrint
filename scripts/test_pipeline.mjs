// Test pipeline execution with presets_cache.json and live re-run
import { resolve } from 'path';
import { runCrowdprintPipeline } from '../src/lib/agent.ts';

console.log('Testing Pipeline with Preset 1 (Cached)...');
const cachedRes = await runCrowdprintPipeline({ presetId: 'brooklyn-warehouse' });
console.log('Active Mode:', cachedRes.activeMode);
console.log('Resolved Artists:', cachedRes.resolvedArtists.map(a => `${a.resolvedName} [${a.entityId}]`));
console.log('Top Approved Sponsors:');
for (const s of cachedRes.approvedSponsors.slice(0, 5)) {
  console.log(`  ✓ ${s.name} (${s.affinityScore}%) [${s.entityId}] - Categories: ${s.categories.join(', ')}`);
}
console.log('Rejected Sponsors:');
for (const r of cachedRes.rejectedSponsors) {
  console.log(`  ✗ ${r.brand.name} [${r.brand.entityId}] - Reason: ${r.reasonCode} (${r.explanation})`);
}
console.log('Anchor Venues:', (cachedRes.anchorVenues || []).map(v => `${v.name} [${v.entityId.slice(0,8)}]`));
console.log('Traces count:', cachedRes.telemetryTraces.length, 'Modes:', [...new Set(cachedRes.telemetryTraces.map(t => t.mode))]);

console.log('\nTesting Pipeline with Preset 2 (Silver Lake)...');
const slRes = await runCrowdprintPipeline({ presetId: 'silver-lake-indie' });
console.log('Active Mode:', slRes.activeMode);
console.log('Top Approved Sponsors:', slRes.approvedSponsors.slice(0, 4).map(s => `${s.name} (${s.affinityScore}%)`));
console.log('Rejected Sponsors:');
for (const r of slRes.rejectedSponsors) {
  console.log(`  ✗ ${r.brand.name} [${r.brand.entityId}] - Reason: ${r.reasonCode} (${r.explanation})`);
}

console.log('\nTesting Pipeline with Preset 3 (Hackney Jazz)...');
const hjRes = await runCrowdprintPipeline({ presetId: 'hackney-jazz' });
console.log('Active Mode:', hjRes.activeMode);
console.log('Top Approved Sponsors:', hjRes.approvedSponsors.slice(0, 4).map(s => `${s.name} (${s.affinityScore}%)`));
console.log('Rejected Sponsors:');
for (const r of hjRes.rejectedSponsors) {
  console.log(`  ✗ ${r.brand.name} [${r.brand.entityId}] - Reason: ${r.reasonCode} (${r.explanation})`);
}
