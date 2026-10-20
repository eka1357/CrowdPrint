#!/usr/bin/env node

/**
 * Crowdprint — Phase 1: 48-Hour Live Qloo API Feasibility Gate
 * Specification: docs/TESTING.md, ANTIGRAVITY.md
 *
 * Usage:
 *   node --env-file=.env.local scripts/gate_test.mjs
 *   node scripts/gate_test.mjs --mock   (for dry/mock simulation while waiting for key)
 */

import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import {
  buildBrandInsightsPath,
  buildPlaceInsightsPath,
  buildSearchPath,
  extractInsightEntities,
  extractSearchResults,
  normalizeName,
  pickArtistMatch,
} from '../src/lib/qloo_parse.ts';

// Attempt to load .env.local manually if node was invoked without --env-file
if (existsSync(resolve(process.cwd(), '.env.local'))) {
  try {
    const envContent = readFileSync(resolve(process.cwd(), '.env.local'), 'utf8');
    for (const line of envContent.split('\n')) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx > 0) {
          const key = trimmed.slice(0, eqIdx).trim();
          const val = trimmed.slice(eqIdx + 1).trim();
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      }
    }
  } catch {
    // Ignore error
  }
}

const API_KEY = process.env.QLOO_API_KEY || '';
const API_URL = (process.env.QLOO_API_URL || 'https://hackathon.api.qloo.com').replace(/\/$/, '');
const isDryMock = process.argv.includes('--mock') || API_KEY === 'pending_key' || !API_KEY;

const LINEUPS = {
  NYC: {
    city: 'New York City, NY',
    artists: ['Fred again..', 'Four Tet', 'Peggy Gou', 'Overmono'],
  },
  LA: {
    city: 'Los Angeles, CA',
    artists: ['Khruangbin', 'Steve Lacy', 'Clairo', 'Men I Trust'],
  },
  London: {
    city: 'London, UK',
    artists: ['Ezra Collective', 'Little Simz', 'Yussef Dayes'],
  },
};

const GENERIC_LLM_BRANDS = new Set([
  'red bull',
  'heineken',
  'spotify',
  'nike',
  'vans',
  'monster energy',
  'uber',
  'bose',
  'dr. martens',
  'urban outfitters',
  'jameson',
  'apple music',
]);

console.log('\n============================================================');
console.log('   CROWDPRINT: PHASE 1 API FEASIBILITY GATE TEST           ');
console.log('============================================================');
console.log(`Target URL : ${API_URL}`);
console.log(`API Key    : ${API_KEY ? (isDryMock ? 'PENDING / MOCK SIMULATION' : API_KEY.slice(0, 6) + '...' + API_KEY.slice(-4)) : 'NONE DETECTED'}`);
console.log(`Mode       : ${isDryMock ? 'SIMULATED GATE TEST (--mock or pending key)' : 'LIVE QLOO ENDPOINT TEST'}`);
console.log('------------------------------------------------------------\n');

