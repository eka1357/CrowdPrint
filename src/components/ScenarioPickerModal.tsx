'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { JUDGE_PRESETS, JudgePreset } from '@/data/presets';
import { EventBrief } from '@/lib/types';
import SpotlightCard from '@/components/ui/SpotlightCard';
import {
  X,
  MapPin,
  CheckCircle2,
  ArrowRight,
  Radio,
  Search,
  Plus,
  Loader2,
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
  const [customBudget, setCustomBudget] = useState(100000);
  const [customLockedComp, setCustomLockedComp] = useState('');
  const [customBlockedCats, setCustomBlockedCats] = useState<string[]>(['Alcohol']);
  const [customAge, setCustomAge] = useState<'ALL_AGES' | '18_PLUS' | '21_PLUS'>('ALL_AGES');
  const [customEco, setCustomEco] = useState(false);

  // Artist Chip & Autocomplete State
  const [artistChips, setArtistChips] = useState<string[]>(['Bicep', 'Jamie xx', 'Floating Points']);
  const [artistInput, setArtistInput] = useState('');
  const [autocompleteResults, setAutocompleteResults] = useState<
    Array<{ entityId: string; name: string; disambiguation?: string; popularity?: number; genres?: string[]; verified: boolean }>
  >([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  // 250ms Debounced live search
  useEffect(() => {
    const q = artistInput.trim();
    if (q.length < 2) {
      setAutocompleteResults([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/qloo/search?q=${encodeURIComponent(q)}&take=5`);
        if (res.ok) {
          const data = await res.json();
          setAutocompleteResults(data.results || []);
          setShowDropdown(true);
          setFocusedIndex(-1);
        }
      } catch (err) {
        console.warn('[Qloo Autocomplete Error]:', err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [artistInput]);

  const addArtistChip = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (!artistChips.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      setArtistChips([...artistChips, trimmed]);
    }
    setArtistInput('');
    setShowDropdown(false);
    setAutocompleteResults([]);
  };

  const removeArtistChip = (indexToRemove: number) => {
    setArtistChips(artistChips.filter((_, idx) => idx !== indexToRemove));
  };

  const handleArtistInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex((prev) => Math.min(prev + 1, autocompleteResults.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex((prev) => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (focusedIndex >= 0 && autocompleteResults[focusedIndex]) {
        addArtistChip(autocompleteResults[focusedIndex].name);
      } else if (artistInput.trim()) {
        addArtistChip(artistInput);
      }
    } else if (e.key === ',' || e.key === 'Tab') {
      if (artistInput.trim()) {
        e.preventDefault();
        addArtistChip(artistInput);
      }
    } else if (e.key === 'Backspace' && !artistInput && artistChips.length > 0) {
      removeArtistChip(artistChips.length - 1);
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !showDropdown) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, showDropdown]);

  const toggleCategory = (cat: string) => {
    if (customBlockedCats.includes(cat)) {
      setCustomBlockedCats(customBlockedCats.filter((c) => c !== cat));
    } else {
      setCustomBlockedCats([...customBlockedCats, cat]);
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalArtists = [...artistChips];
    const pendingInput = artistInput.trim();
    if (pendingInput && !finalArtists.some((a) => a.toLowerCase() === pendingInput.toLowerCase())) {
      finalArtists.push(pendingInput);
    }

    if (finalArtists.length === 0) return;

    const brief: EventBrief = {
      name: customName || 'Custom Showcase',
      tagline: 'Custom Lineup Sponsorship Evaluation',
      lineup: finalArtists,
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
                              ? '!bg-zinc-900/90 !border-zinc-500 shadow-xl'
                              : '!bg-zinc-900/40 hover:!bg-zinc-900/80 !border-zinc-800 hover:!border-zinc-700'
                          }`}
                        >
                          <div>
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <h3 className="font-bold text-sm text-zinc-100 group-hover:text-white leading-tight">
                                {preset.name}
                              </h3>
                              {isActive ? (
                                <span className="flex items-center gap-1 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-200 border border-zinc-600 shrink-0">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                  ACTIVE
                                </span>
                              ) : (
                                <span className="text-[10px] font-mono text-zinc-500 group-hover:text-zinc-300 transition-colors shrink-0 flex items-center gap-0.5">
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

                  <div className="relative">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-mono uppercase text-zinc-300 font-semibold flex items-center gap-1.5">
                        <Search className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Festival / Venue Lineup (Live Qloo Autocomplete)</span>
                      </label>
                      <span className="text-[10px] font-mono text-emerald-400/90 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                        {artistChips.length} Selected
                      </span>
                    </div>

                    {/* Chips + Search Input Container */}
                    <div className="min-h-[52px] p-2 rounded-xl bg-zinc-900/90 border border-zinc-750 focus-within:border-emerald-500/80 focus-within:ring-1 focus-within:ring-emerald-500/50 transition-all flex flex-wrap items-center gap-1.5 relative">
                      {artistChips.map((chip, idx) => (
                        <span
                          key={`${chip}-${idx}`}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-200 text-xs font-mono border border-zinc-700/80 shadow-xs group"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                          <span className="font-semibold text-zinc-100">{chip}</span>
                          <button
                            type="button"
                            onClick={() => removeArtistChip(idx)}
                            className="text-zinc-400 hover:text-red-400 transition-colors cursor-pointer ml-0.5"
                            title={`Remove ${chip}`}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}

                      {/* Interactive Search Input */}
                      <div className="flex-1 min-w-[160px] flex items-center gap-2">
                        <input
                          id="qloo-artist-search-input"
                          type="text"
                          value={artistInput}
                          onChange={(e) => setArtistInput(e.target.value)}
                          onKeyDown={handleArtistInputKeyDown}
                          onFocus={() => {
                            if (autocompleteResults.length > 0) setShowDropdown(true);
                          }}
                          className="w-full bg-transparent border-none text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none font-mono py-1 px-1"
                          placeholder={
                            artistChips.length === 0
                              ? "Type artist name (e.g. Four Tet, Peggy Gou)..."
                              : "Add another artist (press Enter)..."
                          }
                        />
                        {isSearching ? (
                          <Loader2 className="w-4 h-4 animate-spin text-emerald-400 shrink-0 mr-1" />
                        ) : artistInput ? (
                          <button
                            type="button"
                            onClick={() => addArtistChip(artistInput)}
                            className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors text-xs font-mono shrink-0 mr-1"
                            title="Add Artist"
                          >
                            <Plus className="w-3 h-3 text-emerald-400" />
                          </button>
                        ) : null}
                      </div>
                    </div>

                    {/* Floating Autocomplete Dropdown */}
                    {showDropdown && autocompleteResults.length > 0 && (
                      <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-zinc-950/95 border border-zinc-750 rounded-xl shadow-2xl backdrop-blur-xl overflow-hidden divide-y divide-zinc-850 animate-in fade-in slide-in-from-top-1 duration-150">
                        <div className="px-3 py-1.5 bg-zinc-900/80 text-[10px] font-mono uppercase tracking-wider text-zinc-400 flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            Qloo Verified Artists (/search)
                          </span>
                          <span className="text-zinc-500">Click or press Enter to add</span>
                        </div>

                        <div className="max-h-56 overflow-y-auto">
                          {autocompleteResults.map((item, idx) => (
                            <button
                              key={item.entityId}
                              type="button"
                              onClick={() => addArtistChip(item.name)}
                              className={`w-full px-3 py-2 text-left flex items-center justify-between transition-colors cursor-pointer ${
                                focusedIndex === idx
                                  ? 'bg-zinc-850 text-white'
                                  : 'hover:bg-zinc-900 text-zinc-200'
                              }`}
                            >
                              <div className="min-w-0 pr-2">
                                <div className="text-xs font-bold text-zinc-100 flex items-center gap-1.5 truncate">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                                  <span>{item.name}</span>
                                  {item.verified && (
                                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/40">
                                      Verified
                                    </span>
                                  )}
                                </div>
                                <div className="text-[10px] font-mono text-zinc-400 truncate mt-0.5">
                                  {item.disambiguation ||
                                    (item.genres && item.genres.length > 0 ? item.genres.join(' • ') : 'Musical Artist')}
                                </div>
                              </div>

                              <div className="text-right shrink-0">
                                {item.popularity !== undefined && (
                                  <span className="text-[10px] font-mono text-emerald-400 font-semibold block">
                                    {item.popularity}% pop
                                  </span>
                                )}
                                <span className="text-[9px] font-mono text-zinc-600 block">
                                  {item.entityId.slice(0, 8)}...
                                </span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <p className="text-[11px] font-mono text-zinc-400 mt-1.5 flex items-center gap-1">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>Type artist name to search live Qloo Taste Graph. Press Enter or comma to create chip.</span>
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
                        onChange={(e) => setCustomAge(e.target.value as 'ALL_AGES' | '18_PLUS' | '21_PLUS')}
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
