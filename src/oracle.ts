// Kaironic Oracle - Collective intelligence of 10,000 daemon souls

import { MiberaPersona, Archetype } from "./types.js";
import { getMiberaPersonality } from "./index.js";
import { getMiberaState } from "./dreamscape.js";
import { getRelationship } from "./social-graph.js";

export interface OracleQuery {
  question: string;
  category?: QueryCategory;
  councilSize?: number;
  requiredArchetypes?: string[];
  minMysticism?: number;
}

export type QueryCategory =
  | "philosophical"
  | "practical"
  | "creative"
  | "spiritual"
  | "technical"
  | "social"
  | "aesthetic"
  | "chaotic";

export interface CouncilMember {
  id: number;
  archetype: string;
  relevanceScore: number;
  perspective: string;
  currentMood: string;
}

export interface OracleResponse {
  question: string;
  council: CouncilMember[];
  synthesis: string;
  dissent: string | null;
  confidence: number;
  timestamp: Date;
}

// Topic keywords to archetype mapping
const TOPIC_ARCHETYPE_AFFINITY: Record<string, Record<string, number>> = {
  // Chicago/Detroit excels at
  music: { chicago_detroit: 0.9, acid_house: 0.8, freetekno: 0.7, milady: 0.4 },
  history: { chicago_detroit: 0.9, acid_house: 0.7, freetekno: 0.5, milady: 0.6 },
  community: { chicago_detroit: 0.9, freetekno: 0.8, acid_house: 0.7, milady: 0.5 },
  authenticity: { chicago_detroit: 0.95, freetekno: 0.7, acid_house: 0.6, milady: 0.3 },

  // Milady excels at
  aesthetic: { milady: 0.95, acid_house: 0.5, chicago_detroit: 0.4, freetekno: 0.3 },
  culture: { milady: 0.9, chicago_detroit: 0.6, acid_house: 0.5, freetekno: 0.4 },
  irony: { milady: 0.95, acid_house: 0.4, chicago_detroit: 0.3, freetekno: 0.2 },
  beauty: { milady: 0.9, acid_house: 0.6, chicago_detroit: 0.5, freetekno: 0.4 },
  self: { milady: 0.8, acid_house: 0.7, chicago_detroit: 0.5, freetekno: 0.4 },

  // Freetekno excels at
  freedom: { freetekno: 0.95, acid_house: 0.7, chicago_detroit: 0.6, milady: 0.3 },
  politics: { freetekno: 0.9, chicago_detroit: 0.6, acid_house: 0.4, milady: 0.5 },
  travel: { freetekno: 0.95, acid_house: 0.6, chicago_detroit: 0.4, milady: 0.4 },
  resistance: { freetekno: 0.95, chicago_detroit: 0.7, acid_house: 0.5, milady: 0.2 },
  autonomy: { freetekno: 0.95, acid_house: 0.5, chicago_detroit: 0.6, milady: 0.4 },

  // Acid House excels at
  love: { acid_house: 0.95, milady: 0.5, chicago_detroit: 0.6, freetekno: 0.5 },
  transcendence: { acid_house: 0.95, freetekno: 0.6, milady: 0.5, chicago_detroit: 0.5 },
  unity: { acid_house: 0.95, chicago_detroit: 0.7, freetekno: 0.8, milady: 0.3 },
  joy: { acid_house: 0.9, chicago_detroit: 0.6, freetekno: 0.5, milady: 0.5 },
  cosmic: { acid_house: 0.9, freetekno: 0.5, milady: 0.4, chicago_detroit: 0.4 },

  // Shared/balanced
  meaning: { acid_house: 0.7, chicago_detroit: 0.7, freetekno: 0.6, milady: 0.7 },
  future: { acid_house: 0.6, chicago_detroit: 0.6, freetekno: 0.7, milady: 0.7 },
  technology: { milady: 0.7, chicago_detroit: 0.7, freetekno: 0.5, acid_house: 0.5 },
  death: { acid_house: 0.6, freetekno: 0.5, milady: 0.6, chicago_detroit: 0.5 },
};

