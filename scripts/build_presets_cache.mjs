#!/usr/bin/env node

/**
 * Crowdprint — Regenerate src/data/presets_cache.json from the LIVE Qloo API.
 *
 * Usage:
 *   node --env-file=.env.local scripts/build_presets_cache.mjs
 *
 * Guarantees:
 *   - Never writes mock data: aborts (exit 1) without touching the cache if the key is missing,
 *     any artist fails to resolve, or any preset returns < 8 brands.
 *   - Never logs or persists QLOO_API_KEY (it is only sent as the X-Api-Key header).
 */

import { writeFileSync } from 'fs';
import { resolve } from 'path';
import { JUDGE_PRESETS } from '../src/data/presets.ts';
import {
  buildBrandInsightsPath,
  buildPlaceInsightsPath,
  buildSearchPath,
  buildTagInsightsPath,
  extractInsightEntities,
  extractInsightTags,
  extractSearchResults,
  pickArtistMatch,
  toAnchorVenue,
  toBrandCandidate,
  toResolvedArtist,
  toTasteTags,
} from '../src/lib/qloo_parse.ts';

const API_KEY = process.env.QLOO_API_KEY || '';
const API_URL = (process.env.QLOO_API_URL || 'https://hackathon.api.qloo.com').replace(/\/$/, '');
const OUT_PATH = resolve(process.cwd(), 'src/data/presets_cache.json');
const MIN_BRANDS = 8;

if (!API_KEY || API_KEY === 'pending_key' || API_KEY.includes('paste_your')) {
  console.error('✗ QLOO_API_KEY is not set. Run with: node --env-file=.env.local scripts/build_presets_cache.mjs');
  process.exit(1);
}

async function qloo(path) {
  const started = Date.now();
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'X-Api-Key': API_KEY, Accept: 'application/json' },
  });
  const json = res.ok ? await res.json().catch(() => ({})) : {};
  return { status: res.status, latencyMs: Date.now() - started, json, url: `${API_URL}${path}` };
}

async function buildPreset(preset) {
  console.log(`\n▶ ${preset.presetId} (${preset.city})`);
  const calls = [];

  // 1. Resolve lineup
  const resolvedArtists = [];
  for (const name of preset.lineup) {
    const r = await qloo(buildSearchPath(name, 'urn:entity:artist', 3));
    const results = extractSearchResults(r.json);
    const match = pickArtistMatch(results, name);
    calls.push({ endpoint: '/search', query: name, status: r.status, latencyMs: r.latencyMs, entitiesReturned: results.length });

    if (r.status !== 200 || !match) throw new Error(`"${name}" did not resolve (status ${r.status})`);
    const artist = toResolvedArtist(name, match);
    if (!artist.verified) throw new Error(`"${name}" resolved ambiguously to "${artist.resolvedName}"`);
    resolvedArtists.push(artist);
    console.log(`  ✓ ${name} -> ${artist.resolvedName} (${artist.entityId})`);
  }
  const seeds = resolvedArtists.map((a) => a.entityId);

  // 2. Brand + tag + local place insights
  const neighborhood = {
    'brooklyn-warehouse': 'Williamsburg, Brooklyn',
    'silver-lake-indie': 'Silver Lake, Los Angeles',
    'hackney-jazz': 'Hackney, London',
  }[preset.presetId] || preset.city;

  const [brandsR, tagsR, placesR] = await Promise.all([
    qloo(buildBrandInsightsPath(seeds, { city: preset.city, take: 20 })),
    qloo(buildTagInsightsPath(seeds, 10)),
    qloo(buildPlaceInsightsPath(neighborhood, 5)),
  ]);
  const tags = toTasteTags(extractInsightTags(tagsR.json));
  const brandCandidates = extractInsightEntities(brandsR.json)
    .filter((b) => b.entity_id)
    .map((b) => toBrandCandidate(b, { rawQueryUrl: brandsR.url, fallbackTags: tags }));

  const anchorVenues = extractInsightEntities(placesR.json)
    .filter((p) => p.entity_id)
    .map((p) => toAnchorVenue(p, neighborhood));

  calls.push(
    { endpoint: '/v2/insights', filterType: 'urn:entity:brand', status: brandsR.status, latencyMs: brandsR.latencyMs, entitiesReturned: brandCandidates.length },
    { endpoint: '/v2/insights', filterType: 'urn:tag', status: tagsR.status, latencyMs: tagsR.latencyMs, entitiesReturned: tags.length },
    { endpoint: '/v2/insights', filterType: 'urn:entity:place', status: placesR.status, latencyMs: placesR.latencyMs, entitiesReturned: anchorVenues.length }
  );

  if (brandsR.status !== 200 || brandCandidates.length < MIN_BRANDS) {
    throw new Error(`brand insights returned ${brandCandidates.length} brands (status ${brandsR.status})`);
  }
  console.log(`  ✓ ${brandCandidates.length} brands: ${brandCandidates.slice(0, 6).map((b) => `${b.name} (${b.affinityScore})`).join(', ')} …`);
  console.log(`  ✓ ${tags.length} tags: ${tags.join(', ')}`);
  console.log(`  ✓ ${anchorVenues.length} anchor venues [${neighborhood}]: ${anchorVenues.map((v) => v.name).join(', ')}`);

  return {
    presetId: preset.presetId,
    city: preset.city,
    neighborhood,
    lineup: preset.lineup,
    resolvedSeedIds: seeds,
    topBrandEntities: brandCandidates.slice(0, 10).map((b) => b.entityId),
    resolvedArtists,
    brandCandidates,
    tags,
    anchorVenues,
    queries: { brands: brandsR.url, tags: tagsR.url, places: placesR.url },
    calls,
  };
}

const presets = {};
try {
  for (const preset of JUDGE_PRESETS) {
    presets[preset.presetId] = await buildPreset(preset);
  }
} catch (err) {
  console.error(`\n✗ Aborting — cache NOT written: ${err.message}`);
  process.exit(1);
}

const cache = {
  version: '2.0.0',
  source: 'LIVE_QLOO',
  apiUrl: API_URL,
  updatedAt: new Date().toISOString(),
  presets,
};

writeFileSync(OUT_PATH, JSON.stringify(cache, null, 2) + '\n', 'utf8');
console.log(`\n✓ Wrote ${OUT_PATH} (${Object.keys(presets).length} presets, 100% live Qloo responses)`);
