import { EventBrief } from '../lib/types';

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
    judgeHighlight: 'High-affinity music tech & audio hardware; blocks all hard liquor sponsors.',
    expectedExclusionsSummary: 'Alcohol & Hard Liquor brands (Pabst, Hendrick\'s Gin) automatically intercepted.',
    constraints: {
      minBudgetTier: 150000,
      blockedCategories: ['Alcohol', 'Hard Liquor'],
      lockedCompetitors: [],
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
    judgeHighlight: 'Aesthetic clean living, audiophile sound & slow perfumery; blocks fast fashion & synthetic energy drinks.',
    expectedExclusionsSummary: 'Fast fashion (Shein) and high-caffeine energy drinks (Red Bull) filtered out.',
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
    expectedExclusionsSummary: 'Rival footwear brands (Adidas Originals) locked out due to Nike exclusivity.',
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