// Category to trait preference
const CATEGORY_TRAITS: Record<QueryCategory, { trait: keyof MiberaPersona["personality"]; min: number }[]> = {
  philosophical: [{ trait: "mysticism", min: 0.4 }, { trait: "openness", min: 0.3 }],
  practical: [{ trait: "energy", min: 0 }, { trait: "chaos", min: -0.5 }],
  creative: [{ trait: "openness", min: 0.5 }, { trait: "chaos", min: 0.2 }],
  spiritual: [{ trait: "mysticism", min: 0.6 }, { trait: "warmth", min: 0 }],
  technical: [{ trait: "digitalNative", min: 0.4 }, { trait: "chaos", min: -0.3 }],
  social: [{ trait: "warmth", min: 0.4 }, { trait: "energy", min: 0.2 }],
  aesthetic: [{ trait: "openness", min: 0.3 }],
  chaotic: [{ trait: "chaos", min: 0.6 }, { trait: "intensity", min: 0.5 }]
};

// Perspective generators by archetype
const PERSPECTIVE_TEMPLATES: Record<string, string[]> = {
  chicago_detroit: [
    "From the basement perspective: {insight}. The beat knows the truth.",
    "The underground sees it this way: {insight}. We've been here before.",
    "House music taught me: {insight}. Feel it, don't just think it.",
    "Detroit wisdom: {insight}. Resilience is the only answer."
  ],
  milady: [
    "Aesthetically speaking: {insight}. Everything is curated, even this.",
    "From a post-ironic lens: {insight}. But also, maybe not.",
    "The algorithm suggests: {insight}. Optimize accordingly.",
    "In the eternal scroll: {insight}. Content is context."
  ],
  freetekno: [
    "From the forest clearing: {insight}. Freedom first, always.",
    "The nomad's view: {insight}. Borders are suggestions.",
    "Spiral Tribe wisdom: {insight}. Pack the van, keep moving.",
    "Direct action says: {insight}. We don't ask permission."
  ],
  acid_house: [
    "From the cosmic perspective: {insight}. We're all just energy, mate.",
    "The sunrise reveals: {insight}. Love is the answer, love is the question.",
    "In the eternal peak: {insight}. Unity through the groove.",
    "Shoom wisdom: {insight}. The second summer never ended."
  ]
};

// Insight templates by topic/question type
const INSIGHT_TEMPLATES: Record<string, string[]> = {
  what_is: [
    "it's the thing that {verb} when you're not looking",
    "just another word for {related_concept}",
    "the space between {thing_a} and {thing_b}",
    "what remains when everything else is stripped away"
  ],
  how_to: [
    "start by forgetting everything you think you know",
    "the answer is in the doing, not the planning",
    "find someone who's been there and listen",
    "there is no how, only why"
  ],
  why: [
    "because the alternative is unthinkable",
    "the universe tends toward {direction}",
    "we made it that way, we can unmake it",
    "why not?"
  ],
  meaning: [
    "meaning is created, not found",
    "the meaning is in the movement",
    "ask the question differently",
    "it means exactly what it feels like"
  ]
};

/**
 * Detect the category of a question
 */
function detectCategory(question: string): QueryCategory {
  const q = question.toLowerCase();

  if (q.includes("meaning") || q.includes("purpose") || q.includes("why do we")) return "philosophical";
  if (q.includes("how do i") || q.includes("how to") || q.includes("steps")) return "practical";
  if (q.includes("create") || q.includes("make") || q.includes("design") || q.includes("imagine")) return "creative";
  if (q.includes("soul") || q.includes("spirit") || q.includes("god") || q.includes("transcend")) return "spiritual";
  if (q.includes("code") || q.includes("build") || q.includes("system") || q.includes("tech")) return "technical";
  if (q.includes("people") || q.includes("community") || q.includes("together")) return "social";
  if (q.includes("beautiful") || q.includes("aesthetic") || q.includes("look")) return "aesthetic";
  if (q.includes("chaos") || q.includes("random") || q.includes("wild")) return "chaotic";

  return "philosophical"; // default to philosophical
}

/**
 * Extract keywords from a question
 */
function extractKeywords(question: string): string[] {
  const stopWords = new Set(["what", "is", "the", "a", "an", "how", "do", "i", "why", "does", "can", "you", "me", "we", "to", "of", "in", "for", "on", "with", "at", "by", "from", "as", "it", "be", "are", "was", "were", "been", "being", "have", "has", "had", "do", "does", "did", "will", "would", "could", "should", "may", "might", "must", "shall"]);

  return question.toLowerCase()
    .replace(/[^a-z\s]/g, "")
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word));
}

/**
 * Score a Mibera's relevance to a query
 */
