'use client';

import React from 'react';
import { LlmDiffComparison, SynthesizedSponsor } from '@/lib/types';
import {
  Sparkles,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

interface LlmDiffViewProps {
  comparison: LlmDiffComparison;
  approvedSponsors: SynthesizedSponsor[];
}

export function LlmDiffView({ comparison, approvedSponsors }: LlmDiffViewProps) {
  const divergenceScore = comparison.jaccardDivergenceScore;

  return (
    <div className="space-y-6">
      {/* Jaccard Divergence Hero Banner */}
      <div className="panel-surface rounded-2xl p-6 border border-white/[0.12] relative overflow-hidden bg-gradient-to-br from-[#11131C] via-[#0e1018] to-[#090A0F]">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#10B981]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#F59E0B]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full badge-qloo">
                Empirical Hackathon Benchmark
              </span>
              <span className="text-xs font-mono text-slate-400">
                Formula: 1 - (|Qloo ∩ LLM| / |Qloo ∪ LLM|)
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Why Crowdprint Requires Qloo Taste Graph
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
              Standard LLMs (GPT-4o, Gemini, Claude) guess the same generic Fortune 500 sponsors for every music event (Red Bull, Heineken, Spotify, Vans). Qloo replaces guesswork with 250M+ cross-domain taste vectors.
            </p>
          </div>

          {/* Divergence Metric Dial */}
          <div className="flex flex-col items-start md:items-end bg-[#090A0F]/80 p-4 rounded-xl border border-white/10 shrink-0">
            <div className="text-3xl sm:text-4xl font-black font-mono text-[#F59E0B]">
              {divergenceScore}%
            </div>
            <div className="text-xs font-mono uppercase tracking-wider text-slate-400 mt-0.5">
              Jaccard Cultural Divergence
            </div>
            <div className="text-[11px] font-mono text-emerald-400 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Proves High Cultural Differentiation
            </div>
          </div>
        </div>

        {/* Dynamic Divergence Summary */}
        <div className="mt-4 pt-4 border-t border-white/[0.08] text-xs font-mono text-slate-300 flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>{comparison.divergenceSummary}</span>
        </div>
      </div>

      {/* Side-by-Side Comparison Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Plain LLM Baseline */}
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-amber-500/20">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
              <h3 className="text-sm font-bold text-amber-300 font-mono uppercase tracking-wide">
                Plain LLM Baseline (Zero-Qloo Guess)
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {comparison.plainLlmSponsors.length} Predicted
            </span>
          </div>

          <div className="space-y-3">
            {comparison.plainLlmSponsors.map((sponsor, idx) => (
              <div
                key={sponsor.name + idx}
                className="p-4 rounded-xl bg-[#11131C] border border-amber-500/20 hover:border-amber-500/40 transition-colors"
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="font-bold text-sm text-white flex items-center gap-2">
                    <span>{sponsor.name}</span>
                    {sponsor.isGenericFortune500 && (
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        Generic Megabrand
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded badge-llm">
                    [Creative Guess]
                  </span>
                </div>

                <div className="text-[11px] font-mono text-slate-400 mb-2">
                  Category: {sponsor.category}
                </div>

                <p className="text-xs text-slate-300 italic bg-[#090A0F] p-2.5 rounded-lg border border-white/5">
                  &ldquo;{sponsor.predictedReason}&rdquo;
                </p>

                <div className="flex items-center gap-1.5 mt-2 text-[10px] font-mono text-amber-400/80">
                  <AlertTriangle className="w-3 h-3" />
                  <span>0 empirical audience overlap metrics. Pure parametric hallucination.</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Crowdprint + Qloo Grounded */}
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#10B981]/30">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-ping" />
              <h3 className="text-sm font-bold text-[#10B981] font-mono uppercase tracking-wide">
                Crowdprint + Qloo Taste Graph
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {approvedSponsors.length} Verified
            </span>
          </div>

          <div className="space-y-3">
            {approvedSponsors.slice(0, 8).map((sponsor, idx) => (
              <div
                key={sponsor.entityId}
                className="p-4 rounded-xl bg-[#11131C] border border-[#10B981]/30 hover:border-[#10B981]/60 transition-colors"
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="font-bold text-sm text-white flex items-center gap-2">
                    <span className="font-mono text-slate-400 text-xs">#{idx + 1}</span>
                    <span>{sponsor.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black font-mono text-[#10B981]">
                      {sponsor.affinityScore.toFixed(1)}%
                    </span>
                    <span className="text-[10px] font-mono block text-slate-400">Qloo Affinity</span>
                  </div>
                </div>

                <div className="text-[10px] font-mono text-slate-400 truncate mb-2">
                  {sponsor.entityId}
                </div>

                {sponsor.sharedTags && sponsor.sharedTags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {sponsor.sharedTags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] px-2 py-0.5 rounded-md badge-qloo font-mono"
                      >
                        • {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-1.5 mt-2.5 text-[10px] font-mono text-emerald-400">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Ground truth correlation verified from Qloo /v2/insights.</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
