'use client';

import React, { useState } from 'react';
import { JUDGE_PRESETS, JudgePreset } from '@/data/presets';
import { EventBrief, QlooExecutionMode } from '@/lib/types';
import {
  Sparkles,
  RefreshCw,
  SlidersHorizontal,
  MapPin,
  DollarSign,
  ShieldAlert,
  Radio,
  X,
  CheckCircle2,
} from 'lucide-react';
import SpotlightCard from '@/components/ui/SpotlightCard';
import { CssLink } from '@/components/ui/CssLink';

interface PresetHeroProps {
  activePresetId?: string;
  onSelectPreset: (preset: JudgePreset) => void;
  onSubmitCustomBrief: (brief: EventBrief) => void;
  onRefresh: () => void;
  isLoading: boolean;
  activeMode: QlooExecutionMode;
}

export function PresetHero({
  activePresetId = 'brooklyn-warehouse',
  onSelectPreset,
  onSubmitCustomBrief,
  onRefresh,
  isLoading,
  activeMode,
}: PresetHeroProps) {
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);

  // Custom Brief Form State
  const [customName, setCustomName] = useState('Secret Warehouse Project');
  const [customCity, setCustomCity] = useState('New York City, NY');
  const [customVenue, setCustomVenue] = useState('Navy Yard Hangar 4');
  const [customLineup, setCustomLineup] = useState('Bicep, Jamie xx, Floating Points');
  const [customBudget, setCustomBudget] = useState(100000);
  const [customLockedComp, setCustomLockedComp] = useState('');
  const [customBlockedCats, setCustomBlockedCats] = useState<string[]>(['Alcohol']);
  const [customAge, setCustomAge] = useState<'ALL_AGES' | '18_PLUS' | '21_PLUS'>('ALL_AGES');
  const [customEco, setCustomEco] = useState(false);

  const toggleCategory = (cat: string) => {
    if (customBlockedCats.includes(cat)) {
      setCustomBlockedCats(customBlockedCats.filter((c) => c !== cat));
    } else {
      setCustomBlockedCats([...customBlockedCats, cat]);
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const artists = customLineup
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (artists.length === 0) return;

    const brief: EventBrief = {
      name: customName || 'Custom Showcase',
      tagline: 'Custom Lineup Sponsorship Evaluation',
      lineup: artists,
      city: customCity,
      venueName: customVenue,
      expectedAttendance: 3500,
      presetId: 'custom',
      constraints: {
        minBudgetTier: customBudget,
        blockedCategories: customBlockedCats,
        lockedCompetitors: customLockedComp ? [customLockedComp] : [],
        ageRestriction: customAge,
        ecoConsciousOnly: customEco,
      },
    };

    onSubmitCustomBrief(brief);
    setIsCustomModalOpen(false);
  };

  return (
    <header className="border-b border-white/[0.08] bg-[#090A0F]/95 backdrop-blur-md sticky top-0 z-40 transition-all">
      {/* Top Navbar */}
      <div className="max-w-[1400px] mx-auto px-6 py-3.5 flex flex-wrap items-center justify-between gap-3">
        {/* Logo & Brand Identity */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#10B981] via-[#059669] to-[#047857] flex items-center justify-center shadow-lg shadow-[#10B981]/20">
            <Radio className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-white">Crowdprint</span>
              <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
                Taste AI Agent
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Cultural Intelligence for Live Event Sponsorship & Brand Activations
            </p>
          </div>
        </div>

        {/* Status Indicators & Action Controls */}
        <div className="flex items-center gap-2.5">
          {/* Active Mode Badge */}
          <div
            className={`flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-mono font-medium border ${
              activeMode === 'LIVE_QLOO'
                ? 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/30'
                : activeMode === 'CACHED_QLOO'
                ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                activeMode === 'LIVE_QLOO'
                  ? 'bg-[#10B981] animate-ping'
                  : activeMode === 'CACHED_QLOO'
                  ? 'bg-emerald-400'
                  : 'bg-amber-400 animate-pulse'
              }`}
            />
            <span>
              {activeMode === 'LIVE_QLOO'
                ? 'Live Qloo API'
                : activeMode === 'CACHED_QLOO'
                ? 'Cached Taste Graph'
                : 'Mock Fixtures'}
            </span>
          </div>

          {/* Custom Brief Button */}
          <button
            onClick={() => setIsCustomModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#11131C] hover:bg-[#181B26] text-xs font-medium text-slate-200 border border-white/10 hover:border-white/20 transition-all cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden md:inline">Custom</span> Brief
          </button>

          {/* Re-run Pipeline Button */}
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#10B981] hover:bg-[#059669] disabled:opacity-50 text-xs font-semibold text-black transition-all shadow-sm shadow-[#10B981]/25 cursor-pointer"
            title="Trigger pipeline execution"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Running...' : 'Re-run'}</span>
          </button>

          {/* GitHub Repo Link */}
          <a
            href="https://github.com/eka1357/CrowdPrint"
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-lg bg-[#11131C] hover:bg-[#181B26] text-slate-400 hover:text-white border border-white/10 transition-colors"
            title="View GitHub Repository"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
          </a>
        </div>
      </div>

        {/* Preset Selector Bar (Zero-Typing Judge Entry) */}
      <div className="max-w-[1400px] mx-auto px-6 py-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-xs uppercase font-mono font-bold tracking-wider text-zinc-400">
              One-Click Judge Presets (Zero Typing Required)
            </span>
          </div>
          <span className="text-[11px] font-mono text-zinc-500 hidden sm:inline">
            Empirical audience taste grounding
          </span>
        </div>

        {/* 3 Preset Cards Grid - Strict 3 Columns, min-w-0, zero overflow */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full">
          {JUDGE_PRESETS.map((preset) => {
            const isActive = activePresetId === preset.presetId;
            return (
              <SpotlightCard
                key={preset.presetId}
                onClick={() => onSelectPreset(preset)}
                theme="dark"
                spotlightColor="rgba(255, 255, 255, 0.08)"
                intensity={0.25}
                className={`text-left p-3.5 rounded-xl border transition-all relative overflow-hidden group cursor-pointer min-w-0 ${
                  isActive
                    ? '!bg-zinc-900/90 !border-zinc-700 shadow-md ring-1 ring-zinc-700/60'
                    : '!bg-zinc-950/70 hover:!bg-zinc-900/60 !border-zinc-800/80 hover:!border-zinc-700/60'
                }`}
              >
                {/* Active Understated Top Lip */}
                {isActive && (
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-zinc-400/80" />
                )}

                <div className="flex items-start justify-between gap-2 mb-1.5 min-w-0">
                  <div className="font-semibold text-sm text-zinc-100 group-hover:text-white truncate min-w-0">
                    {preset.name}
                  </div>
                  {isActive ? (
                    <span className="flex items-center gap-1 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-200 border border-zinc-600/60 shrink-0">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      ACTIVE
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-zinc-500 shrink-0">1-Click</span>
                  )}
                </div>

                {/* Lineup Pills */}
                <div className="flex flex-wrap gap-1 mb-2 overflow-hidden max-h-12">
                  {preset.lineup.map((artist) => (
                    <span
                      key={artist}
                      className="text-[11px] px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800/80 text-zinc-300 font-mono truncate max-w-[140px]"
                    >
                      {artist}
                    </span>
                  ))}
                </div>

                {/* Location & Commercial Constraint Tags */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-400 font-mono min-w-0">
                  <span className="flex items-center gap-1 text-zinc-300 truncate">
                    <MapPin className="w-3 h-3 text-zinc-400" />
                    {preset.city.split(',')[0]}
                  </span>
                  <span className="flex items-center gap-1 text-zinc-300 truncate">
                    <DollarSign className="w-3 h-3 text-zinc-400" />
                    ${(preset.constraints.minBudgetTier! / 1000).toFixed(0)}k+ Floor
                  </span>
                  {preset.constraints.blockedCategories.length > 0 && (
                    <span className="flex items-center gap-1 text-red-400/90 truncate">
                      <ShieldAlert className="w-3 h-3" />
                      No {preset.constraints.blockedCategories[0]}
                    </span>
                  )}
                  {preset.constraints.lockedCompetitors.length > 0 && (
                    <span className="flex items-center gap-1 text-purple-400/90 truncate">
                      <ShieldAlert className="w-3 h-3" />
                      Lock: {preset.constraints.lockedCompetitors[0]}
                    </span>
                  )}
                </div>
              </SpotlightCard>
            );
          })}
        </div>
      </div>

      {/* Custom Brief Modal / Dialog */}
      {isCustomModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#11131C] border border-white/[0.12] rounded-2xl w-full max-w-xl p-6 shadow-2xl relative text-left">
            <button
              onClick={() => setIsCustomModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <SlidersHorizontal className="w-5 h-5 text-[#10B981]" />
              <h3 className="text-lg font-bold text-white">Custom Event Brief Builder</h3>
            </div>
            <p className="text-xs text-slate-400 mb-5">
              Enter your custom festival lineup and commercial restrictions to run through the Qloo agent.
            </p>

            <form onSubmit={handleCustomSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                  Event Name
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#090A0F] border border-white/10 text-sm text-white focus:outline-none focus:border-[#10B981]"
                  placeholder="e.g. Desert Sound Oasis"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                    City / Market
                  </label>
                  <input
                    type="text"
                    value={customCity}
                    onChange={(e) => setCustomCity(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#090A0F] border border-white/10 text-sm text-white focus:outline-none focus:border-[#10B981]"
                    placeholder="e.g. Los Angeles, CA"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                    Venue Name
                  </label>
                  <input
                    type="text"
                    value={customVenue}
                    onChange={(e) => setCustomVenue(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#090A0F] border border-white/10 text-sm text-white focus:outline-none focus:border-[#10B981]"
                    placeholder="e.g. Pioneer Town Arena"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                  Lineup Artists (Comma-separated)
                </label>
                <input
                  type="text"
                  value={customLineup}
                  onChange={(e) => setCustomLineup(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#090A0F] border border-white/10 text-sm font-mono text-white focus:outline-none focus:border-[#10B981]"
                  placeholder="e.g. Bicep, Jamie xx, Floating Points"
                  required
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Each artist will be resolved into a canonical Qloo entity URN.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                    Min Budget Floor ($)
                  </label>
                  <select
                    value={customBudget}
                    onChange={(e) => setCustomBudget(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-[#090A0F] border border-white/10 text-sm text-white focus:outline-none focus:border-[#10B981]"
                  >
                    <option value={25000}>$25,000 (Emerging Showcase)</option>
                    <option value={50000}>$50,000 (Club / Warehouse Tier)</option>
                    <option value={75000}>$75,000 (Mid-Size Outdoor)</option>
                    <option value={150000}>$150,000+ (Festival Stage Headline)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                    Age / Venue Policy
                  </label>
                  <select
                    value={customAge}
                    onChange={(e) => setCustomAge(e.target.value as 'ALL_AGES' | '18_PLUS' | '21_PLUS')}
                    className="w-full px-3 py-2 rounded-lg bg-[#090A0F] border border-white/10 text-sm text-white focus:outline-none focus:border-[#10B981]"
                  >
                    <option value="ALL_AGES">All Ages (Restricts Alcohol/Tobacco)</option>
                    <option value="18_PLUS">18+ Only</option>
                    <option value="21_PLUS">21+ Nightclub / Festival</option>
                  </select>
                </div>
              </div>

              {/* Category Exclusions Checklist */}
              <div>
                <label className="block text-xs font-mono font-medium text-slate-300 mb-2">
                  Blocked Sponsor Categories (Deterministic Engine Filter)
                </label>
                <div className="flex flex-wrap gap-2">
                  {['Alcohol', 'Hard Liquor', 'Fast Fashion', 'Energy Drinks', 'Crypto', 'Tobacco', 'Gambling'].map(
                    (cat) => {
                      const selected = customBlockedCats.includes(cat);
                      return (
                        <button
                          type="button"
                          key={cat}
                          onClick={() => toggleCategory(cat)}
                          className={`text-xs px-2.5 py-1 rounded-md border font-mono transition-colors ${
                            selected
                              ? 'bg-red-500/15 text-red-400 border-red-500/40'
                              : 'bg-white/[0.04] text-slate-400 border-white/10 hover:text-white'
                          }`}
                        >
                          {selected ? '✕ ' : '+ '}
                          {cat}
                        </button>
                      );
                    }
                  )}
                </div>
              </div>

              {/* Locked Competitor Input */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                    Locked Competitor (Exclusivity)
                  </label>
                  <input
                    type="text"
                    value={customLockedComp}
                    onChange={(e) => setCustomLockedComp(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#090A0F] border border-white/10 text-sm text-white focus:outline-none focus:border-[#10B981]"
                    placeholder="e.g. Nike (blocks Adidas/Puma)"
                  />
                </div>
                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                    <input
                      type="checkbox"
                      checked={customEco}
                      onChange={(e) => setCustomEco(e.target.checked)}
                      className="rounded border-white/20 bg-[#090A0F] text-[#10B981] focus:ring-0"
                    />
                    <span>100% Eco-Conscious Partners Only</span>
                  </label>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCustomModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#10B981] hover:bg-[#059669] text-black font-semibold text-sm transition-all"
                >
                  Analyze Custom Brief
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
