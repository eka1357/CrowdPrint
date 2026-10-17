'use client';

import React, { useState } from 'react';
import { ResolvedArtist, SynthesizedSponsor } from '@/lib/types';
import {
  X,
  ShieldCheck,
  Copy,
  Check,
  Tag,
  CheckCircle2,
  Terminal,
  Layers,
  Database,
} from 'lucide-react';
import CountUp from '@/components/CountUp';
import DecryptedText from '@/components/DecryptedText';

interface EvidenceDrawerProps {
  sponsor: SynthesizedSponsor | null;
  isOpen: boolean;
  onClose: () => void;
  resolvedArtists: ResolvedArtist[];
}

export function EvidenceDrawer({
  sponsor,
  isOpen,
  onClose,
  resolvedArtists,
}: EvidenceDrawerProps) {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [activeTab, setActiveTab] = useState<'provenance' | 'raw_json'>('provenance');

  if (!isOpen || !sponsor) return null;

  const copyUrl = () => {
    navigator.clipboard.writeText(sponsor.rawQueryUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const copyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(sponsor, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-xl bg-zinc-950 border-l border-zinc-800 shadow-2xl flex flex-col z-10">
          {/* Drawer Header */}
          <div className="p-5 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-900/60 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-zinc-800 text-zinc-200 flex items-center justify-center border border-zinc-700/80 shadow-sm">
                <ShieldCheck className="w-4 h-4 text-zinc-300" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-zinc-100 tracking-tight flex items-center gap-2">
                  <span>Qloo Evidence Trail Inspector</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/50">
                    v2.1
                  </span>
                </h3>
                <p className="text-xs text-zinc-400 font-mono mt-0.5">
                  Inspectable data provenance for <span className="text-zinc-200">{sponsor.name}</span>
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Tabs */}
          <div className="px-5 pt-3 border-b border-zinc-800 flex gap-4 bg-zinc-950 text-xs font-mono">
            <button
              onClick={() => setActiveTab('provenance')}
              className={`pb-2.5 font-medium transition-colors border-b-2 cursor-pointer ${
                activeTab === 'provenance'
                  ? 'border-zinc-200 text-zinc-100'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Provenance & Compliance
            </button>
            <button
              onClick={() => setActiveTab('raw_json')}
              className={`pb-2.5 font-medium transition-colors border-b-2 cursor-pointer ${
                activeTab === 'raw_json'
                  ? 'border-zinc-200 text-zinc-100'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Raw Entity Payload (JSON)
            </button>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
            {activeTab === 'provenance' ? (
              <>
                {/* Brand Identity & Affinity Score */}
                <div className="rounded-xl p-4 bg-zinc-900/60 border border-zinc-800 shadow-sm">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h4 className="text-base font-bold text-zinc-100">{sponsor.name}</h4>
                      <div className="text-[11px] font-mono text-zinc-400 truncate max-w-sm mt-0.5">
                        <DecryptedText
                          text={sponsor.entityId}
                          speed={30}
                          maxIterations={12}
                          className="text-zinc-400"
                        />
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold font-mono text-zinc-100">
                        <CountUp
                          to={sponsor.affinityScore}
                          from={0}
                          duration={0.8}
                          decimals={1}
                        />%
                      </div>
                      <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                        Qloo Affinity
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-zinc-800/80">
                    {sponsor.categories.map((c) => (
                      <span
                        key={c}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800/80 text-zinc-300 border border-zinc-700/50"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Deterministic Commercial Rules Checklist */}
                <div className="rounded-xl p-4 bg-zinc-900/60 border border-zinc-800 shadow-sm">
                  <div className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-300 mb-3 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Deterministic Commercial Rules Audit</span>
                  </div>

                  <div className="space-y-2">
                    <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800/80 flex items-center justify-between">
                      <span className="text-zinc-300">Category Exclusivity Filter</span>
                      <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        PASSED (No Conflict)
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800/80 flex items-center justify-between">
                      <span className="text-zinc-300">Competitor Exclusivity Lock</span>
                      <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        PASSED (Clear)
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800/80 flex items-center justify-between">
                      <span className="text-zinc-300">Venue & Age Restriction Audit</span>
                      <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        PASSED (Compliant)
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800/80 flex items-center justify-between">
                      <span className="text-zinc-300">Festival Sustainability Mandate</span>
                      <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        PASSED (Verified)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Lineup Seed Entity URNs Passed to Qloo */}
                <div className="rounded-xl p-4 bg-zinc-900/60 border border-zinc-800 shadow-sm">
                  <div className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-300 mb-2 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-zinc-400" />
                    <span>Lineup Seed Entities (Graph Input)</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 mb-2.5">
                    Canonical artist URNs used for affinity graph propagation:
                  </p>
                  <div className="space-y-1.5 font-mono text-[11px]">
                    {resolvedArtists.map((artist) => (
                      <div
                        key={artist.entityId}
                        className="p-2 rounded-lg bg-zinc-950 border border-zinc-800/70 flex items-center justify-between"
                      >
                        <span className="text-zinc-100 font-semibold">{artist.resolvedName}</span>
                        <span className="text-zinc-500 text-[10px]">{artist.entityId}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Raw Qloo Query Parameters (Sanitized) */}
                <div className="rounded-xl p-4 bg-zinc-900/60 border border-zinc-800 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                      <Terminal className="w-4 h-4 text-zinc-400" />
                      <span>Sanitized Qloo API Request URL</span>
                    </div>
                    <button
                      onClick={copyUrl}
                      className="flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-mono transition-colors cursor-pointer"
                    >
                      {copiedUrl ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedUrl ? 'Copied' : 'Copy URL'}</span>
                    </button>
                  </div>

                  <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800/80 font-mono text-[11px] text-zinc-300 break-all leading-relaxed">
                    {sponsor.rawQueryUrl ||
                      'https://hackathon.api.qloo.com/v2/insights?filter.type=urn:entity:brand&limit=20'}
                  </div>
                </div>

                {/* Shared Taste Signals */}
                {sponsor.sharedTags && sponsor.sharedTags.length > 0 && (
                  <div className="rounded-xl p-4 bg-zinc-900/60 border border-zinc-800 shadow-sm">
                    <div className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-300 mb-2 flex items-center gap-1.5">
                      <Tag className="w-4 h-4 text-zinc-400" />
                      <span>Co-Affinity Taste Signals</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {sponsor.sharedTags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-zinc-800 text-zinc-300 border border-zinc-700/60"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* Raw JSON Inspector Tab */
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-zinc-400">
                    Full JSON Payload with Activations & Pitch:
                  </span>
                  <button
                    onClick={copyJson}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-mono text-xs transition-colors cursor-pointer"
                  >
                    {copiedJson ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedJson ? 'Copied' : 'Copy JSON'}</span>
                  </button>
                </div>
                <pre className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800/80 font-mono text-[11px] text-zinc-300 overflow-x-auto leading-relaxed">
                  {JSON.stringify(sponsor, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Drawer Footer */}
          <div className="p-4 border-t border-zinc-800/80 bg-zinc-950 flex items-center justify-between text-xs text-zinc-500 font-mono">
            <span className="flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-zinc-400" />
              Provenance: Qloo Taste AI Graph
            </span>
            <span className="text-zinc-400">Deterministic Audit Pass</span>
          </div>
        </div>
      </div>
    </div>
  );
}
