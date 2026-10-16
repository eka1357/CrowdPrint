import {
  CommercialConstraints,
  CommercialRuleRejection,
  FilteredSponsorResult,
  QlooBrandCandidate,
} from './types';

/**
 * Deterministic Commercial Rules Engine
 * Enforces business boundaries, category exclusivity, locked competitors, and venue restrictions.
 * Pure TypeScript execution — NEVER delegated to an LLM prompt.
 * Specification: docs/AGENTS.md, docs/FEATURES.md, docs/TESTING.md
 */

// Category alias taxonomy for precise commercial conflict detection
const CATEGORY_SYNONYMS: Record<string, string[]> = {
  alcohol: ['alcohol', 'hard liquor', 'beer', 'spirits', 'wine', 'malt beverage', 'liquor', 'distillery'],
  'hard liquor': ['hard liquor', 'spirits', 'gin', 'vodka', 'whiskey', 'tequila', 'rum'],
  beer: ['beer', 'malt beverage', 'lager', 'ale', 'brewery'],
  'fast fashion': ['fast fashion', 'ultra fast fashion', 'budget apparel', 'disposable fashion'],
  'energy drinks': ['energy drinks', 'high caffeine energy', 'caffeinated beverage'],
  crypto: ['crypto', 'cryptocurrency', 'web3', 'nft', 'blockchain'],
  tobacco: ['tobacco', 'smoking accessories', 'cigarettes', 'vape', 'nicotine', 'paper goods'],
  gambling: ['gambling', 'sports betting', 'digital wagering', 'casino', 'lottery'],
  sportswear: ['sportswear', 'athletic apparel', 'athletic footwear'],
};

// Known competitor mapping for common marquee sponsor sectors
const COMPETITOR_SECTORS: Record<string, { sector: string; brands: string[] }> = {
  nike: {
    sector: 'Footwear & Athletic Apparel',
    brands: ['adidas', 'puma', 'reebok', 'new balance', 'asics', 'under armour', 'on running', 'hoka'],
  },
  adidas: {
    sector: 'Footwear & Athletic Apparel',
    brands: ['nike', 'puma', 'reebok', 'new balance', 'asics', 'under armour', 'on running'],
  },
  redbull: {
    sector: 'Energy Drinks',
    brands: ['monster energy', 'rockstar', 'celsius', 'bang energy'],
  },
  monster: {
    sector: 'Energy Drinks',
    brands: ['red bull', 'rockstar', 'celsius'],
  },
  spotify: {
    sector: 'Music Streaming',
    brands: ['apple music', 'amazon music', 'tidal', 'deezer'],
  },
  coca_cola: {
    sector: 'Carbonated Soft Drinks',
    brands: ['pepsi', 'dr pepper', 'keurig dr pepper'],
  },
  pepsi: {
    sector: 'Carbonated Soft Drinks',
    brands: ['coca-cola', 'coke', 'dr pepper'],
  },
};

/**
 * Normalizes string for case-insensitive matching
 */
function normalize(str: string): string {
  return str.toLowerCase().trim();
}

/**
 * Checks if a category string matches a synonym using whole-word boundaries,
 * with explicit exemption for 'non-alcoholic' or 'alcohol-free'.
 */
function matchesSynonym(categoryText: string, syn: string): boolean {
  const normCat = normalize(categoryText);
  const normSyn = normalize(syn);

  // Exemption for non-alcoholic / alcohol-free products
  if (
    (normSyn === 'alcohol' || normSyn === 'beer' || normSyn === 'spirits') &&
    (normCat.includes('non-alcoholic') || normCat.includes('alcohol-free') || normCat.includes('zero alcohol'))
  ) {
    return false;
  }

  // Exact match or whole-word boundary match
  if (normCat === normSyn) {
    return true;
  }

  const escaped = normSyn.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  const wordRegex = new RegExp(`(^|\\s|[^a-zA-Z0-9])${escaped}($|\\s|[^a-zA-Z0-9])`, 'i');
  return wordRegex.test(normCat);
}

/**
 * Checks if a candidate brand's categories match any blocked categories
 */
function checkCategoryExclusion(
  brand: QlooBrandCandidate,
  blockedCategories: string[]
): { blocked: boolean; matchedCategory?: string; blockedBy?: string } {
  const brandCategories = brand.categories;
  const brandName = brand.name;

  for (const rawBlocked of blockedCategories) {
    const blockedNorm = normalize(rawBlocked);
    const synonyms = CATEGORY_SYNONYMS[blockedNorm] || [blockedNorm];

    for (const syn of synonyms) {
      // Check each category with word boundary matching
      for (const cat of brandCategories) {
        if (matchesSynonym(cat, syn)) {
          return { blocked: true, matchedCategory: cat, blockedBy: rawBlocked };
        }
      }

      // Check brand name for adult terms (e.g. "Gin", "Beer", "Vodka")
      if (['beer', 'gin', 'vodka', 'whiskey', 'tequila', 'rum', 'bet', 'casino'].includes(syn)) {
        if (matchesSynonym(brandName, syn)) {
          return { blocked: true, matchedCategory: syn, blockedBy: rawBlocked };
        }
      }
    }
  }

  return { blocked: false };
}

/**
 * Checks if a candidate brand violates a locked competitor agreement
 */
