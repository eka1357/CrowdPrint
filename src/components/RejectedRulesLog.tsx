'use client';

import React from 'react';
import { CommercialRuleRejection } from '@/lib/types';
import {
  ShieldAlert,
  Ban,
  CheckCircle2,
  Scale,
} from 'lucide-react';

interface RejectedRulesLogProps {
  rejections: CommercialRuleRejection[];
}

export function RejectedRulesLog({ rejections }: RejectedRulesLogProps) {
  if (!rejections || rejections.length === 0) {
    return (
      <div className="rounded-2xl p-8 border border-zinc-800 bg-zinc-950/80 text-center">
        <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-3">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-white">0 Commercial Conflicts Detected</h3>
        <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto">
          All high-affinity Qloo candidates satisfied the event&apos;s commercial guidelines, category exclusivity, and venue restrictions.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Audit Log Header Banner */}
      <div className="rounded-2xl p-6 border border-zinc-800 bg-zinc-950/90 shadow-xl backdrop-blur-md">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 text-red-400 flex items-center justify-center shrink-0">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-zinc-900 text-red-400 border border-red-900/40">
                Deterministic Rules Engine
              </span>
              <span className="text-xs font-mono text-zinc-400">
                Pure TypeScript Execution (Zero LLM Delegation)
              </span>
            </div>
            <h2 className="text-xl font-bold text-zinc-100 tracking-tight">
              Commercial Rule Interceptions & Audit Trail
            </h2>
            <p className="text-xs text-zinc-300 mt-1.5 leading-relaxed">
              In real-world live entertainment, cultural taste is useless without hard business compliance. Promoters sign exclusive footwear deals, venues enforce alcohol age limits, and eco-festivals ban fast fashion. These high-affinity Qloo brands were intercepted deterministically by <code className="font-mono text-emerald-400 bg-zinc-900 px-1 py-0.5 rounded border border-zinc-800">src/lib/rules.ts</code>:
            </p>
          </div>
        </div>
      </div>

      {/* Rejections List */}
      <div className="space-y-3">
        {rejections.map((item, idx) => {
          const reasonBadgeColor =
            item.reasonCode === 'CATEGORY_EXCLUSION'
              ? 'bg-zinc-900 text-red-400 border-red-900/40'
              : item.reasonCode === 'COMPETITOR_LOCK'
              ? 'bg-zinc-900 text-purple-400 border-purple-900/40'
              : item.reasonCode === 'AGE_RESTRICTION'
              ? 'bg-zinc-900 text-amber-400 border-amber-900/40'
              : 'bg-zinc-900 text-rose-400 border-rose-900/40';

          return (
            <div
              key={item.brand.entityId + idx}
              className="p-5 rounded-2xl bg-zinc-950/70 border border-zinc-800/90 hover:border-zinc-700 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-zinc-900 text-red-400 border border-zinc-800 flex items-center justify-center shrink-0">
                    <Ban className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-base text-zinc-100 truncate">{item.brand.name}</h3>
                    <div className="text-[11px] font-mono text-zinc-400 truncate max-w-sm">
                      {item.brand.entityId}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                  <span
                    className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${reasonBadgeColor}`}
                  >
                    {item.reasonCode.replace(/_/g, ' ')}
                  </span>
                  <div className="text-right pl-2 border-l border-zinc-800">
                    <span className="text-sm font-bold font-mono text-zinc-300">
                      {item.brand.affinityScore.toFixed(1)}%
                    </span>
                    <span className="text-[10px] font-mono block text-zinc-400">
                      Raw Qloo Score
                    </span>
                  </div>
                </div>
              </div>

              {/* Rule Triggered Notice */}
              <div className="bg-zinc-900/60 p-3 rounded-xl border border-zinc-800 mt-3">
                <div className="text-[11px] font-mono text-red-400 font-semibold mb-1 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  {item.ruleTriggered}
                </div>
                <p className="text-xs text-zinc-300 font-mono leading-relaxed">
                  {item.explanation}
                </p>
              </div>

              {/* Brand Categories Pill */}
              <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-zinc-800/60">
                <span className="text-[10px] font-mono text-zinc-400 self-center">
                  Brand Categories:
                </span>
                {item.brand.categories.map((c) => (
                  <span
                    key={c}
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default RejectedRulesLog;
