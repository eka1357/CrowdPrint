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
  const rankColors =
    rank === 1
      ? 'from-emerald-500/20 via-emerald-500/10 to-transparent border-[#10B981]/50 text-[#10B981]'
      : rank === 2
      ? 'from-teal-500/20 via-teal-500/10 to-transparent border-teal-500/40 text-teal-400'
      : rank === 3
      ? 'from-cyan-500/20 via-cyan-500/10 to-transparent border-cyan-500/30 text-cyan-400'
      : 'from-slate-500/10 via-transparent to-transparent border-white/10 text-slate-400';

  return (
    <div
      className={`rounded-2xl border transition-all duration-300 relative overflow-hidden bg-[#11131C] ${
        isTopThree
          ? 'border-white/[0.14] hover:border-[#10B981]/60 shadow-xl shadow-black/40'
          : 'border-white/[0.08] hover:border-white/20'
      }`}
    >
      {/* Top Gradient Highlight */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${rankColors}`} />

      <div className="p-5 sm:p-6">
        {/* Header Row: Rank, Brand, Categories, Affinity Score */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-start gap-3">
            {/* Rank Badge */}
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center font-mono font-extrabold text-base border shrink-0 bg-[#090A0F] ${rankColors}`}
            >
              #{rank}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-bold text-white tracking-tight">{sponsor.name}</h3>
                {isTopThree && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 flex items-center gap-1 font-semibold">
                    <Sparkles className="w-2.5 h-2.5" />
                    Top Match
                  </span>
                )}
              </div>

              {/* Canonical Entity URN */}
              <div className="text-[11px] font-mono text-slate-400 truncate max-w-sm sm:max-w-md mt-0.5">
                {sponsor.entityId}
              </div>

              {/* Categories */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {sponsor.categories.map((cat) => (
                  <span
                    key={cat}
                    className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/[0.04] text-slate-300 border border-white/[0.06]"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Qloo Affinity Score Readout */}
          <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-2 sm:pt-0 border-white/[0.06] shrink-0">
            <div className="text-right">
              <div className="text-2xl font-black font-mono text-[#10B981] tracking-tight">
                {sponsor.affinityScore.toFixed(1)}%
              </div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-[#10B981]" />
                Qloo Affinity
              </div>
            </div>

            {/* Score Bar */}
            <div className="w-28 h-1.5 bg-black/40 rounded-full overflow-hidden mt-1.5 border border-white/5">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-[#10B981] rounded-full"
                style={{ width: `${Math.min(100, sponsor.affinityScore)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Description */}
        {sponsor.description && (
          <p className="text-xs text-slate-300 leading-relaxed mb-4">
            {sponsor.description}
          </p>
        )}

        {/* Shared Taste Signals Pills (Qloo Grounded) */}
        {sponsor.sharedTags && sponsor.sharedTags.length > 0 && (
          <div className="mb-4">
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <Tag className="w-3 h-3 text-[#10B981]" />
              Shared Taste Signals with Lineup:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {sponsor.sharedTags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2.5 py-1 rounded-lg badge-qloo font-mono flex items-center gap-1"
                >
                  <span className="text-[#10B981]">•</span>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Card Footer Controls */}
        <div className="flex items-center justify-between pt-3 border-t border-white/[0.06] text-xs">
          {/* Inspect Evidence Button */}
          <button
            onClick={() => onInspectEvidence(sponsor)}
            className="flex items-center gap-1.5 text-slate-400 hover:text-[#10B981] font-mono text-xs transition-colors cursor-pointer py-1"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
            <span>Inspect Evidence Trail</span>
            <ExternalLink className="w-3 h-3" />
          </button>

          {/* Toggle Activations & Pitch Email */}
          {sponsor.activations && sponsor.activations.length > 0 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 font-medium transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{isExpanded ? 'Hide' : 'View'} Activations & Pitch</span>
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>

        {/* Expandable Activations & Pitch Email Section */}
        {isExpanded && sponsor.activations && sponsor.activations.length > 0 && (
          <div className="mt-4 pt-4 border-t border-white/[0.08] space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Activations List */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Proposed On-Site Activations
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  Strict Attribution: Signal vs Creative
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {sponsor.activations.map((act) => (
                  <div
                    key={act.id}
                    className="p-3.5 rounded-xl bg-[#090A0F] border border-white/[0.06] hover:border-white/10 transition-colors flex flex-col justify-between"
                  >
                    <div>
                      <div className="font-semibold text-xs text-white mb-2">{act.title}</div>

                      {/* Qloo Signal Badge */}
                      <div className="mb-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded badge-qloo inline-flex items-center gap-1">
                          <span>[Qloo Signal]:</span> {act.qlooSignalCited}
                        </span>
                      </div>

                      {/* Creative Extension Badge & Text */}
                      <div className="text-xs text-slate-300 leading-relaxed mb-3">
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded badge-llm inline-block mr-1">
                          [Creative Suggestion]
                        </span>
                        {act.creativeExtension}
                      </div>
                    </div>

                    {/* Zone & Reach Footer */}
                    <div className="flex items-center justify-between pt-2 border-t border-white/[0.04] text-[10px] font-mono text-slate-500">
                      {act.suggestedZone && <span>📍 {act.suggestedZone}</span>}
                      {act.estimatedReach && <span>👥 {act.estimatedReach}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Outreach Pitch Email */}
            {sponsor.pitchEmail && (
              <div className="p-4 rounded-xl bg-[#090A0F] border border-white/[0.06]">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-[#10B981]" />
                    <span className="text-xs font-mono font-bold text-slate-300">
                      Target Outreach Pitch Email
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      To: {sponsor.pitchEmail.targetPersona}
                    </span>
                  </div>

                  {/* 1-Click Copy Pitch Email Button */}
                  <button
                    onClick={copyPitchEmail}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#10B981]/15 hover:bg-[#10B981]/25 text-[#10B981] text-xs font-mono font-medium transition-colors cursor-pointer"
                  >
                    {copiedEmail ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
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

                <div className="text-xs font-mono text-slate-400 mb-2">
                  <span className="text-slate-500">Subject: </span>
                  <span className="text-white font-medium">{sponsor.pitchEmail.subjectLine}</span>
                </div>

                <div className="bg-[#050608] p-3 rounded-lg border border-white/5 font-mono text-xs text-slate-300 whitespace-pre-line leading-relaxed max-h-48 overflow-y-auto">
                  {sponsor.pitchEmail.emailBody}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
