import type { QlooAnchorVenue, QlooBrandCandidate, ResolvedArtist } from './types';

/**
 * Qloo response parsing + request-path helpers.
 *
 * Shapes verified against the live hackathon endpoint (https://hackathon.api.qloo.com):
 *
 *   GET /search?query=Four%20Tet&types=urn:entity:artist&take=3
 *   -> { results: [ { name, entity_id: "<UUID>", types: ["urn:entity:artist"], popularity,
 *                     disambiguation, tags: [{ name, tag_id, type, value }], properties: {...} } ] }
 *      NOTE: `take` (not `limit`) controls result count; `entity_id` is a bare UUID, the entity
 *      type lives in `types[]`.
 *
 *   GET /v2/insights?filter.type=urn:entity:brand&signal.interests.entities=<UUID,UUID>&take=20
 *       [&signal.location.query=<city>]
 *   -> { success, results: { entities: [ { name, entity_id, type: "urn:entity", subtype: "urn:entity:brand",
 *                     popularity, query: { affinity }, tags: [{ id, name, type }],
 *                     properties: { short_description, industries[], industry[], ... } } ] } }
 *
 *   GET /v2/insights?filter.type=urn:tag&filter.parents.types=urn:entity:artist&signal.interests.entities=...
 *   -> { success, results: { tags: [ { tag_id, name, subtype, query: { affinity } } ] } }
 *
 *   GET /v2/insights?filter.type=urn:entity:place&filter.location.query=<neighborhood>
 *   -> { success, results: { entities: [...] } }
 *
 * This module is dependency-free (type-only imports) so it can be imported directly by
 * Node scripts (`scripts/*.mjs`, via native TS type stripping) as well as by the Next.js app.
 */

export const QLOO_ARTIST_TYPE = 'urn:entity:artist';
export const QLOO_BRAND_TYPE = 'urn:entity:brand';

// ---------- Raw response shapes ----------

export interface QlooRawTag {
  name?: string;
  id?: string;
  tag_id?: string;
  type?: string;
  subtype?: string;
  query?: { affinity?: number };
}

export interface QlooRawEntity {
  name?: string;
  entity_id?: string;
  types?: string[];
  type?: string;
  subtype?: string;
  popularity?: number;
  disambiguation?: string;
  query?: { affinity?: number };
  tags?: QlooRawTag[];
  properties?: {
    short_description?: string;
    description?: string;
    industries?: string[] | string | null;
    industry?: string[] | string | null;
    [key: string]: unknown;
  };
}

// ---------- Request path builders ----------

const enc = encodeURIComponent;

export function buildSearchPath(query: string, type: string = QLOO_ARTIST_TYPE, take = 3): string {
  return `/search?query=${enc(query)}&types=${type}&take=${take}`;
}

export function buildBrandInsightsPath(seedIds: string[], opts: { city?: string; take?: number } = {}): string {
  const take = opts.take ?? 20;
  const loc = opts.city ? `&signal.location.query=${enc(opts.city)}` : '';
  return `/v2/insights?filter.type=${QLOO_BRAND_TYPE}&signal.interests.entities=${seedIds.join(',')}&take=${take}${loc}`;
}

export function buildTagInsightsPath(seedIds: string[], take = 10): string {
  return `/v2/insights?filter.type=urn:tag&filter.tag.types=urn:tag:lifestyle:qloo,urn:tag:audience:qloo,urn:tag:music:qloo&signal.interests.entities=${seedIds.join(',')}&take=${take}`;
}

export function buildPlaceInsightsPath(location: string, take = 5): string {
  return `/v2/insights?filter.type=urn:entity:place&filter.location.query=${enc(location)}&take=${take}`;
}

// ---------- Extractors ----------

export function extractSearchResults(json: unknown): QlooRawEntity[] {
  const results = (json as { results?: unknown })?.results;
  return Array.isArray(results) ? (results as QlooRawEntity[]) : [];
}

export function extractInsightEntities(json: unknown): QlooRawEntity[] {
  const entities = (json as { results?: { entities?: unknown } })?.results?.entities;
  return Array.isArray(entities) ? (entities as QlooRawEntity[]) : [];
}

export function extractInsightTags(json: unknown): QlooRawTag[] {
  const tags = (json as { results?: { tags?: unknown } })?.results?.tags;
  return Array.isArray(tags) ? (tags as QlooRawTag[]) : [];
}

// ---------- Helpers ----------