async function callQloo(path) {
  if (isDryMock) {
    // Simulated response for dry gate testing — mirrors the real live Qloo payload shapes
    await new Promise((r) => setTimeout(r, 45));
    const mockId = (s) => `MOCK-${s.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12)}`;
    if (path.startsWith('/search')) {
      const q = new URLSearchParams(path.split('?')[1]).get('query') || 'artist';
      return {
        status: 200,
        data: {
          results: [{ name: q, entity_id: mockId(q), types: ['urn:entity:artist'], popularity: 0.98, tags: [] }],
        },
      };
    }
    if (path.includes('/v2/insights') && path.includes('urn:entity:brand')) {
      const names = ['AIAIAI Audio', 'Teenage Engineering', 'Carhartt WIP', 'Liquid Death', 'Nothing Tech', 'Aesop', 'Sonos', 'Minor Figures', 'Marshall Amplification', 'NTS Radio Store'];
      return {
        status: 200,
        data: {
          success: true,
          results: {
            entities: names.map((name, i) => ({ name, entity_id: mockId(name), subtype: 'urn:entity:brand', query: { affinity: 0.96 - i * 0.015 } })),
          },
        },
      };
    }
    if (path.includes('/v2/insights') && path.includes('urn:entity:place')) {
      const isWilliamsburg = path.includes('Williamsburg');
      const names = isWilliamsburg ? ['Public Records', 'Elsewhere', 'Nowadays'] : ['KGB Bar', 'Dime', 'Bowery Ballroom'];
      return {
        status: 200,
        data: { success: true, results: { entities: names.map((name) => ({ name, entity_id: mockId(name) })) } },
      };
    }
  }

  const res = await fetch(`${API_URL}${path}`, {
    headers: {
      'X-Api-Key': API_KEY,
      Accept: 'application/json',
    },
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

async function runGate() {
  const gateResults = {
    check1: { pass: false, details: [] },
    check2: { pass: false, details: [] },
    check3: { pass: false, details: [] },
    check4: { pass: false, details: [] },
  };

  const resolvedURNsByLineup = {};

  // ============================================================
  // CHECK 1: Artist Resolution
  // Pass: At least 3 out of 4 artists resolve to urn:entity:artist
  // ============================================================
  console.log('[CHECK 1] Verifying Multi-Artist Entity Resolution (/search)...');
  let totalResolved = 0;
  let totalQueried = 0;

  for (const [key, item] of Object.entries(LINEUPS)) {
    resolvedURNsByLineup[key] = [];
    let lineupResolvedCount = 0;

    for (const artist of item.artists) {
      totalQueried++;
      const { status, data } = await callQloo(buildSearchPath(artist, 'urn:entity:artist', 3));
      const results = extractSearchResults(data);
      const match = pickArtistMatch(results, artist);
      const entityId = match?.entity_id || '';
      const nameMatches = !!match && normalizeName(match.name || '') === normalizeName(artist);

      if (status === 200 && entityId && nameMatches) {
        lineupResolvedCount++;
        totalResolved++;
        resolvedURNsByLineup[key].push(entityId);
        console.log(`  ✓ [${key}] "${artist}" -> "${match.name}" ${entityId} (popularity ${match.popularity?.toFixed?.(3) ?? 'n/a'})`);
      } else if (status === 200 && entityId) {
        console.log(`  ✗ [${key}] "${artist}" ambiguous: top artist match was "${match.name}" (${entityId})`);
      } else {
        console.log(`  ✗ [${key}] "${artist}" failed resolution (status: ${status}, results: ${results.length})`);
      }
    }

    gateResults.check1.details.push(`${key}: ${lineupResolvedCount}/${item.artists.length} resolved`);
  }

  gateResults.check1.pass = totalResolved / totalQueried >= 0.75;
  console.log(`-> Check 1 Result: ${gateResults.check1.pass ? 'PASS' : 'FAIL'} (${totalResolved}/${totalQueried} resolved, threshold >= 75%)\n`);

  // ============================================================
  // CHECK 2: Brand Specificity
  // Pass: /v2/insights returns >= 8 recognizable brands per lineup
  // ============================================================
  console.log('[CHECK 2] Verifying Brand Specificity (/v2/insights)...');
  let check2PassCount = 0;
  const retrievedBrandsByLineup = {};

  for (const [key, seeds] of Object.entries(resolvedURNsByLineup)) {
    if (seeds.length === 0) {
      retrievedBrandsByLineup[key] = [];
      console.log(`  • [${key}] Skipped — no resolved seed entities`);
      continue;
    }
    const { status, data } = await callQloo(buildBrandInsightsPath(seeds, { city: LINEUPS[key].city, take: 20 }));
    const brands = extractInsightEntities(data);
    retrievedBrandsByLineup[key] = brands;

    const preview = brands
      .slice(0, 5)
      .map((b) => `${b.name} (${Math.round((b.query?.affinity ?? 0) * 100)})`)
      .join(', ');
    console.log(`  • [${key}] Retrieved ${brands.length} brand candidates (status: ${status}) — ${preview}`);
    if (brands.length >= 8) {
      check2PassCount++;
    }
  }

  gateResults.check2.pass = check2PassCount === Object.keys(LINEUPS).length;
  console.log(`-> Check 2 Result: ${gateResults.check2.pass ? 'PASS' : 'FAIL'} (${check2PassCount}/${Object.keys(LINEUPS).length} lineups returned >= 8 brands)\n`);

  // ============================================================
  // CHECK 3: Plain LLM Differentiation (<40% Overlap)
  // Pass: Top-10 Qloo brand list has < 40% overlap with generic LLM guesses
  // ============================================================
  console.log('[CHECK 3] Verifying Cultural Divergence vs. Plain LLM Baseline...');
  const nycBrands = (retrievedBrandsByLineup['NYC'] || []).slice(0, 10).map((b) => (b.name || '').toLowerCase());
  let overlapCount = 0;

  for (const name of nycBrands) {
    if (GENERIC_LLM_BRANDS.has(name) || Array.from(GENERIC_LLM_BRANDS).some((g) => name.includes(g) || g.includes(name))) {
      overlapCount++;
    }
  }

  const overlapPct = nycBrands.length > 0 ? Math.round((overlapCount / nycBrands.length) * 100) : 0;
  // An empty brand list must not count as "differentiated"
  gateResults.check3.pass = nycBrands.length >= 8 && overlapPct < 40;
  console.log(`  • NYC Top 10 Qloo Brands: ${nycBrands.slice(0, 5).join(', ')}...`);
  console.log(`  • Overlap with generic LLM brands: ${overlapCount}/${nycBrands.length} (${overlapPct}%)`);
  console.log(`-> Check 3 Result: ${gateResults.check3.pass ? 'PASS' : 'FAIL'} (Overlap ${overlapPct}% is ${overlapPct < 40 ? '< 40%' : '>= 40%'})\n`);

  // ============================================================
  // CHECK 4: Geographic Granularity (Williamsburg vs Lower East Side)
  // Test if place/brand rankings differ at the neighborhood level
  // ============================================================
  console.log('[CHECK 4] Testing Geographic Granularity (Williamsburg vs. Lower East Side)...');
  const wburgRes = await callQloo(buildPlaceInsightsPath('Williamsburg, Brooklyn', 5));
  const lesRes = await callQloo(buildPlaceInsightsPath('Lower East Side, Manhattan', 5));

  const wburgPlaces = extractInsightEntities(wburgRes.data).map((p) => p.name || p.entity_id).join('|');
  const lesPlaces = extractInsightEntities(lesRes.data).map((p) => p.name || p.entity_id).join('|');

  const geoDiverges = wburgPlaces !== lesPlaces && wburgPlaces.length > 0;
  gateResults.check4.pass = geoDiverges;
  console.log(`  • Williamsburg results: ${wburgPlaces || 'None'}`);
  console.log(`  • Lower East Side results: ${lesPlaces || 'None'}`);
  console.log(`-> Check 4 Result: ${geoDiverges ? 'DIFFERENTIATED (P2 Neighborhood Map Feasible)' : 'UNIFORM / CITY-WIDE (Stick to City-level)'}\n`);

  // ============================================================
  // FINAL SCORECARD
  // ============================================================
  console.log('============================================================');
  console.log('                 FINAL FEASIBILITY SCORECARD                ');
  console.log('============================================================');
  console.log(`Check 1: Artist Resolution        : ${gateResults.check1.pass ? 'PASS ✓' : 'FAIL ✗'}`);
  console.log(`Check 2: Brand Specificity        : ${gateResults.check2.pass ? 'PASS ✓' : 'FAIL ✗'}`);
  console.log(`Check 3: Plain LLM Differentiation : ${gateResults.check3.pass ? 'PASS ✓' : 'FAIL ✗'}`);
  console.log(`Check 4: Geographic Granularity   : ${gateResults.check4.pass ? 'PASS (P2 Map Feasible) ✓' : 'CITY-LEVEL ONLY'}`);
  console.log('============================================================\n');

  if (isDryMock) {
    console.log('NOTE: Gate test executed in simulated/mock mode.');
    console.log('To run against the live Qloo endpoint once your key arrives:');
    console.log('  1. Add your key to .env.local: QLOO_API_KEY=your_live_key');
    console.log('  2. Set QLOO_MOCK_FIXTURE_MODE=false');
    console.log('  3. Run: node --env-file=.env.local scripts/gate_test.mjs\n');
  }
}

runGate().catch((err) => {
  console.error('[Gate Test Error]:', err);
  process.exit(1);
});
