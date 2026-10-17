'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SynthesizedSponsor } from '@/lib/types';
import {
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Mail,
  Copy,
  Check,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import SpotlightCard from '@/components/ui/SpotlightCard';
import { CountUp } from '@/components/ui/CountUp';

interface SponsorCardProps {
  sponsor: SynthesizedSponsor;
  rank: number;
  onInspectEvidence: (sponsor: SynthesizedSponsor) => void;
}

export function SponsorCard({ sponsor, rank, onInspectEvidence }: SponsorCardProps) {
  // Collapsed by default so #1, #2, #3 are immediately visible above the fold
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [copiedEmail, setCopiedEmail] = useState<boolean>(false);

  const copyPitchEmail = () => {
    if (!sponsor.pitchEmail) return;
    const fullText = `Subject: ${sponsor.pitchEmail.subjectLine}\n\n${sponsor.pitchEmail.emailBody}`;
    navigator.clipboard.writeText(fullText);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const formattedRank = `#${String(rank).padStart(2, '0')}`;
  const sharedTags = sponsor.sharedTags?.slice(0, 4) || [];

  return (
    <SpotlightCard
      theme="dark"
      spotlightColor="rgba(255, 255, 255, 0.08)"
      intensity={0.2}
      className={`rounded-2xl border transition-all duration-300 relative overflow-hidden !p-0 ${
        rank === 1
          ? '!bg-zinc-900/90 !border-zinc-700 shadow-xl'
          : rank <= 3
          ? '!bg-zinc-950/90 !border-zinc-800 hover:!border-zinc-700/80 shadow-lg'
          : '!bg-zinc-950/70 !border-zinc-850 hover:!border-zinc-750'
      }`}
    >
      {/* Subtle top edge highlight */}
      <div
        className={`absolute top-0 left-0 right-0 h-[2px] ${
          rank === 1
            ? 'bg-gradient-to-r from-emerald-500/80 via-teal-400 to-emerald-500/80'
            : rank <= 3
            ? 'bg-zinc-700/60'
            : 'bg-zinc-800/40'
        }`}
      />

      <div className="p-4 sm:p-5">
        {/* Main Header Row: Rank, Brand info, Tags, Affinity Score */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5 min-w-0">
            {/* Rank Badge */}
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center font-mono font-bold text-xs border shrink-0 ${
                rank === 1
                  ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60 shadow-xs'
                  : rank === 2
                  ? 'bg-zinc-900 text-teal-400 border-zinc-800'
                  : rank === 3
                  ? 'bg-zinc-900 text-cyan-400 border-zinc-800'
                  : 'bg-zinc-900 text-zinc-400 border-zinc-800'
              }`}
            >
              {formattedRank}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-bold text-zinc-100 tracking-tight truncate">
                  {sponsor.name}
                </h3>
                {rank === 1 && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 font-semibold shrink-0">
                    Primary Match
                  </span>
                )}
                {/* Category chip */}
                {sponsor.categories[0] && (
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800 truncate">
                    {sponsor.categories[0]}
                  </span>
                )}
              </div>

              {/* Shared Qloo Taste Tags (max 4 subtle zinc chips) */}
              {sharedTags.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <span className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider">
                    Signals:
                  </span>
                  {sharedTags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-900/80 text-zinc-300 border border-zinc-800/80 flex items-center gap-1"
                    >
                      <span className="text-emerald-400/80">•</span>
                      {tag}
                    </span>
                  ))}
                  {sponsor.sharedTags && sponsor.sharedTags.length > 4 && (
                    <span className="text-[10px] font-mono text-zinc-500">
                      +{sponsor.sharedTags.length - 4} more
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Qloo Affinity Score Readout + Score Bar */}
          <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-2.5 sm:pt-0 border-zinc-800/80 shrink-0">
            <div className="text-right">
              <div className="text-2xl font-black font-mono text-emerald-400 tracking-tight">
                <CountUp to={sponsor.affinityScore} decimals={1} suffix="%" duration={1.2} />
              </div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1 justify-end">
                <TrendingUp className="w-3 h-3 text-emerald-400" />
                Qloo Affinity
              </div>
            </div>

            {/* Score Bar */}
            <div className="w-28 h-1.5 bg-zinc-900 rounded-full overflow-hidden mt-1.5 border border-zinc-800">
              <div
                className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full"
                style={{ width: `${Math.min(100, sponsor.affinityScore)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card Footer Actions: Inspect Evidence & View Activations & Pitch */}
        <div className="flex items-center justify-between pt-3 mt-3 border-t border-zinc-850/80 text-xs">
          {/* Inspect Evidence Button */}
          <button
            type="button"
            onClick={() => onInspectEvidence(sponsor)}
            className="flex items-center gap-1.5 text-zinc-400 hover:text-white font-mono text-xs transition-colors cursor-pointer py-1 group"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
            <span>Inspect Evidence</span>
            <ExternalLink className="w-3 h-3 opacity-60 group-hover:opacity-100" />
          </button>

          {/* View Activations & Pitch Button (Clean Chevron on the right, no yellow sparkles) */}
          {sponsor.activations && sponsor.activations.length > 0 && (
            <button
              id={`toggle-activations-${rank}`}
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium font-mono border transition-all cursor-pointer ${
                isExpanded
                  ? 'bg-zinc-800 text-white border-zinc-600'
                  : 'bg-zinc-900 hover:bg-zinc-850 text-zinc-300 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <span>{isExpanded ? 'Hide' : 'View'} Activations & Pitch</span>
              {isExpanded ? (
                <ChevronUp className="w-3.5 h-3.5 text-zinc-400" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
              )}
            </button>
          )}
        </div>

        {/* Expandable Activations & Pitch Section */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-zinc-800 space-y-4 animate-in fade-in duration-200">
            {/* Description */}
            {sponsor.description && (
              <p className="text-xs text-zinc-300 leading-relaxed bg-zinc-900/40 p-3 rounded-xl border border-zinc-800/80">
                {sponsor.description}
              </p>
            )}

            {/* Activations List */}
            {sponsor.activations && sponsor.activations.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                    Proposed On-Site Activations
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500">
                    Strict Attribution: Signal vs Creative
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {sponsor.activations.map((act) => (
                    <div
                      key={act.id}
                      className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition-colors flex flex-col justify-between"
                    >
                      <div>
                        <div className="font-semibold text-xs text-zinc-100 mb-1.5">{act.title}</div>

                        {/* Qloo Signal Badge */}
                        <div className="mb-2">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-400 border border-emerald-800/40 inline-flex items-center gap-1">
                            <span>[Qloo Signal]:</span> {act.qlooSignalCited}
                          </span>
                        </div>

                        <p className="text-xs text-zinc-300 leading-relaxed mb-2.5">
                          {act.creativeExtension}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between text-[11px] font-mono text-zinc-400">
                        <span>Reach: {act.estimatedReach || 'High Impact'}</span>
                        <span className="text-emerald-400">{act.suggestedZone || 'VIP Lounge & On-Site'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pitch Email Section */}
            {sponsor.pitchEmail && (
              <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-300">
                      Tailored Pitch Email Draft
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={copyPitchEmail}
                    className="flex items-center gap-1 text-xs font-mono px-2.5 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors cursor-pointer"
                  >
                    {copiedEmail ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy Email</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="text-xs font-mono text-zinc-400 mb-2">
                  Subject: <span className="text-zinc-200 font-semibold">{sponsor.pitchEmail.subjectLine}</span>
                </div>

                <pre className="text-xs font-mono text-zinc-300 whitespace-pre-wrap bg-zinc-950 p-3 rounded-lg border border-zinc-800/80 leading-relaxed max-h-48 overflow-y-auto">
                  {sponsor.pitchEmail.emailBody}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </SpotlightCard>
  );
}

export default SponsorCard;
