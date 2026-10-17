'use client';

import React from 'react';
import { motion } from 'motion/react';
import { EventBrief, QlooExecutionMode } from '@/lib/types';
import {
  Radio,
  ChevronDown,
  RefreshCw,
  Terminal,
} from 'lucide-react';

interface WorkspaceHeaderProps {
  currentBrief: EventBrief;
  activeMode: QlooExecutionMode;
  isLoading: boolean;
  onRefresh: () => void;
  onOpenScenarioPicker: () => void;
  selectedTab: 'sponsors' | 'diff' | 'rejected';
  onSelectTab: (tab: 'sponsors' | 'diff' | 'rejected') => void;
  approvedCount: number;
  rejectedCount: number;
  divergenceScore: number;
  isAgentPaneOpen: boolean;
  onToggleAgentPane: () => void;
}

export function WorkspaceHeader({
  currentBrief,
  activeMode,
  isLoading,
  onRefresh,
  onOpenScenarioPicker,
  selectedTab,
  onSelectTab,
  approvedCount,
  rejectedCount,
  divergenceScore,
  isAgentPaneOpen,
  onToggleAgentPane,
}: WorkspaceHeaderProps) {
  return (
    <header className="h-14 border-b border-white/[0.08] bg-[#090A0F]/95 backdrop-blur-md sticky top-0 z-40 px-3 sm:px-4 select-none shrink-0 w-full overflow-hidden">
      <div className="w-full h-full flex items-center justify-between gap-1.5 sm:gap-2">
        {/* Left Section: Brand Logo + Compact Active Brief Pill */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 min-w-0">
          {/* Logo */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 flex items-center justify-center shadow-md shadow-emerald-500/20">
              <Radio className="w-3.5 h-3.5 text-white animate-pulse" />
            </div>
            <span className="font-extrabold text-sm tracking-tight text-white hidden xl:inline">
              Crowdprint
            </span>
          </div>

          <div className="h-4 w-px bg-zinc-800 hidden xl:block shrink-0" />

          {/* Compact Active Brief Pill */}
          <button
            id="brief-switcher-btn"
            type="button"
            onClick={onOpenScenarioPicker}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-900/90 hover:bg-zinc-850 border border-zinc-750 hover:border-emerald-500/60 text-xs font-mono text-zinc-200 transition-all cursor-pointer group shadow-sm shrink-0"
            title="Switch Event Brief Scenario"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 group-hover:scale-125 transition-transform shrink-0" />
            <span className="font-semibold text-zinc-100 max-w-[110px] sm:max-w-[150px] truncate text-xs">
              {currentBrief.name}
            </span>
            <span className="text-emerald-400 font-semibold flex items-center gap-0.5 text-[10px] sm:text-[11px] ml-0.5 shrink-0 bg-emerald-950/60 px-1.5 py-0.5 rounded-full border border-emerald-800/40 group-hover:bg-emerald-950/90 transition-colors">
              <span>Change</span>
              <ChevronDown className="w-2.5 h-2.5 sm:w-3 sm:h-3 group-hover:translate-y-0.5 transition-transform" />
            </span>
          </button>
        </div>

        {/* Center Section: Compact 3 Primary Tabs (NO icons, takes 35% less width) */}
        <nav className="hidden md:flex items-center gap-0.5 sm:gap-1 p-0.5 rounded-xl bg-zinc-950 border border-zinc-800/80 shrink-0">
          {/* Tab 1: 01 Sponsors */}
          <button
            id="tab-sponsors-btn"
            type="button"
            onClick={() => onSelectTab('sponsors')}
            className={`relative px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              selectedTab === 'sponsors' ? 'text-white font-semibold' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {selectedTab === 'sponsors' && (
              <motion.div
                layoutId="headerActiveTab"
                className="absolute inset-0 bg-zinc-900 border border-zinc-700 rounded-lg shadow-sm -z-10"
                transition={{ type: 'spring', bounce: 0.18, duration: 0.35 }}
              />
            )}
            <span>01 Sponsors</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-zinc-800 text-zinc-300 border border-zinc-700/60">
              {approvedCount}
            </span>
          </button>

          {/* Tab 2: 02 Qloo vs. LLM */}
          <button
            id="tab-diff-btn"
            type="button"
            onClick={() => onSelectTab('diff')}
            className={`relative px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              selectedTab === 'diff' ? 'text-white font-semibold' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {selectedTab === 'diff' && (
              <motion.div
                layoutId="headerActiveTab"
                className="absolute inset-0 bg-zinc-900 border border-zinc-700 rounded-lg shadow-sm -z-10"
                transition={{ type: 'spring', bounce: 0.18, duration: 0.35 }}
              />
            )}
            <span>02 Qloo vs. LLM</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-zinc-800 text-amber-400 border border-zinc-700/60">
              {divergenceScore}%
            </span>
          </button>

          {/* Tab 3: 03 Rejections */}
          <button
            id="tab-rejected-btn"
            type="button"
            onClick={() => onSelectTab('rejected')}
            className={`relative px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              selectedTab === 'rejected' ? 'text-white font-semibold' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {selectedTab === 'rejected' && (
              <motion.div
                layoutId="headerActiveTab"
                className="absolute inset-0 bg-zinc-900 border border-zinc-700 rounded-lg shadow-sm -z-10"
                transition={{ type: 'spring', bounce: 0.18, duration: 0.35 }}
              />
            )}
            <span>03 Rejections</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-zinc-800 text-red-400 border border-zinc-700/60">
              {rejectedCount}
            </span>
          </button>
        </nav>

        {/* Right Section: Guaranteed shrink-0, perfectly fitted inside 1280px with GitHub icon */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Active Mode Status Badge */}
          <div
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-mono font-medium border shrink-0 ${
              activeMode === 'LIVE_QLOO'
                ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40'
                : activeMode === 'CACHED_QLOO'
                ? 'bg-emerald-950/30 text-emerald-400/90 border-emerald-800/30'
                : 'bg-amber-950/40 text-amber-400 border-amber-800/40'
            }`}
            title={`Active Engine: ${activeMode}`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                activeMode === 'LIVE_QLOO'
                  ? 'bg-emerald-400 animate-ping'
                  : activeMode === 'CACHED_QLOO'
                  ? 'bg-emerald-400'
                  : 'bg-amber-400'
              }`}
            />
            <span className="text-[11px] whitespace-nowrap">
              {activeMode === 'LIVE_QLOO'
                ? 'Live Qloo'
                : activeMode === 'CACHED_QLOO'
                ? 'Cached'
                : 'Mock'}
            </span>
          </div>

          {/* Re-run Pipeline Button */}
          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-xs font-semibold text-black transition-all shadow-sm shadow-emerald-500/20 cursor-pointer shrink-0"
            title="Trigger pipeline execution"
          >
            <RefreshCw className={`w-3.5 h-3.5 shrink-0 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="whitespace-nowrap hidden sm:inline">{isLoading ? 'Running...' : 'Re-run'}</span>
          </button>

          {/* Manus Agent Computer Toggle Button */}
          <button
            type="button"
            onClick={onToggleAgentPane}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-mono border transition-all cursor-pointer shrink-0 ${
              isAgentPaneOpen
                ? 'bg-zinc-800 text-white border-zinc-600 shadow-sm'
                : 'bg-zinc-900/80 text-zinc-400 border-zinc-800 hover:text-zinc-200 hover:bg-zinc-850'
            }`}
            title="Toggle Agent Computer Execution Drawer"
          >
            <Terminal className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="whitespace-nowrap">Agent</span>
            <span className="text-[10px] px-1 py-0.2 rounded bg-zinc-950 font-bold text-emerald-400 border border-zinc-800 shrink-0">
              4/4
            </span>
          </button>

          {/* GitHub Repo Link */}
          <a
            href="https://github.com/eka1357/CrowdPrint"
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-white border border-zinc-800 transition-colors shrink-0 flex items-center justify-center"
            title="View GitHub Repository"
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
              />
            </svg>
          </a>
        </div>
      </div>
    </header>
  );
}

export default WorkspaceHeader;
