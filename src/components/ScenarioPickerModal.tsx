'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { JUDGE_PRESETS, JudgePreset } from '@/data/presets';
import { EventBrief } from '@/lib/types';
import SpotlightCard from '@/components/ui/SpotlightCard';
import {
  X,
  SlidersHorizontal,
  MapPin,
  CheckCircle2,
  DollarSign,
  ShieldAlert,
  ArrowRight,
  Radio,
} from 'lucide-react';

interface ScenarioPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  activePresetId?: string;
  onSelectPreset: (preset: JudgePreset) => void;
  onSubmitCustomBrief: (brief: EventBrief) => void;
}

export function ScenarioPickerModal({
  isOpen,
  onClose,
  activePresetId = 'brooklyn-warehouse',
  onSelectPreset,
  onSubmitCustomBrief,
}: ScenarioPickerModalProps) {
  const [modalTab, setModalTab] = useState<'presets' | 'custom'>('presets');

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

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

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
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: 'spring', duration: 0.35, bounce: 0.15 }}
            className="relative w-full max-w-4xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col my-8 max-h-[90vh]"
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-900/60 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Radio className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                    <span>Switch Event Brief</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700/60">
                      Scenario Picker
                    </span>
                  </h2>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Select a curated judge scenario or build a custom festival brief to ground against Qloo Taste Graph.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Tab Switcher */}
                <div className="p-1 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setModalTab('presets')}
                    className={`px-3 py-1 rounded text-xs font-mono font-medium transition-colors cursor-pointer ${
                      modalTab === 'presets'
                        ? 'bg-zinc-800 text-white shadow-xs'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Presets (3)
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalTab('custom')}
                    className={`px-3 py-1 rounded text-xs font-mono font-medium transition-colors cursor-pointer ${
                      modalTab === 'custom'
                        ? 'bg-zinc-800 text-white shadow-xs'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Custom Brief
                  </button>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-850 transition-colors cursor-pointer"
                  title="Close (Esc)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {modalTab === 'presets' ? (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                      <Radio className="w-3.5 h-3.5 text-emerald-400" />
                      Curated Production Scenarios (1-Click Run)
                    </span>
                    <span className="text-[11px] font-mono text-zinc-500">
                      Zero typing required
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {JUDGE_PRESETS.map((preset) => {
                      const isActive = activePresetId === preset.presetId;
                      return (
                        <SpotlightCard
                          key={preset.presetId}
                          onClick={() => {
                            onSelectPreset(preset);
                            onClose();
                          }}
                          theme="dark"
                          spotlightColor="rgba(255, 255, 255, 0.08)"
                          intensity={0.25}
                          className={`text-left p-4 rounded-xl border transition-all relative overflow-hidden group cursor-pointer flex flex-col justify-between ${
                            isActive
                              ? '!bg-zinc-900 !border-emerald-500/50 ring-1 ring-emerald-500/40 shadow-lg'
                              : '!bg-zinc-900/40 hover:!bg-zinc-900/80 !border-zinc-800 hover:!border-zinc-700'
                          }`}
                        >
                          {isActive && (
                            <div className="absolute top-0 left-0 right-0 h-[2px] bg-emerald-400" />
                          )}

                          <div>
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <h3 className="font-bold text-sm text-zinc-100 group-hover:text-white leading-tight">
                                {preset.name}
                              </h3>
                              {isActive ? (
                                <span className="flex items-center gap-1 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 shrink-0">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                  ACTIVE
                                </span>
                              ) : (
                                <span className="text-[10px] font-mono text-zinc-500 group-hover:text-emerald-400 transition-colors shrink-0 flex items-center gap-0.5">
                                  Select <ArrowRight className="w-3 h-3" />
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-zinc-400 mb-3 leading-relaxed">
                              {preset.tagline}
                            </p>

                            {/* Lineup Chips */}
                            <div className="flex flex-wrap gap-1 mb-3">
                              {preset.lineup.map((artist) => (
                                <span
                                  key={artist}
                                  className="text-[11px] px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-zinc-300 font-mono"
                                >
                                  {artist}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="pt-3 border-t border-zinc-800/80 space-y-2 text-xs font-mono text-zinc-400">
                            <div className="flex items-center gap-1 text-zinc-300">
                              <MapPin className="w-3 h-3 text-zinc-400 shrink-0" />
                              <span className="truncate">{preset.city}</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              <span className="px-1.5 py-0.5 rounded bg-zinc-950 text-amber-300 border border-amber-900/40 text-[10px]">
                                ${(preset.constraints.minBudgetTier! / 1000).toFixed(0)}k Floor
                              </span>
                              {preset.constraints.blockedCategories.map((c) => (
                                <span
                                  key={c}
                                  className="px-1.5 py-0.5 rounded bg-zinc-950 text-red-400 border border-red-900/40 text-[10px]"
                                >
                                  No {c}
                                </span>
                              ))}
                              {preset.constraints.ecoConsciousOnly && (
                                <span className="px-1.5 py-0.5 rounded bg-zinc-950 text-emerald-300 border border-emerald-900/40 text-[10px]">
                                  Eco-Only
                                </span>
                              )}
                              {preset.constraints.lockedCompetitors.map((l) => (
                                <span
                                  key={l}
                                  className="px-1.5 py-0.5 rounded bg-zinc-950 text-purple-300 border border-purple-900/40 text-[10px]"
                                >
                                  Lock: {l}
                                </span>
                              ))}
                            </div>
                          </div>
                        </SpotlightCard>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* Custom Brief Form */
                <form onSubmit={handleCustomSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                        Event Showcase Name
                      </label>
                      <input
                        type="text"
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                        placeholder="e.g. Secret Warehouse Project"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                        Metro City / Market
                      </label>
                      <input
                        type="text"
                        value={customCity}
                        onChange={(e) => setCustomCity(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                        placeholder="e.g. New York City, NY"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                      Festival / Venue Lineup (Comma Separated)
                    </label>
                    <input
                      type="text"
                      value={customLineup}
                      onChange={(e) => setCustomLineup(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                      placeholder="e.g. Fred again.., Jamie xx, Bicep"
                      required
                    />
                    <p className="text-[11px] font-mono text-zinc-500 mt-1">
                      Each artist will be resolved into a canonical Qloo entity ID via /v2/insights.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                        Min Budget Floor ($)
                      </label>
                      <input
                        type="number"
                        value={customBudget}
                        onChange={(e) => setCustomBudget(Number(e.target.value))}
                        step={10000}
                        min={10000}
                        className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                        Locked Competitor
                      </label>
                      <input
                        type="text"
                        value={customLockedComp}
                        onChange={(e) => setCustomLockedComp(e.target.value)}
                        placeholder="e.g. Bose, Nike"
                        className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                        Age Restriction
                      </label>
                      <select
                        value={customAge}
                        onChange={(e) => setCustomAge(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                      >
                        <option value="ALL_AGES">All Ages</option>
                        <option value="18_PLUS">18+ Only</option>
                        <option value="21_PLUS">21+ Only</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-zinc-400 mb-2">
                      Blocked Commercial Categories
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {['Alcohol', 'Hard Liquor', 'Tobacco', 'Gambling', 'Fast Fashion', 'Energy Drinks'].map(
                        (cat) => {
                          const isBlocked = customBlockedCats.includes(cat);
                          return (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => toggleCategory(cat)}
                              className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer border ${
                                isBlocked
                                  ? 'bg-red-950/60 text-red-300 border-red-800/80 font-semibold'
                                  : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                              }`}
                            >
                              {isBlocked ? '✕' : '+'} {cat}
                            </button>
                          );
                        }
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="customEco"
                      checked={customEco}
                      onChange={(e) => setCustomEco(e.target.checked)}
                      className="rounded bg-zinc-900 border-zinc-700 text-emerald-500 focus:ring-emerald-500/20 cursor-pointer"
                    />
                    <label htmlFor="customEco" className="text-xs font-mono text-zinc-300 cursor-pointer">
                      Eco-Conscious Sponsors Only (Require certified sustainable credentials)
                    </label>
                  </div>

                  <div className="pt-4 border-t border-zinc-800 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 rounded-lg text-xs font-mono text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs font-mono transition-all shadow-md shadow-emerald-500/20 cursor-pointer flex items-center gap-1.5"
                    >
                      <span>Run Qloo Analysis</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default ScenarioPickerModal;