/** Lowercase + strip everything except letters/digits ("Fred again.." -> "fredagain"). */
export function normalizeName(s: string): string {
  return (s || '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '');
}

function cleanLabel(s: string | undefined): string {
  const t = (s || '').trim();
  return t ? t.charAt(0).toUpperCase() + t.slice(1) : '';
}

function toList(v: string[] | string | null | undefined): string[] {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

function dedupe(values: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const v of values) {
    const label = cleanLabel(v);
    const key = label.toLowerCase();
    if (label && !seen.has(key)) {
      seen.add(key);
      out.push(label);
    }
  }
  return out;
}

function isArtist(e: QlooRawEntity): boolean {
  return (e.types || []).includes(QLOO_ARTIST_TYPE) || e.subtype === QLOO_ARTIST_TYPE;
}

// ---------- Artist resolution ----------

/** Picks the best artist match: exact normalized-name match first, otherwise first artist-typed result. */
export function pickArtistMatch(results: QlooRawEntity[], inputName: string): QlooRawEntity | undefined {
  const artists = results.filter((e) => isArtist(e) && e.entity_id);
  const target = normalizeName(inputName);
  return artists.find((e) => normalizeName(e.name || '') === target) || artists[0];
}

export function toResolvedArtist(inputName: string, raw: QlooRawEntity): ResolvedArtist {
  const resolvedName = raw.name || inputName;
  const genres = dedupe(
    (raw.tags || []).filter((t) => (t.type || '').startsWith('urn:tag:genre')).map((t) => t.name || '')
  ).slice(0, 6);

  return {
    inputName,
    resolvedName,
    entityId: raw.entity_id || '',
    verified: isArtist(raw) && !!raw.entity_id && normalizeName(resolvedName) === normalizeName(inputName),
    disambiguationScore: typeof raw.popularity === 'number' ? Math.round(raw.popularity * 1000) / 1000 : undefined,
    genres,
  };
}

// ---------- Brand + tag insights ----------

const BRAND_AUDIENCE_TAG_TYPES = [
  'urn:tag:lifestyle:qloo',
  'urn:tag:aesthetic_property:qloo',
  'urn:tag:customer_segment:qloo',
  'urn:tag:emotional_tone:qloo',
];

/** Converts a Qloo 0..1 affinity into the 0..100 scale used across the app. */
export function toAffinityScore(raw: QlooRawEntity): number {
  const a = raw.query?.affinity ?? raw.popularity ?? 0;
  return Math.round((a <= 1 ? a * 100 : a) * 10) / 10;
}

export function toBrandCandidate(
  raw: QlooRawEntity,
  ctx: { rawQueryUrl: string; fallbackTags?: string[] }
): QlooBrandCandidate {
  const props = raw.properties || {};
  const tags = raw.tags || [];

  const categories = dedupe([
    ...toList(props.industries),
    ...toList(props.industry),
    ...tags.filter((t) => t.type === 'urn:tag:genre:brand').map((t) => t.name || ''),
  ]).slice(0, 6);

  const sharedTags = dedupe(
    tags.filter((t) => BRAND_AUDIENCE_TAG_TYPES.includes(t.type || '')).map((t) => t.name || '')
  ).slice(0, 3);

  return {
    entityId: raw.entity_id || '',
    name: raw.name || 'Unnamed Brand',
    affinityScore: toAffinityScore(raw),
    categories: categories.length ? categories : ['Commercial Brand'],
    sharedTags: sharedTags.length ? sharedTags : (ctx.fallbackTags || []).slice(0, 3),
    rawQueryUrl: ctx.rawQueryUrl,
    description: props.short_description || props.description || undefined,
  };
}

export function toTasteTags(rawTags: QlooRawTag[]): string[] {
  return dedupe(rawTags.map((t) => t.name || ''));
}

export function toAnchorVenue(raw: QlooRawEntity, neighborhood?: string): QlooAnchorVenue {
  const props = (raw.properties || {}) as Record<string, unknown>;
  const address = typeof raw.disambiguation === 'string'
    ? raw.disambiguation
    : typeof props.address === 'string'
    ? props.address
    : '';
  const genreTag = (raw.tags || []).find((t) => (t.type || '').includes('genre') || (t.type || '').includes('place'));
  const rawGenre = props.primary_genre;
  const category =
    typeof rawGenre === 'string'
      ? rawGenre
      : rawGenre && typeof rawGenre === 'object' && 'name' in rawGenre
      ? String((rawGenre as { name?: string }).name || '')
      : genreTag?.name || 'Local Cultural Venue';

  return {
    entityId: raw.entity_id || '',
    name: raw.name || 'Local Venue',
    address: address || undefined,
    category: category || 'Local Cultural Venue',
    popularity: typeof raw.popularity === 'number' ? Math.round(raw.popularity * 1000) / 1000 : undefined,
    neighborhood,
  };
}
