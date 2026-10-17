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
  Terminal,
  Code2,
  Copy,
  Check,
  Cpu,
} from 'lucide-react';
import { CountUp } from '@/components/ui/CountUp';
import { DecryptedText } from '@/components/ui/DecryptedText';

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
  const [copiedPayloadId, setCopiedPayloadId] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState<number>(3); // 0-indexed scrubber step

  const toggleTrace = (id: string) => {
    setExpandedTraceId(expandedTraceId === id ? null : id);
  };

  const copyPayload = (id: string, payload: unknown) => {
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setCopiedPayloadId(id);
    setTimeout(() => setCopiedPayloadId(null), 1800);
  };

  const totalEntitiesRetrieved = traces.reduce((acc, t) => acc + (t.entitiesReturned || 0), 0);

  const steps = [
    { label: 'Entity Resolve', desc: 'Qloo URN lookup' },
    { label: 'Taste Correlate', desc: '250M+ vectors' },
    { label: 'Rule Enforce', desc: 'Commercial filter' },
    { label: 'Synthesis', desc: 'Pitches & activations' },
  ];

  return (
    <aside className="rounded-2xl border border-zinc-800 bg-zinc-950/90 shadow-2xl overflow-hidden backdrop-blur-md flex flex-col">
      {/* Manus.im macOS Window Header */}
      <div className="px-4 py-3 bg-zinc-900/80 border-b border-zinc-800 flex items-center justify-between select-none">
        <div className="flex items-center gap-2">
          {/* macOS Traffic Lights */}
          <div className="flex items-center gap-1.5 mr-2">
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-700/80 hover:bg-red-500/80 transition-colors" />
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-700/80 hover:bg-amber-500/80 transition-colors" />
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-700/80 hover:bg-emerald-500/80 transition-colors" />
          </div>

          <div className="flex items-center gap-1.5 text-xs font-mono font-medium text-zinc-300">
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span className="truncate max-w-[190px] sm:max-w-xs font-semibold">
              Agent Computer — Qloo Session
            </span>
          </div>
        </div>

        {/* Live Execution Status */}
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700/60 text-[10px] font-mono text-zinc-300">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold">ACTIVE</span>
        </div>
      </div>

      {/* Live Step Scrubber */}
      <div className="px-4 py-2.5 bg-zinc-900/40 border-b border-zinc-800/80">
        <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-2 flex items-center justify-between">
          <span>Execution Pipeline</span>
          <span className="text-zinc-400">Step 4/4 Complete</span>
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {steps.map((st, i) => (
            <button
              key={st.label}
              onClick={() => setActiveStep(i)}
              className={`p-1.5 rounded-lg border text-left transition-all cursor-pointer ${
                activeStep === i
                  ? 'bg-zinc-800 border-zinc-600 text-white shadow-xs'
                  : 'bg-zinc-900/60 border-zinc-800/80 text-zinc-400 hover:text-zinc-300'
              }`}
            >
              <div className="text-[10px] font-mono font-semibold truncate leading-tight">
                {st.label}
              </div>
              <div className="text-[9px] font-mono text-zinc-400 truncate mt-0.5">
                {st.desc}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Active Brief Spec Block */}
        <div className="p-3.5 rounded-xl bg-zinc-900/50 border border-zinc-800/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono font-semibold tracking-wider uppercase text-zinc-400 flex items-center gap-1.5">
              <Layers className="w-3 h-3 text-emerald-400" />
              Target Brief
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700/60">
              {brief.city}
            </span>
          </div>
          <h2 className="text-sm font-bold text-zinc-100 truncate">{brief.name}</h2>
          {brief.venueName && (
            <p className="text-xs text-zinc-400 mt-0.5 truncate">📍 {brief.venueName}</p>
          )}

          {/* Commercial Constraints Pills */}
          <div className="flex flex-wrap gap-1 mt-2.5 pt-2.5 border-t border-zinc-800/60">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-amber-300 border border-amber-900/40">
              ${(brief.constraints.minBudgetTier! / 1000).toFixed(0)}k Floor
            </span>
            {brief.constraints.blockedCategories.map((c) => (
              <span
                key={c}
                className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-red-400 border border-red-900/40"
              >
                No {c}
              </span>
            ))}
            {brief.constraints.lockedCompetitors.map((comp) => (
              <span
                key={comp}
                className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-purple-300 border border-purple-900/40"
              >
                Lock: {comp}
              </span>
            ))}
            {brief.constraints.ecoConsciousOnly && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-emerald-300 border border-emerald-900/40">
                Eco Only
              </span>
            )}
          </div>
        </div>

        {/* Telemetry Bento Grid with React Bits CountUp */}
        <div className="grid grid-cols-2 gap-2">
          <div className="p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/80">
            <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1">
              <Search className="w-3 h-3 text-emerald-400" />
              Entities Ingested
            </div>
            <div className="text-lg font-bold font-mono text-zinc-100 mt-1">
              <CountUp to={totalEntitiesRetrieved} duration={1} />
            </div>
            <div className="text-[10px] text-zinc-400 font-mono">Qloo Graph</div>
          </div>

          <div className="p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/80">
            <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-red-400" />
              Rules Enforced
            </div>
            <div className="text-lg font-bold font-mono text-red-400 mt-1">
              <CountUp to={totalRejectedCount} duration={1} />
            </div>
            <div className="text-[10px] text-zinc-400 font-mono">Blocked Deals</div>
          </div>

          <div className="p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/80">
            <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              LLM Divergence
            </div>
            <div className="text-lg font-bold font-mono text-amber-400 mt-1">
              <CountUp to={jaccardDivergenceScore} suffix="%" duration={1.2} />
            </div>
            <div className="text-[10px] text-zinc-400 font-mono">Jaccard Cultural Diff</div>
          </div>

          <div className="p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/80">
            <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1">
              <Clock className="w-3 h-3 text-emerald-400" />
              Execution
            </div>
            <div className="text-lg font-bold font-mono text-zinc-200 mt-1">
              <CountUp to={executionDurationMs} suffix="ms" duration={1} />
            </div>
            <div className="text-[10px] text-zinc-400 font-mono">Pipeline Latency</div>
          </div>
        </div>

        {/* Resolved Lineup Entities with DecryptedText URN */}
        <div className="p-3.5 rounded-xl bg-zinc-900/40 border border-zinc-800/80">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[10px] font-mono font-semibold tracking-wider uppercase text-zinc-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              Resolved Entities ({resolvedArtists.length})
            </span>
            <span className="text-[10px] font-mono text-emerald-400">100% Grounded</span>
          </div>

          <div className="space-y-2">
            {resolvedArtists.map((artist) => (
              <div
                key={artist.entityId}
                className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800/80 hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-start justify-between gap-1">
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-zinc-100 flex items-center gap-1.5 truncate">
                      {artist.resolvedName}
                      <span className="text-[9px] px-1 py-0.2 rounded bg-zinc-900 text-emerald-400 font-mono border border-zinc-800">
                        ✓ Verified
                      </span>
                    </div>
                    {/* DecryptedText for URN */}
                    <div className="mt-0.5 truncate max-w-[230px]">
                      <DecryptedText
                        text={artist.entityId}
                        speed={35}
                        maxIterations={10}
                        className="font-mono text-[10px] text-zinc-400"
                        encryptedClassName="font-mono text-[10px] text-emerald-500/70"
                      />
                    </div>
                  </div>
                  {artist.disambiguationScore && (
                    <span className="text-[10px] font-mono text-zinc-400 shrink-0">
                      {(artist.disambiguationScore * 100).toFixed(0)}%
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Collapsible HTTP Payload Inspection & Trace Log */}
        <div className="p-3.5 rounded-xl bg-zinc-900/40 border border-zinc-800/80">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[10px] font-mono font-semibold tracking-wider uppercase text-zinc-400 flex items-center gap-1.5">
              <Activity className="w-3 h-3 text-emerald-400" />
              Qloo HTTP Payloads
            </span>
            <span className="text-[10px] font-mono text-zinc-400">
              {traces.length} Events
            </span>
          </div>

          <div className="space-y-1.5 max-h-[340px] overflow-y-auto pr-1">
            {traces.map((trace) => {
              const isExpanded = expandedTraceId === trace.stepId;
              const isCopied = copiedPayloadId === trace.stepId;
              return (
                <div
                  key={trace.stepId}
                  className="rounded-lg bg-zinc-950 border border-zinc-800/80 overflow-hidden text-xs"
                >
                  <button
                    type="button"
                    onClick={() => toggleTrace(trace.stepId)}
                    className="w-full text-left p-2.5 flex items-center justify-between gap-2 hover:bg-zinc-900/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                          trace.status === 200 ? 'bg-emerald-400' : 'bg-red-400'
                        }`}
                      />
                      <span className="font-mono font-bold text-[10px] px-1 py-0.2 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 shrink-0">
                        GET
                      </span>
                      <span className="font-mono text-zinc-300 truncate text-[11px]">
                        {trace.endpoint}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-mono text-[10px] text-zinc-400">
                        {trace.latencyMs}ms
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5 text-zinc-400" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                      )}
                    </div>
                  </button>

                  {/* Expanded HTTP Payload Inspector */}
                  {isExpanded && (
                    <div className="p-3 border-t border-zinc-800 bg-zinc-900/70 space-y-2 animate-in fade-in duration-150">
                      <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                        <span>Payload & Parameters</span>
                        <button
                          onClick={() => copyPayload(trace.stepId, trace.params)}
                          className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors cursor-pointer"
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-2.5 h-2.5 text-emerald-400" />
                              <span>Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-2.5 h-2.5" />
                              <span>Copy JSON</span>
                            </>
                          )}
                        </button>
                      </div>

                      {trace.params && (
                        <div>
                          <div className="text-[10px] font-mono text-zinc-400 mb-0.5">Parameters:</div>
                          <pre className="p-2 rounded bg-zinc-950 border border-zinc-800 text-[10px] font-mono text-zinc-300 overflow-x-auto">
                            {JSON.stringify(trace.params, null, 2)}
                          </pre>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 pt-1 border-t border-zinc-800/60">
                        <span>Status: <span className="text-emerald-400">{trace.status} OK</span></span>
                        <span>Mode: <span className="text-zinc-300">{trace.mode}</span></span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
}

export default AgentTracePane;