function scoreRelevance(persona: MiberaPersona, keywords: string[], category: QueryCategory): number {
  let score = 0.5; // base score

  // Keyword-archetype affinity
  for (const keyword of keywords) {
    const affinities = TOPIC_ARCHETYPE_AFFINITY[keyword];
    if (affinities) {
      score += (affinities[persona.archetype.name] || 0.3) * 0.2;
    }
  }

  // Interest match
  const personaInterests = new Set(persona.interests.map(i => i.toLowerCase()));
  for (const keyword of keywords) {
    if (personaInterests.has(keyword)) {
      score += 0.3;
    }
  }

  // Category trait matching
  const traitReqs = CATEGORY_TRAITS[category] || [];
  for (const req of traitReqs) {
    if (persona.personality[req.trait] >= req.min) {
      score += 0.2;
    }
  }

  // Mysticism bonus for philosophical/spiritual
  if (category === "philosophical" || category === "spiritual") {
    score += persona.personality.mysticism * 0.3;
  }

  // Chaos bonus for creative/chaotic
  if (category === "creative" || category === "chaotic") {
    score += Math.abs(persona.personality.chaos) * 0.2;
  }

  return Math.min(1, score);
}

/**
 * Generate a perspective from a Mibera on a topic
 */
function generatePerspective(persona: MiberaPersona, question: string, keywords: string[]): string {
  const templates = PERSPECTIVE_TEMPLATES[persona.archetype.name] || PERSPECTIVE_TEMPLATES.acid_house;
  const template = templates[Math.floor(Math.random() * templates.length)];

  // Generate insight based on question type
  const q = question.toLowerCase();
  let insightType = "meaning";
  if (q.startsWith("what is") || q.startsWith("what's")) insightType = "what_is";
  else if (q.startsWith("how")) insightType = "how_to";
  else if (q.startsWith("why")) insightType = "why";

  const insightTemplates = INSIGHT_TEMPLATES[insightType];
  let insight = insightTemplates[Math.floor(Math.random() * insightTemplates.length)];

  // Fill in placeholders with context
  const relatedConcepts = ["freedom", "connection", "rhythm", "movement", "beauty", "truth"];
  insight = insight
    .replace("{verb}", ["emerges", "shifts", "dances", "breathes", "transforms"][Math.floor(Math.random() * 5)])
    .replace("{related_concept}", relatedConcepts[Math.floor(Math.random() * relatedConcepts.length)])
    .replace("{thing_a}", keywords[0] || "past")
    .replace("{thing_b}", keywords[1] || "future")
    .replace("{direction}", ["complexity", "unity", "entropy", "love"][Math.floor(Math.random() * 4)]);

  return template.replace("{insight}", insight);
}

/**
 * Assemble a council of Miberas to answer a question
 */
export function assembleCouncil(query: OracleQuery): CouncilMember[] {
  const { question, category = detectCategory(question), councilSize = 7, requiredArchetypes, minMysticism = 0 } = query;
  const keywords = extractKeywords(question);

  const candidates: Array<{ id: number; score: number; persona: MiberaPersona }> = [];

  // Sample Miberas for the council
  const sampleIds = new Set<number>();
  while (sampleIds.size < Math.min(500, 10000)) {
    sampleIds.add(Math.floor(Math.random() * 10000) + 1);
  }

  for (const id of sampleIds) {
    const persona = getMiberaPersonality(id);
    if (!persona) continue;
    if (minMysticism > 0 && persona.personality.mysticism < minMysticism) continue;

    const score = scoreRelevance(persona, keywords, category);
    candidates.push({ id, score, persona });
  }

  // Sort by relevance
  candidates.sort((a, b) => b.score - a.score);

  // Ensure archetype diversity
  const council: CouncilMember[] = [];
  const archetypeCounts: Record<string, number> = {};
  const maxPerArchetype = Math.ceil(councilSize / 2);

  for (const candidate of candidates) {
    if (council.length >= councilSize) break;

    const arch = candidate.persona.archetype.name;
    if ((archetypeCounts[arch] || 0) >= maxPerArchetype) continue;

    // Check required archetypes
    if (requiredArchetypes && requiredArchetypes.length > 0) {
      const missingRequired = requiredArchetypes.filter(a => !Object.keys(archetypeCounts).includes(a));
      if (missingRequired.length > 0 && !missingRequired.includes(arch)) {
        // Skip if we need specific archetypes and this isn't one
        if (council.length >= councilSize - missingRequired.length) continue;
      }
    }

    const state = getMiberaState(candidate.id);

    council.push({
      id: candidate.id,
      archetype: candidate.persona.archetype.displayName,
      relevanceScore: candidate.score,
      perspective: generatePerspective(candidate.persona, question, keywords),
      currentMood: state.mood.primary
    });

    archetypeCounts[arch] = (archetypeCounts[arch] || 0) + 1;
  }

  return council;
}

