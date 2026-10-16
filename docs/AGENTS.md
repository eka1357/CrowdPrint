# Agent Workflow & Tool Specification: Crowdprint

## 1. Architectural Philosophy: Deterministic Pipeline > Multi-Agent Theater
Do NOT build slow, fragile 4-agent conversational roleplay loops ("Researcher Agent chatting with Marketing Agent"). Instead, Crowdprint uses a **Single Orchestrated Agent Pipeline** with deterministic tool calls, parallel execution, and strict JSON schema enforcement.

## 2. The 5-Step Agent Execution Loop (`src/lib/agent.ts`)

1. **Step 1 (Parallel): Tool `resolve_qloo_artists`**
   - Resolves artist strings -> Qloo Entity URNs (`urn:entity:artist`).
2. **Step 2 (Parallel):**
   - **Tool `fetch_qloo_brand_affinities`:** Queries Qloo `/v2/insights` using seed URNs -> returns `urn:entity:brand` candidates + taste tags.
   - **Tool `run_plain_llm_baseline`:** Runs a zero-Qloo LLM prompt on the same brief to generate the baseline comparison.
3. **Step 3 (Deterministic Code): `apply_commercial_rules`**
   - Splits Qloo brand candidates into `approved[]` Shortlist vs. `rejected[]` Rule-Rejected Audit List.
4. **Step 4 (Grounded LLM Synthesis): `synthesize_activations_and_pitch`**
   - Generates 2 activations per top 3 approved sponsors, citing retrieved Qloo tags and labeling any creative extrapolation separately.

## 3. Tool Definitions & Schemas

### Tool 1: `resolve_qloo_artists`
- **Input:** `artists: string[]`
- **Action:** Calls `GET /search?query={artist}&types=urn:entity:artist&limit=1` for each artist concurrently (`Promise.all`).
- **Output Schema:**
  ```ts
  export interface ResolvedArtist {
    inputName: string;
    resolvedName: string;
    entityId: string; // e.g., "urn:entity:artist:..."
    verified: boolean;
  }

Tool 2: fetch_qloo_brand_affinities
Input: seedEntityIds: string[], city: string

Action:

Calls GET /v2/insights?filter.type=urn:entity:brand&signal.interests.entities={seedEntityIds.join(',')}&limit=20

Parallel call for taste/dining context: GET /v2/insights?filter.type=urn:tag&signal.interests.entities={seedEntityIds.join(',')}&limit=10

Output Schema:

TypeScript
export interface QlooBrandCandidate {
  entityId: string;
  name: string;
  affinityScore: number; // Raw score from Qloo API
  categories: string[];
  sharedTags: string[];
  rawQueryUrl: string;   // Stored for the Evidence Drawer
}
Tool 3: apply_commercial_rules (Deterministic Engine)
Input: candidates: QlooBrandCandidate[], constraints: CommercialConstraints

Action: Pure TypeScript check against blocked categories, locked competitor brands, and age restrictions.

Output Schema:

TypeScript
export interface FilteredSponsorResult {
  approved: QlooBrandCandidate[];
  rejected: {
    brand: QlooBrandCandidate;
    reasonCode: 'CATEGORY_EXCLUSION' | 'COMPETITOR_LOCK' | 'AGE_RESTRICTION';
    explanation: string;
  }[];
}
Tool 4: synthesize_activations_and_pitch
System Prompt Rule:

"You are the Crowdprint Sponsorship Strategist. You receive verified Qloo brand matches and verified Qloo audience taste tags. For each of the top 3 approved brands, propose 2 concrete on-site event activations. Every activation MUST explicitly reference at least one provided Qloo signal in qlooSignalCited. If you add an operational detail not present in the Qloo payload, populate it in creativeExtension so the UI badges it honestly."