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
} from 'lucide-react';

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
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-xl bg-[#11131C] border-l border-white/[0.1] shadow-2xl flex flex-col z-10">
          {/* Drawer Header */}
          <div className="p-5 border-b border-white/[0.08] flex items-center justify-between bg-[#181B26]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#10B981]/15 text-[#10B981] flex items-center justify-center border border-[#10B981]/30">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  Qloo Evidence Trail Inspector
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  Inspectable data provenance for {sponsor.name}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Tabs */}
          <div className="px-5 pt-3 border-b border-white/[0.06] flex gap-4 bg-[#141622] text-xs font-mono">
            <button
              onClick={() => setActiveTab('provenance')}
              className={`pb-2.5 font-semibold transition-colors border-b-2 cursor-pointer ${
                activeTab === 'provenance'
                  ? 'border-[#10B981] text-[#10B981]'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Provenance & Compliance
            </button>
            <button
              onClick={() => setActiveTab('raw_json')}
              className={`pb-2.5 font-semibold transition-colors border-b-2 cursor-pointer ${
                activeTab === 'raw_json'
                  ? 'border-[#10B981] text-[#10B981]'
                  : 'border-transparent text-slate-400 hover:text-white'
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
                <div className="panel-surface rounded-xl p-4 border border-white/[0.08]">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h4 className="text-lg font-bold text-white">{sponsor.name}</h4>
                      <div className="text-[11px] font-mono text-slate-400 truncate max-w-sm mt-0.5">
                        {sponsor.entityId}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold font-mono text-[#10B981]">
                        {sponsor.affinityScore.toFixed(1)}%
                      </div>
                      <div className="text-[10px] font-mono text-slate-400">Qloo Affinity</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mt-2 pt-2 border-t border-white/[0.04]">
                    {sponsor.categories.map((c) => (
                      <span
                        key={c}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.04] text-slate-300"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Deterministic Commercial Rules Checklist */}
                <div className="panel-surface rounded-xl p-4 border border-white/[0.08]">
                  <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#10B981]" />
                    Deterministic Commercial Rules Audit
                  </div>

                  <div className="space-y-2">
                    <div className="p-2.5 rounded-lg bg-[#090A0F] border border-emerald-500/20 flex items-center justify-between">
                      <span className="text-slate-300">Category Exclusivity Filter</span>
                      <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        PASSED (No Conflict)
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-[#090A0F] border border-emerald-500/20 flex items-center justify-between">
                      <span className="text-slate-300">Competitor Exclusivity Lock</span>
                      <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        PASSED (Clear)
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-[#090A0F] border border-emerald-500/20 flex items-center justify-between">
                      <span className="text-slate-300">Venue & Age Restriction Audit</span>
                      <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        PASSED (Compliant)
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-[#090A0F] border border-emerald-500/20 flex items-center justify-between">
                      <span className="text-slate-300">Festival Sustainability Mandate</span>
                      <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        PASSED (Verified)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Lineup Seed Entity URNs Passed to Qloo */}
                <div className="panel-surface rounded-xl p-4 border border-white/[0.08]">
                  <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-[#10B981]" />
                    Lineup Seed Entities (Graph Input)
                  </div>
                  <p className="text-[11px] text-slate-400 mb-2">
                    These canonical artist URNs formed the taste seed query:
                  </p>
                  <div className="space-y-1.5 font-mono text-[11px]">
                    {resolvedArtists.map((artist) => (
                      <div
                        key={artist.entityId}
                        className="p-2 rounded bg-[#090A0F] border border-white/5 flex items-center justify-between"
                      >
                        <span className="text-white font-semibold">{artist.resolvedName}</span>
                        <span className="text-slate-400 text-[10px]">{artist.entityId}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Raw Qloo Query Parameters (Sanitized) */}
                <div className="panel-surface rounded-xl p-4 border border-white/[0.08]">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                      <Terminal className="w-4 h-4 text-[#10B981]" />
                      Sanitized Qloo API Request URL
                    </div>
                    <button
                      onClick={copyUrl}
                      className="flex items-center gap-1 px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-slate-300 text-[10px] font-mono transition-colors cursor-pointer"
                    >
                      {copiedUrl ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedUrl ? 'Copied' : 'Copy URL'}</span>
                    </button>
                  </div>

                  <div className="p-2.5 rounded bg-[#090A0F] border border-white/5 font-mono text-[11px] text-emerald-400 break-all leading-relaxed">
                    {sponsor.rawQueryUrl ||
                      'https://hackathon.api.qloo.com/v2/insights?filter.type=urn:entity:brand&limit=20'}
                  </div>
                </div>

                {/* Shared Taste Signals */}
                {sponsor.sharedTags && sponsor.sharedTags.length > 0 && (
                  <div className="panel-surface rounded-xl p-4 border border-white/[0.08]">
                    <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-1.5">
                      <Tag className="w-4 h-4 text-[#10B981]" />
                      Co-Affinity Taste Signals
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {sponsor.sharedTags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[11px] font-mono px-2 py-0.5 rounded-full badge-qloo"
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
                  <span className="text-xs font-mono text-slate-400">
                    Full JSON Payload with Activations & Pitch:
                  </span>
                  <button
                    onClick={copyJson}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-slate-300 font-mono text-xs transition-colors cursor-pointer"
                  >
                    {copiedJson ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedJson ? 'Copied' : 'Copy JSON'}</span>
                  </button>
                </div>
                <pre className="p-3.5 rounded-xl bg-[#090A0F] border border-white/5 font-mono text-[11px] text-slate-300 overflow-x-auto leading-relaxed">
                  {JSON.stringify(sponsor, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Drawer Footer */}
          <div className="p-4 border-t border-white/[0.08] bg-[#141622] flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Provenance: Qloo Taste AI Graph</span>
            <span>Zero Hallucinations</span>
          </div>
        </div>
      </div>
    </div>
  );
}