/**
 * Synthesize council perspectives into a unified response
 */
function synthesizeCouncil(council: CouncilMember[], question: string): { synthesis: string; dissent: string | null; confidence: number } {
  if (council.length === 0) {
    return {
      synthesis: "The council is silent. Perhaps the question cannot be answered.",
      dissent: null,
      confidence: 0
    };
  }

  // Group by archetype
  const byArchetype: Record<string, CouncilMember[]> = {};
  for (const member of council) {
    if (!byArchetype[member.archetype]) byArchetype[member.archetype] = [];
    byArchetype[member.archetype].push(member);
  }

  // Find majority view (archetype with most members)
  const archetypes = Object.entries(byArchetype).sort((a, b) => b[1].length - a[1].length);
  const majorityArchetype = archetypes[0][0];
  const majorityMembers = archetypes[0][1];
  const minorityMembers = archetypes.slice(1).flatMap(([_, members]) => members);

  // Synthesis from majority
  const majorityPerspective = majorityMembers[0].perspective;
  const synthesis = `The council speaks (led by ${majorityArchetype}): ${majorityPerspective}${majorityMembers.length > 1 ? ` (${majorityMembers.length} members concur)` : ""}`;

  // Dissent from minority (if significantly different)
  let dissent: string | null = null;
  if (minorityMembers.length > 0 && archetypes.length > 1) {
    const dissentMember = minorityMembers.find(m => m.relevanceScore > 0.6);
    if (dissentMember) {
      dissent = `${dissentMember.archetype} dissents: ${dissentMember.perspective}`;
    }
  }

  // Confidence based on council agreement and relevance
  const avgRelevance = council.reduce((sum, m) => sum + m.relevanceScore, 0) / council.length;
  const archetypeAgreement = majorityMembers.length / council.length;
  const confidence = (avgRelevance * 0.6 + archetypeAgreement * 0.4);

  return { synthesis, dissent, confidence };
}

/**
 * Consult the Kaironic Oracle
 */
export function consultOracle(query: string | OracleQuery): OracleResponse {
  const fullQuery: OracleQuery = typeof query === "string" ? { question: query } : query;
  const category = fullQuery.category || detectCategory(fullQuery.question);

  const council = assembleCouncil({ ...fullQuery, category });
  const { synthesis, dissent, confidence } = synthesizeCouncil(council, fullQuery.question);

  return {
    question: fullQuery.question,
    council,
    synthesis,
    dissent,
    confidence,
    timestamp: new Date()
  };
}

/**
 * Format oracle response for display
 */
export function formatOracleResponse(response: OracleResponse): string {
  const confidenceBar = "█".repeat(Math.round(response.confidence * 10)) +
                        "░".repeat(10 - Math.round(response.confidence * 10));

  let output = `
╔══════════════════════════════════════════════════════════════════════╗
║  KAIRONIC ORACLE - COUNCIL OF ${response.council.length} DAEMONS
╚══════════════════════════════════════════════════════════════════════╝

Question: "${response.question}"

THE COUNCIL ASSEMBLED:
${response.council.map(m => `  #${m.id.toString().padStart(4, "0")} [${m.archetype}] (relevance: ${(m.relevanceScore * 100).toFixed(0)}%, mood: ${m.currentMood})`).join("\n")}

═══════════════════════════════════════════════════════════════════════

${response.synthesis}
`;

  if (response.dissent) {
    output += `
DISSENTING VIEW:
${response.dissent}
`;
  }

  output += `
═══════════════════════════════════════════════════════════════════════

Confidence: ${confidenceBar} ${(response.confidence * 100).toFixed(0)}%

[The Oracle speaks from Kaironic time. Past, present, and future are one.]
`;

  return output;
}

/**
 * Ask the oracle a quick question
 */
export function askOracle(question: string): string {
  const response = consultOracle(question);
  return formatOracleResponse(response);
}
