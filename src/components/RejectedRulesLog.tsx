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
      <div className="panel-surface rounded-2xl p-8 border border-white/[0.08] text-center">
        <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-[#10B981] flex items-center justify-center mx-auto mb-3">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-white">0 Commercial Conflicts Detected</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
          All high-affinity Qloo candidates satisfied the event&apos;s commercial guidelines, category exclusivity, and venue restrictions.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Audit Log Header Banner */}
      <div className="panel-surface rounded-2xl p-6 border border-red-500/20 bg-gradient-to-br from-[#11131C] via-[#140e11] to-[#090A0F]">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 flex items-center justify-center shrink-0">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded badge-reject">
                Deterministic Rules Engine
              </span>
              <span className="text-xs font-mono text-slate-400">
                Pure TypeScript Execution (Zero LLM Delegation)
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Commercial Rule Interceptions & Audit Trail
            </h2>
            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
              In real-world live entertainment, cultural taste is useless without hard business compliance. Promoters sign exclusive footwear deals, venues enforce alcohol age limits, and eco-festivals ban fast fashion. These high-affinity Qloo brands were intercepted deterministically by <code className="font-mono text-[#10B981] bg-white/5 px-1 rounded">src/lib/rules.ts</code>:
            </p>
          </div>
        </div>
      </div>

      {/* Rejections List */}
      <div className="space-y-3">
        {rejections.map((item, idx) => {
          const reasonBadgeColor =
            item.reasonCode === 'CATEGORY_EXCLUSION'
              ? 'bg-red-500/15 text-red-400 border-red-500/30'
              : item.reasonCode === 'COMPETITOR_LOCK'
              ? 'bg-purple-500/15 text-purple-400 border-purple-500/30'
              : item.reasonCode === 'AGE_RESTRICTION'
              ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
              : 'bg-rose-500/15 text-rose-400 border-rose-500/30';

          return (
            <div
              key={item.brand.entityId + idx}
              className="p-5 rounded-2xl bg-[#11131C] border border-red-500/20 hover:border-red-500/40 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center shrink-0">
                    <Ban className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-white">{item.brand.name}</h3>
                    <div className="text-[11px] font-mono text-slate-400 truncate max-w-sm">
                      {item.brand.entityId}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span
                    className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${reasonBadgeColor}`}
                  >
                    {item.reasonCode.replace(/_/g, ' ')}
                  </span>
                  <div className="text-right pl-2 border-l border-white/10">
                    <span className="text-sm font-bold font-mono text-slate-300">
                      {item.brand.affinityScore.toFixed(1)}%
                    </span>
                    <span className="text-[10px] font-mono block text-slate-500">
                      Raw Qloo Score
                    </span>
                  </div>
                </div>
              </div>

              {/* Rule Triggered Notice */}
              <div className="bg-[#090A0F] p-3 rounded-xl border border-white/[0.06] mt-3">
                <div className="text-[11px] font-mono text-red-400 font-semibold mb-1 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  {item.ruleTriggered}
                </div>
                <p className="text-xs text-slate-300 font-mono leading-relaxed">
                  {item.explanation}
                </p>
              </div>

              {/* Brand Categories Pill */}
              <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-white/[0.04]">
                <span className="text-[10px] font-mono text-slate-500 self-center">
                  Brand Categories:
                </span>
                {item.brand.categories.map((c) => (
                  <span
                    key={c}
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.03] text-slate-400 border border-white/[0.06]"
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
