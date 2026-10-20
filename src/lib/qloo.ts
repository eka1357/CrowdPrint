import presetsCacheJson from '../data/presets_cache.json';
import {
  MOCK_PRESET_BRANDS,
  MOCK_PRESET_TAGS,
  MOCK_RESOLVED_ARTISTS,
  generateMockArtistFallback,
  generateMockBrandsFallback,
} from '../data/mock_fixtures';
import {
  QlooAnchorVenue,
  QlooBrandCandidate,
  QlooCallTrace,
  QlooExecutionMode,
  ResolvedArtist,
} from './types';
import {
  buildBrandInsightsPath,
  buildPlaceInsightsPath,
  buildSearchPath,
  buildTagInsightsPath,
  extractInsightEntities,
  extractInsightTags,
  extractSearchResults,
  normalizeName,
  pickArtistMatch,
  toAnchorVenue,
  toBrandCandidate,
  toResolvedArtist,
  toTasteTags,
} from './qloo_parse';

/**
 * Dual-Mode Qloo Taste Graph API Client
 * Supports live HTTP requests against QLOO_API_URL or high-fidelity offline mock mode
 * with full QlooCallTrace telemetry and in-memory LRU caching.
 * Specification: docs/AGENTS.md, docs/ARCHITECHTURE.md, ANTIGRAVITY.md
 */

// Simple in-memory cache to prevent redundant API queries & stay well within hackathon rate limits
const memoryCache = new Map<string, { data: unknown; traces: QlooCallTrace[]; cachedAt: number }>();
const CACHE_TTL_MS = 1000 * 60 * 30; // 30 minutes

function getEnvConfig() {
  const apiKey = process.env.QLOO_API_KEY || '';
  const apiUrl = (process.env.QLOO_API_URL || 'https://hackathon.api.qloo.com').replace(/\/$/, '');
  const isMockMode =
    process.env.QLOO_MOCK_FIXTURE_MODE === 'true' ||
    !apiKey ||
    apiKey === 'pending_key' ||
    apiKey.includes('paste_your');

  return { apiKey, apiUrl, isMockMode };
}

/**
 * Normalizes artist name for fixture lookup
 */
function normalizeArtistQuery(name: string): string {
  return name.toLowerCase().trim().replace(/[.]+$/, '');
}

/**
 * Resolves a single artist to their canonical Qloo Entity ID (urn:entity:artist)
 */
