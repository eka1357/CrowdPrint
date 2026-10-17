'use client';

import React, { useState } from 'react';
import {
  EventBrief,
  QlooCallTrace,
  ResolvedArtist,
} from '@/lib/types';
import {
  Activity,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Layers,
  Clock,
  Sparkles,
  ShieldCheck,
  Tag,
  Search,
} from 'lucide-react';

interface AgentTracePaneProps {
  brief: EventBrief;
  resolvedArtists: ResolvedArtist[];
  traces: QlooCallTrace[];
  tasteTags: string[];
  totalRejectedCount: number;
  jaccardDivergenceScore: number;
  executionDurationMs: number;
}

export function AgentTracePane({
  brief,
  resolvedArtists,
  traces,
  tasteTags,
  totalRejectedCount,
  jaccardDivergenceScore,
  executionDurationMs,
}: AgentTracePaneProps) {
  const [expandedTraceId, setExpandedTraceId] = useState<string | null>(null);

  const toggleTrace = (id: string) => {
    setExpandedTraceId(expandedTraceId === id ? null : id);
  };

  const totalEntitiesRetrieved = traces.reduce((acc, t) => acc + (t.entitiesReturned || 0), 0);

  return (
    <aside className="space-y-4">
      {/* Active Brief Summary Card */}
      <div className="panel-surface rounded-xl p-4 border border-white/[0.08]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-mono font-semibold tracking-wider uppercase text-slate-400 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#10B981]" />
            Active Brief Spec
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.05] text-slate-300">
            {brief.city}
          </span>
        </div>
        <h2 className="text-base font-bold text-white line-clamp-1">{brief.name}</h2>
        {brief.venueName && (
          <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">📍 {brief.venueName}</p>
        )}

        {/* Commercial Constraints Pills */}
        <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-white/[0.06]">
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
            ${(brief.constraints.minBudgetTier! / 1000).toFixed(0)}k Floor
          </span>
          {brief.constraints.blockedCategories.map((c) => (
            <span
              key={c}
              className="text-[11px] font-mono px-2 py-0.5 rounded bg-red-500/10 text-red-300 border border-red-500/20"
            >
              Blocked: {c}
            </span>
          ))}
          {brief.constraints.lockedCompetitors.map((comp) => (
            <span
              key={comp}
              className="text-[11px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20"
            >
              Locked: {comp}
            </span>
          ))}
          {brief.constraints.ecoConsciousOnly && (
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
              Eco-Conscious Only
            </span>
          )}
        </div>
      </div>

      {/* Telemetry Bento Grid */}
      <div className="grid grid-cols-2 gap-2">
        <div className="panel-surface rounded-xl p-3 border border-white/[0.08]">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Search className="w-3 h-3 text-[#10B981]" />
            Entities Ingested
          </div>
          <div className="text-xl font-bold font-mono text-white mt-1">
            {totalEntitiesRetrieved}
          </div>
          <div className="text-[10px] text-slate-500 font-mono">Qloo Taste Graph</div>
        </div>

        <div className="panel-surface rounded-xl p-3 border border-white/[0.08]">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-red-400" />
            Rules Enforced
          </div>
          <div className="text-xl font-bold font-mono text-red-400 mt-1">
            {totalRejectedCount}
          </div>
          <div className="text-[10px] text-slate-500 font-mono">Commercial Blocks</div>
        </div>

        <div className="panel-surface rounded-xl p-3 border border-white/[0.08]">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            LLM Divergence
          </div>
          <div className="text-xl font-bold font-mono text-amber-400 mt-1">
            {jaccardDivergenceScore}%
          </div>
          <div className="text-[10px] text-slate-500 font-mono">Jaccard Cultural Diff</div>
        </div>

        <div className="panel-surface rounded-xl p-3 border border-white/[0.08]">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Clock className="w-3 h-3 text-emerald-400" />
            Total Latency
          </div>
          <div className="text-xl font-bold font-mono text-slate-200 mt-1">
            {executionDurationMs}ms
          </div>
          <div className="text-[10px] text-slate-500 font-mono">Pipeline Execution</div>
        </div>
      </div>

      {/* Resolved Lineup Artists */}
      <div className="panel-surface rounded-xl p-4 border border-white/[0.08]">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-mono font-semibold tracking-wider uppercase text-slate-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
            Resolved Lineup Entities ({resolvedArtists.length})
          </span>
          <span className="text-[10px] font-mono text-emerald-400">100% Grounded</span>
        </div>

        <div className="space-y-2">
          {resolvedArtists.map((artist) => (
            <div
              key={artist.entityId}
              className="p-2.5 rounded-lg bg-[#090A0F] border border-white/[0.06] hover:border-white/10 transition-colors"
            >
              <div className="flex items-start justify-between gap-1">
                <div>
                  <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                    {artist.resolvedName}
                    <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-500/10 text-emerald-400 font-mono border border-emerald-500/20">
                      ✓ Verified
                    </span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 mt-0.5 truncate max-w-[240px]">
                    {artist.entityId}
                  </div>
                </div>
                {artist.disambiguationScore && (
                  <span className="text-[10px] font-mono text-slate-400 shrink-0">
                    {(artist.disambiguationScore * 100).toFixed(0)}% Match
                  </span>
                )}
              </div>
              {artist.genres && artist.genres.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {artist.genres.slice(0, 3).map((g) => (
                    <span
                      key={g}
                      className="text-[9px] px-1.5 py-0.2 rounded bg-white/[0.04] text-slate-400 font-mono"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Live Agent Execution Step Log (Manus Pattern) */}
      <div className="panel-surface rounded-xl p-4 border border-white/[0.08]">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-mono font-semibold tracking-wider uppercase text-slate-400 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-[#10B981]" />
            Qloo API Execution Log
          </span>
          <span className="text-[10px] font-mono text-slate-500">{traces.length} Telemetry Events</span>
        </div>

        <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
          {traces.map((trace) => {
            const isExpanded = expandedTraceId === trace.stepId;
            return (
              <div
                key={trace.stepId}
                className="rounded-lg bg-[#090A0F] border border-white/[0.06] overflow-hidden text-xs"
              >
                <button
                  type="button"
                  onClick={() => toggleTrace(trace.stepId)}
                  className="w-full text-left p-2.5 flex items-center justify-between gap-2 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        trace.status === 200 ? 'bg-emerald-400' : 'bg-red-400'
                      }`}
                    />
                    <span className="font-mono font-semibold text-slate-200 truncate">
                      {trace.endpoint}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 shrink-0">
                      {trace.entitiesReturned} items
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-mono text-slate-400 bg-white/[0.05] px-1.5 py-0.5 rounded">
                      {trace.latencyMs}ms
                    </span>
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded uppercase font-semibold ${
                        trace.mode === 'LIVE_QLOO'
                          ? 'bg-[#10B981]/15 text-[#10B981]'
                          : trace.mode === 'CACHED_QLOO'
                          ? 'bg-emerald-950 text-emerald-400'
                          : 'bg-amber-500/15 text-amber-400'
                      }`}
                    >
                      {trace.mode === 'MOCK_FIXTURE' ? 'Mock' : trace.mode === 'CACHED_QLOO' ? 'Cache' : 'Live'}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="p-2.5 pt-0 border-t border-white/[0.04] bg-[#0c0d14] font-mono text-[11px] text-slate-400">
                    <div className="text-[10px] text-slate-500 mb-1">Sanitized Parameters:</div>
                    <pre className="bg-[#050608] p-2 rounded border border-white/5 overflow-x-auto text-slate-300">
                      {JSON.stringify(trace.params, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Audience Taste Intersection Tags */}
      {tasteTags && tasteTags.length > 0 && (
        <div className="panel-surface rounded-xl p-4 border border-white/[0.08]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono font-semibold tracking-wider uppercase text-slate-400 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-[#10B981]" />
              Audience Taste Signals ({tasteTags.length})
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mb-2.5">
            Cross-domain affinities retrieved from Qloo Taste AI Graph:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {tasteTags.map((tag) => (
              <span
                key={tag}
                className="text-[11px] px-2 py-0.5 rounded-full badge-qloo font-mono flex items-center gap-1"
              >
                <span>•</span>
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
