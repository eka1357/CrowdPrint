'use client';

import React from 'react';
import { CommercialConstraints } from '@/lib/types';
import {
  ShieldCheck,
  RotateCcw,
  X,
  Lock,
  Ban,
  Sparkles,
  Leaf,
  DollarSign,
} from 'lucide-react';

interface ActiveGuardrailsBarProps {
  constraints: CommercialConstraints;
  initialConstraints: CommercialConstraints;
  onUpdateConstraints: (newConstraints: CommercialConstraints) => void;
  onResetConstraints: () => void;
  isModified: boolean;
  approvedCount: number;
  rejectedCount: number;
}

export function ActiveGuardrailsBar({
  constraints,
  initialConstraints: _initialConstraints,
  onUpdateConstraints,
  onResetConstraints,
  isModified,
  approvedCount,
  rejectedCount,
}: ActiveGuardrailsBarProps) {
  // Preset quick-test constraints to toggle on/off
  const quickTestCompetitors = ['AIAIAI', 'Nike', 'Spotify'];
  const quickTestCategories = ['Mass Media', 'Alcohol', 'Fast Fashion', 'Energy Drinks', 'Tobacco'];

  // Toggle locked competitor
  const toggleCompetitorLock = (comp: string) => {
    const current = constraints.lockedCompetitors || [];
    const exists = current.some((c) => c.toLowerCase() === comp.toLowerCase());
    const updated = exists
      ? current.filter((c) => c.toLowerCase() !== comp.toLowerCase())
      : [...current, comp];

    onUpdateConstraints({
      ...constraints,
      lockedCompetitors: updated,
    });
  };

  // Toggle blocked category
  const toggleBlockedCategory = (category: string) => {
    const current = constraints.blockedCategories || [];
    const exists = current.some((c) => c.toLowerCase() === category.toLowerCase());
    const updated = exists
      ? current.filter((c) => c.toLowerCase() !== category.toLowerCase())
      : [...current, category];

    onUpdateConstraints({
      ...constraints,
      blockedCategories: updated,
    });
  };

  // Toggle eco conscious
  const toggleEcoConscious = () => {
    onUpdateConstraints({
      ...constraints,
      ecoConsciousOnly: !constraints.ecoConsciousOnly,
    });
  };

  const hasAnyActiveRules =
    (constraints.lockedCompetitors && constraints.lockedCompetitors.length > 0) ||
    (constraints.blockedCategories && constraints.blockedCategories.length > 0) ||
    constraints.ecoConsciousOnly ||
    (constraints.minBudgetTier && constraints.minBudgetTier > 0);

  return (
    <div className="rounded-xl bg-zinc-950/90 border border-zinc-800/80 p-3 sm:p-4 shadow-lg backdrop-blur-md space-y-3">
      {/* Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-850 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-200 flex items-center gap-2">
              <span>Active Commercial Guardrails</span>
              <span className="text-[10px] font-normal px-1.5 py-0.2 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/50 flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-emerald-400 animate-ping" />
                Deterministic &lt;1ms
              </span>
            </h3>
          </div>
        </div>

        {/* Status / Reset action */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-zinc-400">
            <span className="text-emerald-400 font-bold">{approvedCount}</span> approved •{' '}
            <span className="text-red-400 font-bold">{rejectedCount}</span> blocked
          </span>

          {isModified && (
            <button
              type="button"
              onClick={onResetConstraints}
              className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-850 hover:bg-zinc-800 text-amber-300 border border-amber-800/50 transition-colors cursor-pointer"
              title="Reset guardrails to original event brief settings"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Brief Rules</span>
            </button>
          )}
        </div>
      </div>

      {/* Row 1: Currently Enforced Rules (Clickable to remove) */}
      <div>
        <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5 flex items-center gap-1">
          <span>Active Rules:</span>
          <span className="text-zinc-400">(Click any chip to toggle off)</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {!hasAnyActiveRules && (
            <span className="text-xs font-mono text-zinc-400 italic py-0.5">
              No guardrails currently enforced. All candidates pass.
            </span>
          )}

          {/* Locked Competitors Chips */}
          {constraints.lockedCompetitors?.map((comp) => (
            <button
              key={comp}
              type="button"
              onClick={() => toggleCompetitorLock(comp)}
              className="group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono bg-purple-950/70 hover:bg-purple-900/80 text-purple-200 border border-purple-800/80 transition-all cursor-pointer shadow-xs"
              title={`Click to unlock ${comp} category`}
            >
              <Lock className="w-3 h-3 text-purple-400" />
              <span>Lock: <strong className="text-white">{comp}</strong></span>
              <X className="w-3 h-3 text-purple-400 group-hover:text-red-300 transition-colors ml-0.5" />
            </button>
          ))}

          {/* Blocked Categories Chips */}
          {constraints.blockedCategories?.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => toggleBlockedCategory(cat)}
              className="group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono bg-red-950/70 hover:bg-red-900/80 text-red-200 border border-red-800/80 transition-all cursor-pointer shadow-xs"
              title={`Click to allow ${cat}`}
            >
              <Ban className="w-3 h-3 text-red-400" />
              <span>Blocked: <strong className="text-white">{cat}</strong></span>
              <X className="w-3 h-3 text-red-400 group-hover:text-emerald-300 transition-colors ml-0.5" />
            </button>
          ))}

          {/* Eco Conscious Only Chip */}
          {constraints.ecoConsciousOnly && (
            <button
              type="button"
              onClick={toggleEcoConscious}
              className="group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono bg-emerald-950/70 hover:bg-emerald-900/80 text-emerald-200 border border-emerald-800/80 transition-all cursor-pointer shadow-xs"
              title="Click to disable eco-only mandate"
            >
              <Leaf className="w-3 h-3 text-emerald-400" />
              <span>Eco-Conscious Only</span>
              <X className="w-3 h-3 text-emerald-400 group-hover:text-red-300 transition-colors ml-0.5" />
            </button>
          )}

          {/* Budget Floor Chip */}
          {constraints.minBudgetTier && constraints.minBudgetTier > 0 && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono bg-amber-950/60 text-amber-200 border border-amber-800/60 shadow-xs">
              <DollarSign className="w-3 h-3 text-amber-400" />
              <span>${(constraints.minBudgetTier / 1000).toFixed(0)}k Budget Floor</span>
            </span>
          )}
        </div>
      </div>

      {/* Row 2: Quick-Toggle "What-If" Simulation Pills */}
      <div className="pt-2 border-t border-zinc-850/80">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 shrink-0 flex items-center gap-1 mr-1">
            <Sparkles className="w-3 h-3 text-emerald-400" />
            What-If Toggles:
          </span>

          {/* Competitor toggles */}
          {quickTestCompetitors.map((comp) => {
            const isLocked = (constraints.lockedCompetitors || []).some(
              (c) => c.toLowerCase() === comp.toLowerCase()
            );
            return (
              <button
                key={comp}
                type="button"
                onClick={() => toggleCompetitorLock(comp)}
                className={`px-2 py-0.5 rounded text-[11px] font-mono transition-all cursor-pointer flex items-center gap-1 border ${
                  isLocked
                    ? 'bg-purple-900/60 text-purple-200 border-purple-600 font-semibold shadow-xs'
                    : 'bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <span>{isLocked ? '✓' : '+'} Lock {comp}</span>
              </button>
            );
          })}

          {/* Category toggles */}
          {quickTestCategories.map((cat) => {
            const isBlocked = (constraints.blockedCategories || []).some(
              (c) => c.toLowerCase() === cat.toLowerCase()
            );
            return (
              <button
                key={cat}
                type="button"
                onClick={() => toggleBlockedCategory(cat)}
                className={`px-2 py-0.5 rounded text-[11px] font-mono transition-all cursor-pointer flex items-center gap-1 border ${
                  isBlocked
                    ? 'bg-red-900/60 text-red-200 border-red-600 font-semibold shadow-xs'
                    : 'bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <span>{isBlocked ? '✓' : '+'} Block {cat}</span>
              </button>
            );
          })}

          {/* Eco toggle */}
          <button
            type="button"
            onClick={toggleEcoConscious}
            className={`px-2 py-0.5 rounded text-[11px] font-mono transition-all cursor-pointer flex items-center gap-1 border ${
              constraints.ecoConsciousOnly
                ? 'bg-emerald-900/60 text-emerald-200 border-emerald-600 font-semibold shadow-xs'
                : 'bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200 border-zinc-800 hover:border-zinc-700'
            }`}
          >
            <span>{constraints.ecoConsciousOnly ? '✓' : '+'} Eco-Only</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ActiveGuardrailsBar;
