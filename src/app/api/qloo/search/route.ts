import { NextRequest, NextResponse } from 'next/server';
import {
  buildSearchPath,
  extractSearchResults,
  normalizeName,
} from '@/lib/qloo_parse';
import presetsCacheJson from '@/data/presets_cache.json';
import { MOCK_RESOLVED_ARTISTS } from '@/data/mock_fixtures';

export interface ArtistAutocompleteItem {
  entityId: string;
  name: string;
  disambiguation?: string;
  popularity?: number;
  genres?: string[];
  verified: boolean;
}

/**
 * GET /api/qloo/search?q=<query>&take=5
 * Lightweight artist autocomplete endpoint backed by live Qloo /search with fixture fallback.
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const q = (searchParams.get('q') || '').trim();
  const take = Math.min(10, Math.max(1, Number(searchParams.get('take')) || 5));

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const apiKey = process.env.QLOO_API_KEY || '';
  const apiUrl = (process.env.QLOO_API_URL || 'https://hackathon.api.qloo.com').replace(/\/$/, '');
  const isMockMode =
    process.env.QLOO_MOCK_FIXTURE_MODE === 'true' ||
    !apiKey ||
    apiKey === 'pending_key' ||
    apiKey.includes('paste_your');

  // 1. If not forced mock, query live Qloo /search
  if (!isMockMode) {
    try {
      const searchPath = buildSearchPath(q, 'urn:entity:artist', take);
      const res = await fetch(`${apiUrl}${searchPath}`, {
        method: 'GET',
        headers: {
          'X-Api-Key': apiKey,
          Accept: 'application/json',
        },
        signal: AbortSignal.timeout(6000),
      });

      if (res.ok) {
        const json = await res.json();
        const rawResults = extractSearchResults(json);
        const artistEntities = rawResults.filter(
          (e) => (e.types || []).includes('urn:entity:artist') || e.subtype === 'urn:entity:artist'
        );

        if (artistEntities.length > 0) {
          const formatted: ArtistAutocompleteItem[] = artistEntities.slice(0, take).map((e) => ({
            entityId: e.entity_id || '',
            name: e.name || q,
            disambiguation: e.disambiguation || undefined,
            popularity: typeof e.popularity === 'number' ? Math.round(e.popularity * 100) : undefined,
            genres: (e.tags || [])
              .filter((t) => (t.type || '').includes('genre'))
              .map((t) => t.name || '')
              .filter(Boolean)
              .slice(0, 3),
            verified: true,
          }));

          return NextResponse.json(
            { results: formatted, source: 'LIVE_QLOO' },
            {
              headers: {
                'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
              },
            }
          );
        }
      }
    } catch (err) {
      console.warn('[Qloo Autocomplete] Live query failed, falling back to cached index:', err);
    }
  }

  // 2. Fallback to cached presets + mock fixtures
  const normTarget = normalizeName(q);
  const matched: ArtistAutocompleteItem[] = [];
  const seenIds = new Set<string>();

  // Search cached presets
  const presets = (presetsCacheJson as { presets?: Record<string, { resolvedArtists?: Array<{ entityId: string; resolvedName: string; disambiguationScore?: number; genres?: string[] }> }> })?.presets || {};
  for (const p of Object.values(presets)) {
    for (const a of p.resolvedArtists || []) {
      if (
        (normalizeName(a.resolvedName).includes(normTarget) || normTarget.includes(normalizeName(a.resolvedName))) &&
        !seenIds.has(a.entityId)
      ) {
        seenIds.add(a.entityId);
        matched.push({
          entityId: a.entityId,
          name: a.resolvedName,
          popularity: typeof a.disambiguationScore === 'number' ? Math.round(a.disambiguationScore * 100) : 95,
          genres: a.genres || ['Electronic', 'Independent'],
          verified: true,
        });
      }
    }
  }

  // Search mock fixtures
  for (const [key, artist] of Object.entries(MOCK_RESOLVED_ARTISTS)) {
    if (
      (key.includes(normTarget) || normalizeName(artist.resolvedName).includes(normTarget)) &&
      !seenIds.has(artist.entityId)
    ) {
      seenIds.add(artist.entityId);
      matched.push({
        entityId: artist.entityId,
        name: artist.resolvedName,
        popularity: typeof artist.disambiguationScore === 'number' ? Math.round(artist.disambiguationScore * 100) : 90,
        genres: artist.genres || [],
        verified: true,
      });
    }
  }

  // If still empty, return a synthetic candidate so user can always select what they typed
  if (matched.length === 0) {
    matched.push({
      entityId: `URN-${normTarget.slice(0, 8).toUpperCase()}`,
      name: q,
      disambiguation: 'Custom Talent Submission',
      popularity: 85,
      genres: ['Live Music'],
      verified: false,
    });
  }

  return NextResponse.json({
    results: matched.slice(0, take),
    source: 'CACHED_FALLBACK',
  });
}