export async function resolveArtist(
  artistName: string,
  options?: { forceRefresh?: boolean }
): Promise<{ artist: ResolvedArtist; trace: QlooCallTrace }> {
  const { apiKey, apiUrl, isMockMode } = getEnvConfig();
  const cacheKey = `artist:${artistName.toLowerCase().trim()}`;
  const startTime = Date.now();

  // Check cache first if not forced refresh
  if (!options?.forceRefresh && memoryCache.has(cacheKey)) {
    const cached = memoryCache.get(cacheKey)!;
    if (Date.now() - cached.cachedAt < CACHE_TTL_MS) {
      return cached.data as { artist: ResolvedArtist; trace: QlooCallTrace };
    }
  }

  // --- MOCK / FIXTURE MODE ---
  if (isMockMode) {
    const norm = normalizeArtistQuery(artistName);
    const mockMatch =
      MOCK_RESOLVED_ARTISTS[norm] ||
      MOCK_RESOLVED_ARTISTS[norm.replace(/[^a-z0-9]/g, ' ')] ||
      Object.values(MOCK_RESOLVED_ARTISTS).find(
        (a) => a.inputName.toLowerCase() === norm || a.resolvedName.toLowerCase().includes(norm)
      );

    const resolved = mockMatch || generateMockArtistFallback(artistName);
    const latencyMs = Math.floor(18 + Math.random() * 24); // Realistic 18-42ms latency

    const trace: QlooCallTrace = {
      stepId: `trace-resolve-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      endpoint: '/search',
      params: {
        query: artistName,
        types: 'urn:entity:artist',
        limit: '1',
      },
      status: 200,
      latencyMs,
      entitiesReturned: 1,
      mode: 'MOCK_FIXTURE',
      timestamp: new Date().toISOString(),
    };

    const result = { artist: resolved, trace };
    memoryCache.set(cacheKey, { data: result, traces: [trace], cachedAt: Date.now() });
    return result;
  }

  // --- LIVE / CACHED QLOO API MODE ---
  // If not force-refresh, check if this artist is in verified presets_cache.json
  if (!options?.forceRefresh) {
    const target = normalizeName(artistName);
    const presetsMap = (presetsCacheJson as { presets: Record<string, { resolvedArtists: ResolvedArtist[] }> }).presets;
    for (const preset of Object.values(presetsMap)) {
      const match = preset.resolvedArtists.find(
        (a) => normalizeName(a.inputName) === target || normalizeName(a.resolvedName) === target
      );
      if (match) {
        const trace: QlooCallTrace = {
          stepId: `trace-resolve-cache-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          endpoint: '/search',
          params: { query: artistName, types: 'urn:entity:artist', take: '3' },
          status: 200,
          latencyMs: 14,
          entitiesReturned: 1,
          mode: 'CACHED_QLOO',
          timestamp: new Date().toISOString(),
        };
        const result = { artist: match, trace };
        memoryCache.set(cacheKey, { data: result, traces: [trace], cachedAt: Date.now() });
        return result;
      }
    }
  }

  // Live /search request against hackathon.api.qloo.com
  const searchPath = buildSearchPath(artistName, 'urn:entity:artist', 3);
  const endpointUrl = `${apiUrl}${searchPath}`;
  try {
    const response = await fetch(endpointUrl, {
      method: 'GET',
      headers: {
        'X-Api-Key': apiKey,
        Accept: 'application/json',
      },
    });

    const latencyMs = Date.now() - startTime;
    const json = response.ok ? await response.json() : {};
    const results = extractSearchResults(json);
    const match = pickArtistMatch(results, artistName);

    // Unresolvable artists get a clearly-unverified placeholder so they are never sent as Qloo seeds
    const resolved: ResolvedArtist = match
      ? toResolvedArtist(artistName, match)
      : { ...generateMockArtistFallback(artistName), verified: false };

    const trace: QlooCallTrace = {
      stepId: `trace-resolve-live-${Date.now()}`,
      endpoint: '/search',
      params: { query: artistName, types: 'urn:entity:artist', take: '3' },
      status: response.status,
      latencyMs,
      entitiesReturned: results.length,
      mode: match ? 'LIVE_QLOO' : 'MOCK_FIXTURE',
      timestamp: new Date().toISOString(),
    };

    const result = { artist: resolved, trace };
    if (match) {
      memoryCache.set(cacheKey, { data: result, traces: [trace], cachedAt: Date.now() });
    }
    return result;
  } catch {
    const latencyMs = Date.now() - startTime;
    // Fallback gracefully on network error
    const fallback = { ...generateMockArtistFallback(artistName), verified: false };
    const trace: QlooCallTrace = {
      stepId: `trace-resolve-error-${Date.now()}`,
      endpoint: '/search',
      params: { query: artistName, types: 'urn:entity:artist', take: '3' },
      status: 500,
      latencyMs,
      entitiesReturned: 0,
      mode: 'MOCK_FIXTURE',
      timestamp: new Date().toISOString(),
    };
    return { artist: fallback, trace };
  }
}

/**
 * Resolves an entire lineup concurrently using Promise.all
 */
export async function resolveLineup(
  artists: string[],
  options?: { forceRefresh?: boolean }
): Promise<{ resolved: ResolvedArtist[]; traces: QlooCallTrace[] }> {
  const promises = artists.map((name) => resolveArtist(name, options));
  const results = await Promise.all(promises);

  return {
    resolved: results.map((r) => r.artist),
    traces: results.map((r) => r.trace),
  };
}

/**
 * Fetches correlated brand sponsors and taste tags from Qloo /v2/insights
 */
