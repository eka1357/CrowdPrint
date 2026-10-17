'use client';

import React, { useState } from 'react';
import { SynthesizedSponsor } from '@/lib/types';
import {
  Sparkles,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Mail,
  Copy,
  Check,
  Tag,
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
  const [isExpanded, setIsExpanded] = useState(rank <= 2);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const copyPitchEmail = () => {
    if (!sponsor.pitchEmail) return;
    const fullText = `Subject: ${sponsor.pitchEmail.subjectLine}\n\n${sponsor.pitchEmail.emailBody}`;
    navigator.clipboard.writeText(fullText);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const isTopThree = rank <= 3;

  return (
    <SpotlightCard
      theme="dark"
      spotlightColor="rgba(255, 255, 255, 0.08)"
      intensity={0.2}
      className={`rounded-2xl border transition-all duration-300 relative overflow-hidden !p-0 ${
        rank === 1
          ? '!bg-zinc-900/90 !border-zinc-700 shadow-xl'
          : isTopThree
          ? '!bg-zinc-950/90 !border-zinc-800 hover:!border-zinc-700/80 shadow-lg'
          : '!bg-zinc-950/70 !border-zinc-800/60 hover:!border-zinc-700/60'
      }`}
    >
      {/* Subtle top edge highlight */}
      <div
        className={`absolute top-0 left-0 right-0 h-[2px] ${
          rank === 1
            ? 'bg-gradient-to-r from-emerald-500/60 via-zinc-400 to-emerald-500/60'
            : isTopThree
            ? 'bg-zinc-700/60'
            : 'bg-zinc-800/40'
        }`}
      />

      <div className="p-5 sm:p-6">
        {/* Header Row: Rank, Brand, Categories, Affinity Score */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-start gap-3 min-w-0">
            {/* Rank Badge */}
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center font-mono font-bold text-sm border shrink-0 ${
                rank === 1
                  ? 'bg-zinc-800 text-emerald-400 border-zinc-700 shadow-xs'
                  : rank === 2
                  ? 'bg-zinc-900 text-teal-400 border-zinc-800'
                  : rank === 3
                  ? 'bg-zinc-900 text-cyan-400 border-zinc-800'
                  : 'bg-zinc-900 text-zinc-400 border-zinc-800'
              }`}
            >
              #{rank}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-bold text-zinc-100 tracking-tight truncate">
                  {sponsor.name}
                </h3>
                {isTopThree && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700 flex items-center gap-1 font-semibold shrink-0">
                    <Sparkles className="w-2.5 h-2.5 text-emerald-400" />
                    Top Match
                  </span>
                )}
              </div>

              {/* Canonical Entity URN */}
              <div className="text-[11px] font-mono text-zinc-400 truncate max-w-sm sm:max-w-md mt-0.5">
                {sponsor.entityId}
              </div>

              {/* Categories */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {sponsor.categories.map((cat) => (
                  <span
                    key={cat}
                    className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-800"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Qloo Affinity Score Readout with React Bits CountUp */}
          <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-2 sm:pt-0 border-zinc-800/80 shrink-0">
            <div className="text-right">
              <div className="text-2xl font-black font-mono text-emerald-400 tracking-tight">
                <CountUp to={sponsor.affinityScore} decimals={1} suffix="%" duration={1.2} />
              </div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1">
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

        {/* Description */}
        {sponsor.description && (
          <p className="text-xs text-zinc-300 leading-relaxed mb-4">
            {sponsor.description}
          </p>
        )}

        {/* Shared Taste Signals Pills (Qloo Grounded) */}
        {sponsor.sharedTags && sponsor.sharedTags.length > 0 && (
          <div className="mb-4">
            <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-2 flex items-center gap-1.5">
              <Tag className="w-3 h-3 text-emerald-400" />
              Shared Taste Signals with Lineup:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {sponsor.sharedTags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2.5 py-1 rounded-lg bg-zinc-900 text-zinc-300 border border-zinc-800 font-mono flex items-center gap-1.5"
                >
                  <span className="text-emerald-400">•</span>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Card Footer Controls */}
        <div className="flex items-center justify-between pt-3 border-t border-zinc-800/60 text-xs">
          {/* Inspect Evidence Button */}
          <button
            onClick={() => onInspectEvidence(sponsor)}
            className="flex items-center gap-1.5 text-zinc-400 hover:text-white font-mono text-xs transition-colors cursor-pointer py-1"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Inspect Evidence Trail</span>
            <ExternalLink className="w-3 h-3 opacity-60" />
          </button>

          {/* Toggle Activations & Pitch Email */}
          {sponsor.activations && sponsor.activations.length > 0 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-200 font-medium border border-zinc-800 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{isExpanded ? 'Hide' : 'View'} Activations & Pitch</span>
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>

        {/* Expandable Activations & Pitch Email Section */}
        {isExpanded && sponsor.activations && sponsor.activations.length > 0 && (
          <div className="mt-4 pt-4 border-t border-zinc-800/80 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Activations List */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
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
                      <div className="font-semibold text-xs text-zinc-100 mb-2">{act.title}</div>

                      {/* Qloo Signal Badge */}
                      <div className="mb-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-400 border border-emerald-800/40 inline-flex items-center gap-1">
                          <span>[Qloo Signal]:</span> {act.qlooSignalCited}
                        </span>
                      </div>

                      {/* Creative Extension Badge & Text */}
                      <div className="text-xs text-zinc-300 leading-relaxed mb-3">
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-950/40 text-amber-400 border border-amber-800/40 inline-block mr-1">
                          [Creative Suggestion]
                        </span>
                        {act.creativeExtension}
                      </div>
                    </div>

                    {/* Zone & Reach Footer */}
                    <div className="flex items-center justify-between pt-2 border-t border-zinc-800/40 text-[10px] font-mono text-zinc-500">
                      {act.suggestedZone && <span>📍 {act.suggestedZone}</span>}
                      {act.estimatedReach && <span>👥 {act.estimatedReach}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Outreach Pitch Email */}
            {sponsor.pitchEmail && (
              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-xs font-mono font-bold text-zinc-200">
                      Target Outreach Pitch Email
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500">
                      To: {sponsor.pitchEmail.targetPersona}
                    </span>
                  </div>

                  {/* 1-Click Copy Pitch Email Button */}
                  <button
                    onClick={copyPitchEmail}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono font-medium border border-zinc-700 transition-colors cursor-pointer"
                  >
                    {copiedEmail ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Pitch Email</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="text-xs font-mono text-zinc-400 mb-2">
                  <span className="text-zinc-500">Subject: </span>
                  <span className="text-zinc-200 font-medium">{sponsor.pitchEmail.subjectLine}</span>
                </div>

                <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800/80 font-mono text-xs text-zinc-300 whitespace-pre-line leading-relaxed max-h-48 overflow-y-auto">
                  {sponsor.pitchEmail.emailBody}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </SpotlightCard>
  );
}

export default SponsorCard;
