# Crowdprint — Cultural Intelligence for Live Event Sponsorship & Activations

> **Official Submission for the Qloo Agentic AI Hackathon 2026**  
> **Repository:** [https://github.com/eka1357/CrowdPrint](https://github.com/eka1357/CrowdPrint)  
> **Live Demo:** [http://localhost:3000](http://localhost:3000)

---

### The Problem: Live Entertainment Sponsorships Run on Guesswork

Live events and music festivals represent a $30B+ sponsorship market, yet promoters, talent buyers, and experiential agencies still build sponsor target lists by gut feel—or worse, by asking generic LLMs. Ask GPT-4o, Claude, or Gemini who should sponsor an underground electronic warehouse show in Brooklyn, a Latin Urbano stadium tour in Miami, or an Alt-Country showcase in Nashville, and they guess the same predictable Fortune 500 names every time (*Red Bull, Heineken, Spotify, Wrangler, Corona*).

**Plain LLMs are culturally blind to empirical audience overlap.**

---

### What Crowdprint Does

**Crowdprint** is an autonomous sponsorship strategist and commercial compliance agent powered by **Qloo's Taste AI™ Graph (250M+ entities)**. Given an event's artist lineup, city/neighborhood, budget floor, and commercial exclusivity rules, Crowdprint executes a deterministic 4-stage pipeline:

1. **Multi-Artist Entity Resolution (`/search`):** Disambiguates lineup talent into canonical `urn:entity:artist` UUIDs and popularity vectors in Qloo's graph.
2. **Cross-Domain Taste Graph Ingestion (`/v2/insights`):** Queries Qloo across three domains simultaneously:
   - **Commercial Brands (`urn:entity:brand`):** Ranks sponsors by empirical audience co-affinity with the lineup.
   - **Audience Taste Signals (`urn:tag`):** Extracts shared aesthetic, lifestyle, and music subculture tags (`urn:tag:lifestyle:qloo`, `urn:tag:audience:qloo`).
   - **Hyper-Local Activation Venues (`urn:entity:place`):** Identifies neighborhood-specific venues and cultural landmarks where the lineup's fanbase over-indexes (e.g., *Domino Park*, *Music Hall of Williamsburg*, *Baby's All Right*).
3. **Deterministic Commercial Rules Engine (`src/lib/rules.ts`):** Pure TypeScript compliance engine (zero LLM delegation) that intercepts category exclusions (e.g., No Alcohol/All-Ages, No Fast Fashion, No Mass Media) and competitor exclusivity locks (e.g., locking *Nike* or *AIAIAI* automatically blocks conflicting high-affinity candidates like *Urbanears* or *Clarks* and logs them in an inspectable audit trail).
4. **Signal-Attributed Activation & Pitch Synthesis (`src/lib/llm.ts`):** Generates on-site activation concepts and ready-to-send outreach emails for top approved sponsors. Every activation strictly separates verified Qloo signals (`[Qloo Signal Grounded]`) from LLM operational extrapolation (`[Creative Suggestion]`).

---

### Why This Only Works With Qloo (Empirical 8-Scenario Benchmark)

We benchmarked Crowdprint across **8 real-world genre lineups** (28 artists, 160 retrieved Qloo brand candidates) against a Plain LLM baseline:
- **100.0% Lineup Artist Resolution Rate** (28/28 artists resolved to canonical Qloo UUIDs).
- **97.6% Average Jaccard Cultural Divergence** between Qloo's brand shortlist and Plain LLM guesses:
  - *Brooklyn Electronic (Fred again.., Four Tet, Peggy Gou, Overmono):* Plain LLM guessed *Red Bull, Heineken, Pioneer DJ*. Qloo surfaced **Rains (95.4%), Urbanears (95.4%), ColorsxStudios (95.1%), Norse Projects (95.1%)**.
  - *Miami Latin Urbano (Bad Bunny, Feid, Karol G, Rauw Alejandro):* Plain LLM guessed *Corona, Pepsi, Goya*. Qloo surfaced **Studio F (95.9%), Colombia National Football Team (95.3%), Leonisa (94.7%)**.
  - *Hackney Underground Jazz & Grime (Ezra Collective, Little Simz, Yussef Dayes):* Plain LLM guessed *Guinness, Jameson, Rolex*. Qloo surfaced **Stones Throw Records (97.4%), Discogs (96.0%), Fred Perry (95.8%)**.
- **100.0% Deterministic Rule Compliance:** Intercepted 12 conflicting high-affinity brands across the 8 scenarios with full audit logs.

| # | Event Scenario & City | Lineup Talent | Top 3 Qloo Brand Matches (Affinity %) | Generic Plain LLM Guesses | Jaccard Divergence | Commercial Interceptions |
| :-: | :--- | :--- | :--- | :--- | :-: | :--- |
| **1** | **Brooklyn Warehouse Electronic**<br>*New York City, NY* | Fred again..<br>Four Tet<br>Peggy Gou<br>Overmono | **Rains** (95.4%)<br>**Urbanears** (95.4%)<br>**Vice** (95.2%) | Red Bull, Heineken, Spotify, Pioneer DJ, Vans, Uber, Monster Energy | **100.0%**<br>*(0% overlap)* | **4 blocked**<br>• Urbanears *(AIAIAI audio lock)*<br>• Vice, i-D *(Media ban)* |
| **2** | **Silver Lake Indie & Alt-R&B**<br>*Los Angeles, CA* | Khruangbin<br>Steve Lacy<br>Clairo<br>Men I Trust | **Urban Outfitters** (98.0%)<br>**Dr. Martens** (97.1%)<br>**Free People** (96.8%) | Urban Outfitters, Dr. Martens, Subaru, Pabst Blue Ribbon, Fender, Ray-Ban | **92.3%**<br>*(UO & Docs match)* | **3 blocked**<br>• Brandy Melville *(Eco ban)*<br>• Nasty Gal *(Eco ban)*<br>• American Apparel *(Eco ban)* |
| **3** | **Hackney Underground Jazz & Grime**<br>*London, UK* | Ezra Collective<br>Little Simz<br>Yussef Dayes | **Stones Throw Records** (97.4%)<br>**Vice** (96.5%)<br>**Discogs** (96.0%) | Jameson, Yamaha Music, Rolex, Starbucks, Guinness, Apple Music | **100.0%**<br>*(0% overlap)* | **3 blocked**<br>• Y-3 *(Nike footwear lock)*<br>• Clarks *(Nike footwear lock)*<br>• Grenson *(Nike footwear lock)* |
| **4** | **Austin Psych & Garage Rock**<br>*Austin, TX* | King Gizzard & The Lizard Wizard<br>Tame Impala<br>Black Pumas | **Patagonia** (97.0%)<br>**The North Face** (96.7%)<br>**Vice** (96.3%) | Vans, Pabst Blue Ribbon, Fender, Gibson, Marshall, Converse, Levi's | **92.3%**<br>*(Fender, Gibson match)* | **0 blocked**<br>*(Clean audit pass)* |
| **5** | **Miami Latin Urbano Stadium**<br>*Miami, FL* | Bad Bunny<br>Feid<br>Karol G<br>Rauw Alejandro | **Studio F** (95.9%)<br>**Colombia Football** (95.3%)<br>**Leonisa** (94.7%) | Corona, Pepsi, Buchanan's, Goya Foods, AT&T, Toyota, Spotify | **100.0%**<br>*(0% overlap)* | **0 blocked**<br>*(Clean audit pass)* |
| **6** | **Atlanta Trap & Southern Hip-Hop**<br>*Atlanta, GA* | Future<br>21 Savage<br>Metro Boomin<br>Gunna | **Off-White** (97.1%)<br>**Nice Kicks** (96.9%)<br>**Beats Electronics** (96.9%) | Hennessy, Sprite, Nike, Luc Belaire, Balenciaga, Beats, Rolling Loud | **96.3%**<br>*(Balenciaga overlap)* | **0 blocked**<br>*(Clean audit pass)* |
| **7** | **Nashville Americana & Alt-Country**<br>*Nashville, TN* | Zach Bryan<br>Kacey Musgraves<br>Tyler Childers | **Chubbies** (97.6%)<br>**Southern Tide** (97.0%)<br>**Shinesty** (96.7%) | Wrangler, Jack Daniel's, Ford, Carhartt, Coors Banquet, Yeti | **100.0%**<br>*(0% overlap)* | **2 blocked**<br>• Fast fashion apparel |
| **8** | **Seoul & LA K-Pop Arena Tour**<br>*Los Angeles, CA* | NewJeans<br>LE SSERAFIM<br>Stray Kids | **LA Kings** (94.9%)<br>**Yves Saint Laurent** (94.0%)<br>**iHeartRadio** (94.0%) | Samsung, Hyundai, McDonald's, Coca-Cola, Gentle Monster, Kia | **100.0%**<br>*(0% overlap)* | **0 blocked**<br>*(Clean audit pass)* |

---

### Judge UX: Zero Typing Required

- **1-Click Production Scenarios:** Switch between pre-cached real Qloo scenarios in `<2ms` or click **Re-run** / **Custom Brief** to execute live queries against `https://hackathon.api.qloo.com`.
- **Side-by-Side `Qloo vs. LLM` Studio:** Inspect the exact Jaccard divergence and affinity distribution chart contrasting Qloo against vanilla LLMs.
- **Inspectable Evidence Trail Drawer:** Click **Inspect Evidence** on any sponsor card to verify the seed artist UUIDs, sanitized Qloo API query URL, raw JSON payload, and commercial rule checklist.
- **Hyper-Local Activation Venues:** Expand any sponsor card to view neighborhood cultural landmarks (e.g. Domino Park, Baby's All Right) retrieved via Qloo's `urn:entity:place` endpoint.

---

### Verification Commands

```bash
# 1. Start the live UI
npm run dev

# 2. Run the 8-scenario live benchmark
node --env-file=.env.local scripts/run_eval.mjs

# 3. Run the live API feasibility gate test
node --env-file=.env.local scripts/gate_test.mjs

# 4. Verify clean production build
npm run build
```