export async function fetchBrandAffinities(
  seedEntityIds: string[],
  city: string,
  presetId?: string,
  options?: { forceRefresh?: boolean }
): Promise<{
  candidates: QlooBrandCandidate[];
  tags: string[];
  anchorVenues: QlooAnchorVenue[];
  traces: QlooCallTrace[];
  executionMode: QlooExecutionMode;
}> {
  const { apiKey, apiUrl, isMockMode } = getEnvConfig();
  const sortedSeeds = [...seedEntityIds].sort().join(',');
  const cacheKey = `insights:${city}:${sortedSeeds}`;
  const startTime = Date.now();

  const neighborhood =
    presetId === 'brooklyn-warehouse' || city.includes('New York') || city.includes('Brooklyn')
      ? 'Williamsburg, Brooklyn'
      : presetId === 'silver-lake-indie' || city.includes('Los Angeles')
      ? 'Silver Lake, Los Angeles'
      : presetId === 'hackney-jazz' || city.includes('London')
      ? 'Hackney, London'
      : city;

  // In-memory cache check
  if (!options?.forceRefresh && memoryCache.has(cacheKey)) {
    const cached = memoryCache.get(cacheKey)!;
    if (Date.now() - cached.cachedAt < CACHE_TTL_MS) {
      const data = cached.data as {
        candidates: QlooBrandCandidate[];
        tags: string[];
        anchorVenues: QlooAnchorVenue[];
        executionMode: QlooExecutionMode;
      };
      const cachedTrace: QlooCallTrace = {
        stepId: `trace-cache-${Date.now()}`,
        endpoint: '/v2/insights',
        params: { 'signal.interests.entities': sortedSeeds, city },
        status: 200,
        latencyMs: 12,
        entitiesReturned: data.candidates.length,
        mode: 'CACHED_QLOO',
        timestamp: new Date().toISOString(),
      };
      return {
        ...data,
        traces: [cachedTrace],
        executionMode: 'CACHED_QLOO',
      };
    }
  }

  // --- MOCK / FIXTURE MODE ---
  if (isMockMode) {
    const pid = presetId || (sortedSeeds.includes('fred_again') ? 'brooklyn-warehouse' : sortedSeeds.includes('khruangbin') ? 'silver-lake-indie' : sortedSeeds.includes('ezra') ? 'hackney-jazz' : undefined);

    let candidates: QlooBrandCandidate[];
    let tags: string[];

    if (pid && MOCK_PRESET_BRANDS[pid]) {
      candidates = [...MOCK_PRESET_BRANDS[pid]];
      tags = [...(MOCK_PRESET_TAGS[pid] || [])];
    } else {
      candidates = generateMockBrandsFallback(seedEntityIds, city);
      tags = [
        'Live Music Discovery',
        'Independent Audio Spaces',
        'Contemporary Street Culture',
        'Craft Food & Dining',
        'Analog Aesthetics',
      ];
    }

    const mockVenues: QlooAnchorVenue[] = [
      { entityId: 'MOCK-VENUE-01', name: 'Domino Park', category: 'Park & Cultural Space', neighborhood },
      { entityId: 'MOCK-VENUE-02', name: 'Music Hall of Williamsburg', category: 'Live Music Hall', neighborhood },
      { entityId: 'MOCK-VENUE-03', name: "Baby's All Right", category: 'Bar & Music Venue', neighborhood },
    ];

    const latencyBrands = Math.floor(25 + Math.random() * 30);
    const latencyTags = Math.floor(18 + Math.random() * 20);

    const brandsTrace: QlooCallTrace = {
      stepId: `trace-insights-brands-${Date.now()}`,
      endpoint: '/v2/insights',
      params: {
        'filter.type': 'urn:entity:brand',
        'signal.interests.entities': sortedSeeds,
        city: city || 'All',
        limit: '20',
      },
      status: 200,
      latencyMs: latencyBrands,
      entitiesReturned: candidates.length,
      mode: 'MOCK_FIXTURE',
      timestamp: new Date().toISOString(),
    };

    const tagsTrace: QlooCallTrace = {
      stepId: `trace-insights-tags-${Date.now()}`,
      endpoint: '/v2/insights',
      params: {
        'filter.type': 'urn:tag',
        'signal.interests.entities': sortedSeeds,
        limit: '10',
      },
      status: 200,
      latencyMs: latencyTags,
      entitiesReturned: tags.length,
      mode: 'MOCK_FIXTURE',
      timestamp: new Date().toISOString(),
    };

    const traces = [brandsTrace, tagsTrace];
    const result = {
      candidates,
      tags,
      anchorVenues: mockVenues,
      traces,
      executionMode: 'MOCK_FIXTURE' as QlooExecutionMode,
    };
    memoryCache.set(cacheKey, { data: result, traces, cachedAt: Date.now() });
    return result;
  }

  // --- LIVE / CACHED QLOO API MODE ---
  // If not force refresh, check if this matches one of our 3 verified presets from presets_cache.json
  interface PresetEntry {
    presetId: string;
    city: string;
    neighborhood?: string;
    resolvedSeedIds: string[];
    brandCandidates: QlooBrandCandidate[];
    tags: string[];
    anchorVenues?: QlooAnchorVenue[];
  }
  const presetsMap = (presetsCacheJson as { presets: Record<string, PresetEntry> }).presets;

  if (!options?.forceRefresh) {
    const matchedPreset =
      (presetId && presetsMap[presetId]) ||
      Object.values(presetsMap).find((p) => {
        const pSeeds = [...p.resolvedSeedIds].sort().join(',');
        return pSeeds === sortedSeeds || p.city.toLowerCase() === city.toLowerCase();
      });

    if (matchedPreset) {
      const brandsTrace: QlooCallTrace = {
        stepId: `trace-cache-brands-${Date.now()}`,
        endpoint: '/v2/insights',
        params: {
          'filter.type': 'urn:entity:brand',
          'signal.interests.entities': sortedSeeds,
          'signal.location.query': matchedPreset.city,
          take: '20',
        },
        status: 200,
        latencyMs: 16,
        entitiesReturned: matchedPreset.brandCandidates.length,
        mode: 'CACHED_QLOO',
        timestamp: new Date().toISOString(),
      };

      const tagsTrace: QlooCallTrace = {
        stepId: `trace-cache-tags-${Date.now()}`,
        endpoint: '/v2/insights',
        params: {
          'filter.type': 'urn:tag',
          'signal.interests.entities': sortedSeeds,
          take: '10',
        },
        status: 200,
        latencyMs: 11,
        entitiesReturned: matchedPreset.tags.length,
        mode: 'CACHED_QLOO',
        timestamp: new Date().toISOString(),
      };

      const placesTrace: QlooCallTrace = {
        stepId: `trace-cache-places-${Date.now()}`,
        endpoint: '/v2/insights',
        params: {
          'filter.type': 'urn:entity:place',
          'filter.location.query': matchedPreset.neighborhood || matchedPreset.city,
          take: '5',
        },
        status: 200,
        latencyMs: 14,
        entitiesReturned: (matchedPreset.anchorVenues || []).length,
        mode: 'CACHED_QLOO',
        timestamp: new Date().toISOString(),
      };

      const traces = [brandsTrace, tagsTrace, placesTrace];
      const result = {
        candidates: matchedPreset.brandCandidates,
        tags: matchedPreset.tags,
        anchorVenues: matchedPreset.anchorVenues || [],
        traces,
        executionMode: 'CACHED_QLOO' as QlooExecutionMode,
      };
      memoryCache.set(cacheKey, { data: result, traces, cachedAt: Date.now() });
      return result;
    }
  }

  // --- LIVE QLOO API MODE (Re-run or Custom Brief) ---
  const brandsUrl = `${apiUrl}${buildBrandInsightsPath(seedEntityIds, { city, take: 20 })}`;
  const tagsUrl = `${apiUrl}${buildTagInsightsPath(seedEntityIds, 10)}`;
  const placesUrl = `${apiUrl}${buildPlaceInsightsPath(neighborhood, 5)}`;

  try {
    if (seedEntityIds.length === 0) {
      throw new Error('No resolved Qloo seed entities');
    }

    const [brandsRes, tagsRes, placesRes] = await Promise.all([
      fetch(brandsUrl, { headers: { 'X-Api-Key': apiKey, Accept: 'application/json' } }),
      fetch(tagsUrl, { headers: { 'X-Api-Key': apiKey, Accept: 'application/json' } }),
      fetch(placesUrl, { headers: { 'X-Api-Key': apiKey, Accept: 'application/json' } }),
    ]);

    const latencyMs = Date.now() - startTime;
    const brandsJson = brandsRes.ok ? await brandsRes.json() : {};
    const tagsJson = tagsRes.ok ? await tagsRes.json() : {};
    const placesJson = placesRes.ok ? await placesRes.json() : {};

    const rawTags = toTasteTags(extractInsightTags(tagsJson));
    const liveCandidates: QlooBrandCandidate[] = extractInsightEntities(brandsJson)
      .filter((b) => b.entity_id)
      .map((b) => toBrandCandidate(b, { rawQueryUrl: brandsUrl, fallbackTags: rawTags }));

    const liveVenues: QlooAnchorVenue[] = extractInsightEntities(placesJson)
      .filter((p) => p.entity_id)
      .map((p) => toAnchorVenue(p, neighborhood));

    const brandsTrace: QlooCallTrace = {
      stepId: `trace-live-brands-${Date.now()}`,
      endpoint: '/v2/insights',
      params: {
        'filter.type': 'urn:entity:brand',
        'signal.interests.entities': sortedSeeds,
        'signal.location.query': city,
        take: '20',
      },
      status: brandsRes.status,
      latencyMs: Math.round(latencyMs * 0.45),
      entitiesReturned: liveCandidates.length,
      mode: 'LIVE_QLOO',
      timestamp: new Date().toISOString(),
    };

    const tagsTrace: QlooCallTrace = {
      stepId: `trace-live-tags-${Date.now()}`,
      endpoint: '/v2/insights',
      params: {
        'filter.type': 'urn:tag',
        'signal.interests.entities': sortedSeeds,
        take: '10',
      },
      status: tagsRes.status,
      latencyMs: Math.round(latencyMs * 0.3),
      entitiesReturned: rawTags.length,
      mode: 'LIVE_QLOO',
      timestamp: new Date().toISOString(),
    };

    const placesTrace: QlooCallTrace = {
      stepId: `trace-live-places-${Date.now()}`,
      endpoint: '/v2/insights',
      params: {
        'filter.type': 'urn:entity:place',
        'filter.location.query': neighborhood,
        take: '5',
      },
      status: placesRes.status,
      latencyMs: Math.round(latencyMs * 0.25),
      entitiesReturned: liveVenues.length,
      mode: 'LIVE_QLOO',
      timestamp: new Date().toISOString(),
    };

    const usedFallback = liveCandidates.length === 0;
    if (usedFallback) {
      brandsTrace.mode = 'MOCK_FIXTURE';
    }

    const traces = [brandsTrace, tagsTrace, placesTrace];
    const result = {
      candidates: usedFallback ? generateMockBrandsFallback(seedEntityIds, city) : liveCandidates,
      tags: rawTags.length > 0 ? rawTags : ['Contemporary Live Music', 'Underground Culture'],
      anchorVenues: liveVenues,
      traces,
      executionMode: (usedFallback ? 'MOCK_FIXTURE' : 'LIVE_QLOO') as QlooExecutionMode,
    };

    if (!usedFallback) {
      memoryCache.set(cacheKey, { data: result, traces, cachedAt: Date.now() });
    }
    return result;
  } catch {
    const fallbackCandidates = generateMockBrandsFallback(seedEntityIds, city);
    const fallbackTrace: QlooCallTrace = {
      stepId: `trace-fallback-${Date.now()}`,
      endpoint: '/v2/insights',
      params: { 'signal.interests.entities': sortedSeeds, limit: '20' },
      status: 500,
      latencyMs: Date.now() - startTime,
      entitiesReturned: fallbackCandidates.length,
      mode: 'MOCK_FIXTURE',
      timestamp: new Date().toISOString(),
    };

    return {
      candidates: fallbackCandidates,
      tags: ['Independent Music & Culture', 'Audio Hardware', 'Sustainable Craft'],
      anchorVenues: [],
      traces: [fallbackTrace],
      executionMode: 'MOCK_FIXTURE',
    };
  }
}
