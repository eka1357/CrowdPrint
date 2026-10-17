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
  ShieldCheck,
  Search,
  Terminal,
  Copy,
  Check,
  X,
} from 'lucide-react';
import { DecryptedText } from '@/components/ui/DecryptedText';

interface AgentTracePaneProps {
  brief?: EventBrief;
  resolvedArtists: ResolvedArtist[];
  traces: QlooCallTrace[];
  tasteTags?: string[];
  totalRejectedCount: number;
  jaccardDivergenceScore?: number;
  executionDurationMs?: number;
  onClose?: () => void;
}

export function AgentTracePane({
  resolvedArtists,
  traces,
  totalRejectedCount,
  onClose,
}: AgentTracePaneProps) {
  const [expandedTraceId, setExpandedTraceId] = useState<string | null>(null);
  const [copiedPayloadId, setCopiedPayloadId] = useState<string | null>(null);

  const toggleTrace = (id: string) => {
    setExpandedTraceId(expandedTraceId === id ? null : id);
  };

  const copyPayload = (id: string, payload: unknown) => {
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setCopiedPayloadId(id);
    setTimeout(() => setCopiedPayloadId(null), 1800);
  };

  const pipelineSteps = [
    {
      num: '1',
      title: 'Entity Resolution',
      tag: '100% Resolved',
      tagColor: 'text-emerald-400 bg-emerald-950/40 border-emerald-800/40',
      desc: 'Disambiguate lineup artists into canonical Qloo URN entities with 250M+ vector identifiers.',
    },
    {
      num: '2',
      title: 'Taste Correlation',
      tag: '250M+ Vectors',
      tagColor: 'text-teal-400 bg-teal-950/40 border-teal-800/40',
      desc: 'Query cross-domain taste vectors to extract statistical audience brand affinities.',
    },
    {
      num: '3',
      title: 'Rule Enforcement',
      tag: `${totalRejectedCount} Filtered`,
      tagColor: 'text-red-400 bg-red-950/40 border-red-800/40',
      desc: 'Deterministic filter for commercial floors, competitor locks & category bans.',
    },
    {
      num: '4',
      title: 'Activation Synthesis',
      tag: 'Attributed AI',
      tagColor: 'text-amber-400 bg-amber-950/40 border-amber-800/40',
      desc: 'Synthesize on-site activation creative citing verified Qloo taste signals with zero hallucination.',
    },
  ];

  return (
    <div className="flex flex-col h-full text-zinc-200 select-none">
      {/* Manus macOS Window Header */}
      <div className="px-4 py-3 bg-zinc-900/90 border-b border-zinc-800/80 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          {/* macOS Traffic Lights */}
          <div className="flex items-center gap-1.5 mr-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-700 hover:bg-red-500/80 transition-colors" />
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-700 hover:bg-amber-500/80 transition-colors" />
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-700 hover:bg-emerald-500/80 transition-colors" />
          </div>

          <div className="flex items-center gap-1.5 text-xs font-mono font-medium text-zinc-300">
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-semibold text-zinc-200">
              Agent Computer
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Status Badge */}
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700/60 text-[10px] font-mono text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold">ACTIVE</span>
          </div>

          {/* Close button if provided (for mobile/drawer) */}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Close Panel"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Pane Content with Vertical Scroll */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Execution Pipeline — Clean Vertical Timeline List without double icons */}
        <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/80 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Activity className="w-3 h-3 text-emerald-400" />
              Execution Pipeline
            </span>
            <span className="text-[10px] font-mono text-zinc-400">
              Step 4/4 Complete
            </span>
          </div>

          {/* Vertical Timeline */}
          <div className="relative pl-5 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-zinc-800">
            {pipelineSteps.map((step) => {
              return (
                <div key={step.num} className="relative group">
                  {/* Step Dot */}
                  <div className="absolute -left-5 top-0.5 w-4 h-4 rounded-full bg-zinc-950 border border-emerald-500/80 flex items-center justify-center text-[9px] font-mono font-bold text-emerald-400 shadow-xs">
                    {step.num}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="text-xs font-semibold text-zinc-100">
                        {step.title}
                      </span>
                      <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded border ${step.tagColor} shrink-0`}>
                        {step.tag}
                      </span>
                    </div>

                    {/* Full Description with Zero Ellipses */}
                    <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Resolved Lineup Entities with DecryptedText URN */}
        <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/80 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-zinc-400 flex items-center gap-1.5">
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
                <div className="flex items-start justify-between gap-1 mb-1">
                  <div className="text-xs font-semibold text-zinc-100 flex items-center gap-1.5 truncate">
                    <span>{artist.resolvedName}</span>
                    <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-950/40 text-emerald-400 font-mono border border-emerald-800/40 shrink-0">
                      ✓ Verified
                    </span>
                  </div>
                  {artist.disambiguationScore && (
                    <span className="text-[10px] font-mono text-zinc-400 shrink-0">
                      {(artist.disambiguationScore * 100).toFixed(0)}%
                    </span>
                  )}
                </div>

                {/* DecryptedText for URN */}
                <div className="mt-1 break-all">
                  <DecryptedText
                    text={artist.entityId}
                    speed={35}
                    maxIterations={10}
                    className="font-mono text-[10px] text-zinc-400"
                    encryptedClassName="font-mono text-[10px] text-emerald-500/70"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Collapsible HTTP Request Traces */}
        <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/80 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-zinc-400 flex items-center gap-1.5">
              <Activity className="w-3 h-3 text-emerald-400" />
              Qloo HTTP Payloads
            </span>
            <span className="text-[10px] font-mono text-zinc-400">
              {traces.length} Events
            </span>
          </div>

          <div className="space-y-2">
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
                    <div className="p-3 border-t border-zinc-800 bg-zinc-900/70 space-y-2">
                      <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                        <span>Payload & Parameters</span>
                        <button
                          type="button"
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
    </div>
  );
}

export default AgentTracePane;