function checkCompetitorLock(
  brand: QlooBrandCandidate,
  lockedCompetitors: string[]
): { locked: boolean; rivalLocked?: string; sector?: string } {
  const brandName = normalize(brand.name);

  for (const rawLocked of lockedCompetitors) {
    const lockedNorm = normalize(rawLocked);

    // Direct brand collision (e.g. Adidas locked, and candidate is Adidas)
    if (brandName.includes(lockedNorm) || lockedNorm.includes(brandName)) {
      return {
        locked: true,
        rivalLocked: rawLocked,
        sector: 'Direct Brand Conflict',
      };
    }

    // Rival brand collision in exclusive category (e.g. Nike locked, candidate is Adidas Originals)
    const competitorSector = COMPETITOR_SECTORS[lockedNorm];
    if (competitorSector) {
      const isRival = competitorSector.brands.some(
        (rival) => brandName.includes(rival) || rival.includes(brandName)
      );
      if (isRival) {
        return {
          locked: true,
          rivalLocked: rawLocked,
          sector: competitorSector.sector,
        };
      }
    }
  }

  return { locked: false };
}

/**
 * Checks age restriction compliance
 */
function checkAgeRestrictions(
  brand: QlooBrandCandidate,
  ageRestriction?: 'ALL_AGES' | '18_PLUS' | '21_PLUS'
): { restricted: boolean; reason?: string } {
  if (ageRestriction !== 'ALL_AGES') {
    return { restricted: false };
  }

  const adultCategories = ['alcohol', 'hard liquor', 'beer', 'spirits', 'tobacco', 'gambling', 'cannabis'];

  for (const adultCat of adultCategories) {
    for (const cat of brand.categories) {
      if (matchesSynonym(cat, adultCat)) {
        return {
          restricted: true,
          reason: `Venue is designated ALL AGES. Adult-classified sponsor category "${cat}" is legally restricted.`,
        };
      }
    }
  }

  return { restricted: false };
}

/**
 * Checks eco-conscious compliance if mandated by festival brief
 */
function checkEcoCompliance(
  brand: QlooBrandCandidate,
  ecoConsciousOnly?: boolean
): { nonCompliant: boolean; reason?: string } {
  if (!ecoConsciousOnly) {
    return { nonCompliant: false };
  }

  const nonEcoCategories = ['fast fashion', 'ultra fast fashion', 'disposable plastic'];
  const brandCategories = brand.categories.map(normalize);

  for (const badCat of nonEcoCategories) {
    const matched = brandCategories.some((c) => c.includes(badCat));
    if (matched) {
      return {
        nonCompliant: true,
        reason: `Event mandates 100% Eco-Conscious / Sustainable partners. Brand category "${badCat}" fails festival sustainability audit.`,
      };
    }
  }

  return { nonCompliant: false };
}

/**
 * Evaluates candidate sponsors against all deterministic commercial rules.
 * Preserves every rejected brand with full reason code and human-readable explanation.
 */
export function applyCommercialRules(
  candidates: QlooBrandCandidate[],
  constraints: CommercialConstraints
): FilteredSponsorResult {
  const approved: QlooBrandCandidate[] = [];
  const rejected: CommercialRuleRejection[] = [];

  for (const brand of candidates) {
    // 1. Age Restriction check
    const ageCheck = checkAgeRestrictions(brand, constraints.ageRestriction);
    if (ageCheck.restricted) {
      rejected.push({
        brand,
        reasonCode: 'AGE_RESTRICTION',
        ruleTriggered: `Rule: ALL_AGES venue filter [${constraints.ageRestriction}]`,
        explanation: ageCheck.reason || 'Restricted category for all-ages event.',
      });
      continue;
    }

    // 2. Category Exclusion check
    if (constraints.blockedCategories && constraints.blockedCategories.length > 0) {
      const catCheck = checkCategoryExclusion(brand, constraints.blockedCategories);
      if (catCheck.blocked) {
        rejected.push({
          brand,
          reasonCode: 'CATEGORY_EXCLUSION',
          ruleTriggered: `Rule: Category Exclusivity Lock [Blocked: ${catCheck.blockedBy}]`,
          explanation: `Brand category "${catCheck.matchedCategory}" conflicts with organizer exclusion list (${catCheck.blockedBy}).`,
        });
        continue;
      }
    }

    // 3. Competitor Lock check
    if (constraints.lockedCompetitors && constraints.lockedCompetitors.length > 0) {
      const compCheck = checkCompetitorLock(brand, constraints.lockedCompetitors);
      if (compCheck.locked) {
        rejected.push({
          brand,
          reasonCode: 'COMPETITOR_LOCK',
          ruleTriggered: `Rule: Competitor Exclusivity Lock [Locked: ${compCheck.rivalLocked}]`,
          explanation: `Brand conflicts with exclusive locked sponsor "${compCheck.rivalLocked}" in sector "${compCheck.sector}".`,
        });
        continue;
      }
    }

    // 4. Eco Compliance check
    if (constraints.ecoConsciousOnly) {
      const ecoCheck = checkEcoCompliance(brand, constraints.ecoConsciousOnly);
      if (ecoCheck.nonCompliant) {
        rejected.push({
          brand,
          reasonCode: 'ECO_NON_COMPLIANT',
          ruleTriggered: 'Rule: 100% Eco-Conscious Mandate',
          explanation: ecoCheck.reason || 'Brand fails sustainability criteria.',
        });
        continue;
      }
    }

    // If all checks pass, brand is approved!
    approved.push(brand);
  }

  // Sort approved candidates by affinityScore descending
  approved.sort((a, b) => b.affinityScore - a.affinityScore);

  return { approved, rejected };
}
