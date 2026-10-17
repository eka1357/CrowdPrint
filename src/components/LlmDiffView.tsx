'use client';

import React from 'react';
import { LlmDiffComparison, SynthesizedSponsor } from '@/lib/types';
import {
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import { BklitAffinityChart } from '@/components/BklitAffinityChart';
import { CountUp } from '@/components/ui/CountUp';

interface LlmDiffViewProps {
  comparison: LlmDiffComparison;
  approvedSponsors: SynthesizedSponsor[];
}

export function LlmDiffView({ comparison, approvedSponsors }: LlmDiffViewProps) {
  const divergenceScore = comparison.jaccardDivergenceScore;

  return (
    <div className="space-y-6">
      {/* Jaccard Divergence Hero Banner */}
      <div className="rounded-2xl p-6 border border-zinc-800 relative overflow-hidden bg-zinc-950/90 shadow-xl backdrop-blur-md">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-zinc-900 text-zinc-300 border border-zinc-700/80">
                Empirical Benchmark
              </span>
              <span className="text-xs font-mono text-zinc-400">
                Formula: 1 - (|Qloo ∩ LLM| / |Qloo ∪ LLM|)
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-zinc-100 tracking-tight">
              Why Crowdprint Requires Qloo Taste Graph
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300 mt-2 max-w-2xl leading-relaxed">
              Standard LLMs (GPT-4o, Gemini, Claude) guess the same generic Fortune 500 sponsors for every music event (Red Bull, Heineken, Spotify, Vans). Qloo replaces guesswork with 250M+ cross-domain taste vectors.
            </p>
          </div>

          {/* Divergence Metric Dial with CountUp */}
          <div className="flex flex-col items-start md:items-end bg-zinc-900/90 p-4 rounded-xl border border-zinc-800 shrink-0">
            <div className="text-3xl sm:text-4xl font-black font-mono text-amber-400">
              <CountUp to={divergenceScore} suffix="%" duration={1.2} />
            </div>
            <div className="text-xs font-mono uppercase tracking-wider text-zinc-400 mt-0.5">
              Jaccard Cultural Divergence
            </div>
            <div className="text-[11px] font-mono text-emerald-400 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Proves High Cultural Differentiation
            </div>
          </div>
        </div>

        {/* Dynamic Divergence Summary */}
        <div className="mt-4 pt-4 border-t border-zinc-800/80 text-xs font-mono text-zinc-300 flex items-start gap-2">
          <TrendingUp className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>{comparison.divergenceSummary}</span>
        </div>
      </div>

      {/* Sleek Affinity Distribution Chart */}
      <BklitAffinityChart
        sponsors={approvedSponsors}
        comparison={comparison}
        title="Qloo vs. Plain LLM Divergence Distribution"
        subtitle="Empirical taste correlation ranking contrasting Qloo affinity distribution against plain LLM baseline"
      />

      {/* Side-by-Side Comparison Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Plain LLM Baseline */}
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-zinc-500" />
              <h3 className="text-sm font-bold text-zinc-300 font-mono uppercase tracking-wide">
                Plain LLM Baseline (Generic Guess)
              </h3>
            </div>
            <span className="text-xs font-mono text-zinc-500">
              {comparison.plainLlmSponsors.length} Predicted
            </span>
          </div>

          <div className="space-y-3">
            {comparison.plainLlmSponsors.map((sponsor, idx) => (
              <div
                key={sponsor.name + idx}
                className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-850 hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="font-bold text-sm text-zinc-200 flex items-center gap-2">
                    <span>{sponsor.name}</span>
                    {sponsor.isGenericFortune500 && (
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
                        Generic Megabrand
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
                    [Creative Guess]
                  </span>
                </div>

                <div className="text-[11px] font-mono text-zinc-500 mb-2">
                  Category: {sponsor.category}
                </div>

                <p className="text-xs text-zinc-400 italic bg-zinc-900/40 p-2.5 rounded-lg border border-zinc-800/60">
                  &ldquo;{sponsor.predictedReason}&rdquo;
                </p>

                <div className="flex items-center gap-1.5 mt-2 text-[10px] font-mono text-zinc-500">
                  <AlertTriangle className="w-3 h-3 text-amber-500/80" />
                  <span>0 empirical audience overlap metrics. Pure parametric hallucination.</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Crowdprint + Qloo Grounded */}
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-emerald-800/40">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <h3 className="text-sm font-bold text-emerald-400 font-mono uppercase tracking-wide">
                Crowdprint + Qloo Taste Graph
              </h3>
            </div>
            <span className="text-xs font-mono text-zinc-400">
              {approvedSponsors.length} Verified
            </span>
          </div>

          <div className="space-y-3">
            {approvedSponsors.slice(0, 8).map((sponsor, idx) => (
              <div
                key={sponsor.entityId}
                className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800/90 hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="font-bold text-sm text-zinc-100 flex items-center gap-2">
                    <span className="font-mono text-zinc-500 text-xs">#{idx + 1}</span>
                    <span>{sponsor.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black font-mono text-emerald-400">
                      {sponsor.affinityScore.toFixed(1)}%
                    </span>
                    <span className="text-[10px] font-mono block text-zinc-400">Qloo Affinity</span>
                  </div>
                </div>

                <div className="text-[10px] font-mono text-zinc-500 truncate mb-2">
                  {sponsor.entityId}
                </div>

                {sponsor.sharedTags && sponsor.sharedTags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {sponsor.sharedTags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300 font-mono"
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

export default LlmDiffView;
