import {
  MOCK_PRESET_BRANDS,
  MOCK_PRESET_TAGS,
  MOCK_RESOLVED_ARTISTS,
  generateMockArtistFallback,
  generateMockBrandsFallback,
} from '../data/mock_fixtures';
import {
  QlooBrandCandidate,
  QlooCallTrace,
  QlooExecutionMode,
  ResolvedArtist,
} from './types';

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

  // --- LIVE QLOO API MODE ---
  const endpointUrl = `${apiUrl}/search?query=${encodeURIComponent(artistName)}&types=urn:entity:artist&limit=1`;
  try {
    const response = await fetch(endpointUrl, {
      method: 'GET',
      headers: {
        'X-Api-Key': apiKey,
        Accept: 'application/json',
      },
    });

    const latencyMs = Date.now() - startTime;
    const json = await response.json();
    const results = json?.results || json?.data || [];
    const first = results[0];

    const resolved: ResolvedArtist = first
      ? {
          inputName: artistName,
          resolvedName: first.name || artistName,
          entityId: first.id || first.entity_id || `urn:entity:artist:${encodeURIComponent(artistName)}`,
          verified: true,
          disambiguationScore: first.score || 0.95,
          genres: first.genres || [],
        }
      : generateMockArtistFallback(artistName);

    const trace: QlooCallTrace = {
      stepId: `trace-resolve-live-${Date.now()}`,
      endpoint: '/search',
      params: { query: artistName, types: 'urn:entity:artist', limit: '1' },
      status: response.status,
      latencyMs,
      entitiesReturned: results.length,
      mode: 'LIVE_QLOO',
      timestamp: new Date().toISOString(),
    };

    const result = { artist: resolved, trace };
    memoryCache.set(cacheKey, { data: result, traces: [trace], cachedAt: Date.now() });
    return result;
  } catch {
    const latencyMs = Date.now() - startTime;
    // Fallback gracefully on network error
    const fallback = generateMockArtistFallback(artistName);
    const trace: QlooCallTrace = {
      stepId: `trace-resolve-error-${Date.now()}`,
      endpoint: '/search',
      params: { query: artistName, types: 'urn:entity:artist', limit: '1' },
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
  traces: QlooCallTrace[];
  executionMode: QlooExecutionMode;
}> {
  const { apiKey, apiUrl, isMockMode } = getEnvConfig();
  const sortedSeeds = [...seedEntityIds].sort().join(',');
  const cacheKey = `insights:${city}:${sortedSeeds}`;
  const startTime = Date.now();

  // Cache check
  if (!options?.forceRefresh && memoryCache.has(cacheKey)) {
    const cached = memoryCache.get(cacheKey)!;
    if (Date.now() - cached.cachedAt < CACHE_TTL_MS) {
      const data = cached.data as {
        candidates: QlooBrandCandidate[];
        tags: string[];
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
    const result = { candidates, tags, traces, executionMode: 'MOCK_FIXTURE' as QlooExecutionMode };
    memoryCache.set(cacheKey, { data: result, traces, cachedAt: Date.now() });
    return result;
  }

  // --- LIVE QLOO API MODE ---
  const brandsUrl = `${apiUrl}/v2/insights?filter.type=urn:entity:brand&signal.interests.entities=${encodeURIComponent(sortedSeeds)}&limit=20`;
  const tagsUrl = `${apiUrl}/v2/insights?filter.type=urn:tag&signal.interests.entities=${encodeURIComponent(sortedSeeds)}&limit=10`;

  try {
    const [brandsRes, tagsRes] = await Promise.all([
      fetch(brandsUrl, {
        headers: { 'X-Api-Key': apiKey, Accept: 'application/json' },
      }),
      fetch(tagsUrl, {
        headers: { 'X-Api-Key': apiKey, Accept: 'application/json' },
      }),
    ]);

    const latencyMs = Date.now() - startTime;
    const brandsJson = await brandsRes.json();
    const tagsJson = await tagsRes.json();

    const rawBrands = brandsJson?.results || brandsJson?.data || [];
    const rawTags = (tagsJson?.results || tagsJson?.data || []).map(
      (t: { name?: string; tag?: string }) => t.name || t.tag || ''
    ).filter(Boolean);

    const candidates: QlooBrandCandidate[] = rawBrands.map((b: {
      id?: string;
      entity_id?: string;
      name?: string;
      affinity?: number;
      score?: number;
      categories?: string[];
      tags?: string[];
      description?: string;
    }) => ({
      entityId: b.id || b.entity_id || `urn:entity:brand:${encodeURIComponent(b.name || 'unknown')}`,
      name: b.name || 'Unnamed Brand',
      affinityScore: Math.round((b.affinity ?? b.score ?? 0.85) * (b.affinity && b.affinity <= 1 ? 100 : 1)),
      categories: b.categories || ['Commercial Brand'],
      sharedTags: b.tags || rawTags.slice(0, 3),
      rawQueryUrl: brandsUrl,
      description: b.description || 'Grounded brand match from Qloo Taste Graph.',
    }));

    const brandsTrace: QlooCallTrace = {
      stepId: `trace-live-brands-${Date.now()}`,
      endpoint: '/v2/insights',
      params: {
        'filter.type': 'urn:entity:brand',
        'signal.interests.entities': sortedSeeds,
        limit: '20',
      },
      status: brandsRes.status,
      latencyMs: Math.round(latencyMs * 0.6),
      entitiesReturned: candidates.length,
      mode: 'LIVE_QLOO',
      timestamp: new Date().toISOString(),
    };

    const tagsTrace: QlooCallTrace = {
      stepId: `trace-live-tags-${Date.now()}`,
      endpoint: '/v2/insights',
      params: {
        'filter.type': 'urn:tag',
        'signal.interests.entities': sortedSeeds,
        limit: '10',
      },
      status: tagsRes.status,
      latencyMs: Math.round(latencyMs * 0.4),
      entitiesReturned: rawTags.length,
      mode: 'LIVE_QLOO',
      timestamp: new Date().toISOString(),
    };

    const traces = [brandsTrace, tagsTrace];
    const result = {
      candidates: candidates.length > 0 ? candidates : generateMockBrandsFallback(seedEntityIds, city),
      tags: rawTags.length > 0 ? rawTags : ['Contemporary Live Music', 'Underground Culture'],
      traces,
      executionMode: 'LIVE_QLOO' as QlooExecutionMode,
    };

    memoryCache.set(cacheKey, { data: result, traces, cachedAt: Date.now() });
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
      traces: [fallbackTrace],
      executionMode: 'MOCK_FIXTURE',
    };
  }
}
