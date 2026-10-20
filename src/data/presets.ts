import type { EventBrief } from '../lib/types';

export interface JudgePreset extends EventBrief {
  presetId: 'brooklyn-warehouse' | 'silver-lake-indie' | 'hackney-jazz';
  judgeHighlight: string;
  expectedExclusionsSummary: string;
}

export const JUDGE_PRESETS: JudgePreset[] = [
  {
    presetId: 'brooklyn-warehouse',
    name: 'Brooklyn Warehouse Electronic',
    tagline: 'Deep underground electronic & techno showcase in East Williamsburg',
    lineup: ['Fred again..', 'Four Tet', 'Peggy Gou', 'Overmono'],
    city: 'New York City, NY',
    venueName: 'East Williamsburg Industrial Warehouse',
    expectedAttendance: 4500,
    judgeHighlight: 'High-affinity music tech & underground design; blocks corporate mass media outlets and enforces audio headphone exclusivity with AIAIAI.',
    expectedExclusionsSummary: 'Mass media outlets (Vice, i-D) and rival audio brands (Urbanears) intercepted by commercial rules.',
    constraints: {
      minBudgetTier: 150000,
      blockedCategories: ['Mass Media', 'Digital Publishing', 'Alcohol'],
      lockedCompetitors: ['AIAIAI'],
      ageRestriction: 'ALL_AGES',
      ecoConsciousOnly: false,
    },
  },
  {
    presetId: 'silver-lake-indie',
    name: 'Silver Lake Indie & Alt-R&B Outdoor',
    tagline: 'Sunset hillside gathering with natural aesthetics and boutique sound',
    lineup: ['Khruangbin', 'Steve Lacy', 'Clairo', 'Men I Trust'],
    city: 'Los Angeles, CA',
    venueName: 'Silver Lake Meadow & Vista Pavilion',
    expectedAttendance: 3200,
    judgeHighlight: 'Aesthetic clean living, audiophile sound & slow perfumery; festival mandates 100% eco-conscious partners, blocking fast fashion brands.',
    expectedExclusionsSummary: 'Fast fashion retail brands (Brandy Melville, Nasty Gal, American Apparel) intercepted by eco-compliance audit.',
    constraints: {
      minBudgetTier: 75000,
      blockedCategories: ['Fast Fashion', 'Energy Drinks'],
      lockedCompetitors: [],
      ageRestriction: 'ALL_AGES',
      ecoConsciousOnly: true,
    },
  },
  {
    presetId: 'hackney-jazz',
    name: 'Hackney Underground Jazz & Grime',
    tagline: 'High-energy contemporary UK jazz, soul, and London grime crossover',
    lineup: ['Ezra Collective', 'Little Simz', 'Yussef Dayes'],
    city: 'London, UK',
    venueName: 'Hackney Wick Arches & Warehouse',
    expectedAttendance: 2800,
    judgeHighlight: 'British subculture audio & heritage apparel; competitor conflict lock on footwear with Nike.',
    expectedExclusionsSummary: 'Rival footwear brands (Y-3, Clarks, Grenson Shoes) intercepted due to Nike footwear exclusivity.',
    constraints: {
      minBudgetTier: 50000,
      blockedCategories: ['Tobacco', 'Gambling'],
      lockedCompetitors: ['Nike'],
      ageRestriction: '18_PLUS',
      ecoConsciousOnly: false,
    },
  },
];

export const DEFAULT_PRESET = JUDGE_PRESETS[0];

export function getPresetById(id: string): JudgePreset | undefined {
  return JUDGE_PRESETS.find((p) => p.presetId === id);
}
