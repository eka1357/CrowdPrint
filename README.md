# Crowdprint — Cultural Intelligence for Live Event Sponsorship & Activations

[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](./LICENSE)
[![Powered by Qloo](https://img.shields.io/badge/Taste_Graph-Qloo_API-10B981)](https://qloo.com)

> **Built for the Qloo Agentic Hackathon.** Crowdprint is an autonomous sponsorship strategist agent that turns an event's artist lineup, city, and commercial rules into an inspectable, evidence-backed brand sponsor shortlist and activation plan—powered by Qloo's 250M+ entity Taste AI Graph.

---

## Why Crowdprint Requires Qloo (The "Qloo vs. Plain LLM" Proof)

Ask a standard LLM (GPT-4o, Claude, Gemini) who should sponsor an underground electronic warehouse show in Brooklyn or an indie R&B festival in Silver Lake, and it guesses the same generic Fortune 500 names every time: *Red Bull, Heineken, Spotify, Nike*.

**Crowdprint solves this by grounding sponsorship decisions in empirical audience overlap:**
1. **Multi-Artist Entity Resolution:** Resolves lineup talent into canonical `urn:entity:artist` nodes in Qloo's graph.
2. **Cross-Domain Brand Affinity Ranking:** Queries Qloo `/v2/insights` (`urn:entity:brand` & `urn:tag`) to surface non-obvious commercial brands that over-index with that exact lineup's fanbase.
3. **Deterministic Commercial Rules Engine:** Filters Qloo's cultural matches against hard business constraints (category exclusivity locks, alcohol/age restrictions, minimum budget tiers) and logs rejected brands in an inspectable audit trail.
4. **Evidence-Backed Activations:** Proposes on-site activations where every concept explicitly cites the retrieved Qloo cross-domain taste signal (`[Qloo Signal Grounded]`) separately from LLM creative execution (`[Creative Suggestion]`).

---

## System Architecture

```text
[Event Brief: Lineup + City + Commercial Constraints]
       │
       ├──► 1. Entity Resolution (`src/lib/qloo.ts`)
       │       GET /search?types=urn:entity:artist -> Seed Entity URNs
       │
       ├──► 2. Parallel Intelligence Gathering
       │       ├──► Qloo Cross-Domain Graph (`GET /v2/insights` -> Brands & Taste Tags)
       │       └──► Plain LLM Baseline (Zero-Qloo prompt for Side-by-Side Diff)
       │
       ├──► 3. Deterministic Commercial Rules (`src/lib/rules.ts`)
       │       Splits candidates into Approved Shortlist vs. Rule-Rejected Audit Log
       │
       └──► 4. Grounded Activation Synthesis (`src/lib/llm.ts`)
               Generates 2 activations + pitch email per top sponsor citing Qloo signals