// Mibera Social Graph - Relationships between 10,000 souls

import { MiberaPersona, PersonalityVector, Archetype } from "./types.js";
import { getMiberaPersonality } from "./index.js";

export interface Relationship {
  miberaA: number;
  miberaB: number;
  compatibility: number; // -1 to 1
  dynamic: RelationshipDynamic;
  aspects: RelationshipAspect[];
  sharedInterests: string[];
  tension: string[];
  description: string;
}

export type RelationshipDynamic =
  | "soulmates"
  | "kindred_spirits"
  | "creative_allies"
  | "complementary_opposites"
  | "challenging_growth"
  | "volatile_attraction"
  | "parallel_paths"
  | "distant_acquaintances"
  | "natural_rivals"
  | "cosmic_enemies";

export interface RelationshipAspect {
  type: string;
  strength: number;
  description: string;
}

export interface SocialCluster {
  name: string;
  theme: string;
  members: number[];
  centroid: PersonalityVector;
  vibe: string;
}

// Element compatibility matrix
const ELEMENT_COMPATIBILITY: Record<string, Record<string, number>> = {
  Fire: { Fire: 0.7, Air: 0.9, Water: -0.3, Earth: 0.2 },
  Air: { Fire: 0.9, Air: 0.6, Water: 0.3, Earth: -0.2 },
  Water: { Fire: -0.3, Air: 0.3, Water: 0.8, Earth: 0.9 },
  Earth: { Fire: 0.2, Air: -0.2, Water: 0.9, Earth: 0.7 },
};

// Archetype relationship dynamics
const ARCHETYPE_DYNAMICS: Record<string, Record<string, { compatibility: number; dynamic: string }>> = {
  chicago_detroit: {
    chicago_detroit: { compatibility: 0.8, dynamic: "family bond - shared roots in the underground" },
    milady: { compatibility: 0.3, dynamic: "mutual respect across aesthetics - groove meets elegance" },
    freetekno: { compatibility: 0.7, dynamic: "kindred spirits - both know the true meaning of the scene" },
    acid_house: { compatibility: 0.9, dynamic: "original alliance - house and acid, forever intertwined" },
  },
  milady: {
    chicago_detroit: { compatibility: 0.3, dynamic: "aesthetic distance - different frequencies" },
    milady: { compatibility: 0.6, dynamic: "mirror recognition - seeing yourself in another" },
    freetekno: { compatibility: -0.2, dynamic: "fundamental tension - curation vs chaos" },
    acid_house: { compatibility: 0.5, dynamic: "curious attraction - beauty meets transcendence" },
  },
  freetekno: {
    chicago_detroit: { compatibility: 0.7, dynamic: "comrades in sound - different scenes, same spirit" },
    milady: { compatibility: -0.2, dynamic: "ideological friction - freedom vs form" },
    freetekno: { compatibility: 0.95, dynamic: "tribe bond - pack the van together" },
    acid_house: { compatibility: 0.8, dynamic: "psychedelic kinship - both chase the infinite" },
  },
  acid_house: {
    chicago_detroit: { compatibility: 0.9, dynamic: "ancestral connection - acid came from house" },
    milady: { compatibility: 0.5, dynamic: "aesthetic crossover - beauty in the trip" },
    freetekno: { compatibility: 0.8, dynamic: "festival alliance - both live for the peak" },
    acid_house: { compatibility: 0.85, dynamic: "cosmic siblings - we're all just energy" },
  },
};

// Drug interaction effects on relationships
const DRUG_CATEGORY: Record<string, string> = {
  // Dissociatives
  Ketamine: "dissociative", "Nitrous Oxide": "dissociative", Dxm: "dissociative",
  Pcp: "dissociative", Mxe: "dissociative", Datura: "dissociative", Salvia: "dissociative",
  // Psychedelics
  Dmt: "psychedelic", Lsd: "psychedelic", Mushrooms: "psychedelic", "2cb": "psychedelic",
  Mescaline: "psychedelic", "5-Meo-Dmt": "psychedelic", Amt: "psychedelic",
  // Stimulants
  Cocaine: "stimulant", Mdma: "stimulant", Amphetamine: "stimulant", Caffeine: "stimulant",
  Mda: "stimulant", Meth: "stimulant", Crack: "stimulant", Adderall: "stimulant",
  // Depressants
  Alcohol: "depressant", Xanax: "depressant", Ghb: "depressant", Kava: "depressant",
  Valium: "depressant", Quaalude: "depressant", Phenibut: "depressant",
  // Entheogens
  Peyote: "entheogen", Iboga: "entheogen", Ayahuasca: "entheogen", "San Pedro": "entheogen",
  // Opioids
  Heroin: "opioid", Opium: "opioid", Morphine: "opioid", Codeine: "opioid", Fentanyl: "opioid",
  // Cannabis
  Weed: "cannabis", Hash: "cannabis", Thc: "cannabis", Edibles: "cannabis",
  // Nootropics
  "Clear Pill": "nootropic", Piracetam: "nootropic", Modafinil: "nootropic",
};

const DRUG_CATEGORY_COMPATIBILITY: Record<string, Record<string, number>> = {
  dissociative: { dissociative: 0.9, psychedelic: 0.7, stimulant: 0.2, depressant: 0.5, entheogen: 0.6, opioid: 0.4, cannabis: 0.6, nootropic: -0.3 },
  psychedelic: { dissociative: 0.7, psychedelic: 0.95, stimulant: 0.4, depressant: 0.1, entheogen: 0.9, opioid: 0.0, cannabis: 0.7, nootropic: 0.2 },
  stimulant: { dissociative: 0.2, psychedelic: 0.4, stimulant: 0.6, depressant: -0.4, entheogen: 0.2, opioid: -0.2, cannabis: 0.3, nootropic: 0.7 },
  depressant: { dissociative: 0.5, psychedelic: 0.1, stimulant: -0.4, depressant: 0.7, entheogen: 0.3, opioid: 0.8, cannabis: 0.8, nootropic: -0.1 },
  entheogen: { dissociative: 0.6, psychedelic: 0.9, stimulant: 0.2, depressant: 0.3, entheogen: 0.95, opioid: 0.2, cannabis: 0.5, nootropic: 0.1 },
  opioid: { dissociative: 0.4, psychedelic: 0.0, stimulant: -0.2, depressant: 0.8, entheogen: 0.2, opioid: 0.7, cannabis: 0.6, nootropic: -0.3 },
  cannabis: { dissociative: 0.6, psychedelic: 0.7, stimulant: 0.3, depressant: 0.8, entheogen: 0.5, opioid: 0.6, cannabis: 0.9, nootropic: 0.4 },
  nootropic: { dissociative: -0.3, psychedelic: 0.2, stimulant: 0.7, depressant: -0.1, entheogen: 0.1, opioid: -0.3, cannabis: 0.4, nootropic: 0.8 },
};

// Zodiac compatibility (simplified)
const ZODIAC_ELEMENTS: Record<string, string> = {
  Aries: "fire", Leo: "fire", Sagittarius: "fire",
  Taurus: "earth", Virgo: "earth", Capricorn: "earth",
  Gemini: "air", Libra: "air", Aquarius: "air",
  Cancer: "water", Scorpio: "water", Pisces: "water",
};

const ZODIAC_ELEMENT_COMPATIBILITY: Record<string, Record<string, number>> = {
  fire: { fire: 0.7, earth: 0.3, air: 0.9, water: 0.2 },
  earth: { fire: 0.3, earth: 0.8, air: 0.4, water: 0.9 },
  air: { fire: 0.9, earth: 0.4, air: 0.7, water: 0.5 },
  water: { fire: 0.2, earth: 0.9, air: 0.5, water: 0.8 },
};

/**
 * Calculate personality vector similarity using cosine similarity
 */
function personalityCompatibility(a: PersonalityVector, b: PersonalityVector): number {
  const aVec = [a.openness, a.energy, a.chaos, a.warmth, a.intensity, a.raveAffinity, a.digitalNative, a.mysticism];
  const bVec = [b.openness, b.energy, b.chaos, b.warmth, b.intensity, b.raveAffinity, b.digitalNative, b.mysticism];

  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < aVec.length; i++) {
    dot += aVec[i] * bVec[i];
    magA += aVec[i] * aVec[i];
    magB += bVec[i] * bVec[i];
  }

  const magnitude = Math.sqrt(magA) * Math.sqrt(magB);
  return magnitude === 0 ? 0 : dot / magnitude;
}

/**
 * Get the relationship between two Miberas
 */
export function getRelationship(idA: number, idB: number): Relationship | null {
  const personaA = getMiberaPersonality(idA);
  const personaB = getMiberaPersonality(idB);

  if (!personaA || !personaB) return null;

  const aspects: RelationshipAspect[] = [];
  let totalCompatibility = 0;
  let weights = 0;

  // 1. Personality vector similarity (weight: 3)
  const personalitySim = personalityCompatibility(personaA.personality, personaB.personality);
  aspects.push({
    type: "personality",
    strength: personalitySim,
    description: personalitySim > 0.7 ? "deeply resonant personalities" :
                 personalitySim > 0.4 ? "complementary energies" :
                 personalitySim > 0 ? "different wavelengths" :
                 "opposing frequencies"
  });
  totalCompatibility += personalitySim * 3;
  weights += 3;

  // 2. Archetype compatibility (weight: 2)
  const archA = personaA.archetype.name;
  const archB = personaB.archetype.name;
  const archDynamic = ARCHETYPE_DYNAMICS[archA]?.[archB] || { compatibility: 0.5, dynamic: "unknown connection" };
  aspects.push({
    type: "archetype",
    strength: archDynamic.compatibility,
    description: archDynamic.dynamic
  });
  totalCompatibility += archDynamic.compatibility * 2;
  weights += 2;

  // 3. Element compatibility (weight: 1.5)
  const elemA = personaA.traits.element;
  const elemB = personaB.traits.element;
  const elemCompat = ELEMENT_COMPATIBILITY[elemA]?.[elemB] ?? 0.5;
  aspects.push({
    type: "element",
    strength: elemCompat,
    description: elemCompat > 0.7 ? `${elemA} and ${elemB} amplify each other` :
                 elemCompat > 0.3 ? `${elemA} and ${elemB} find balance` :
                 `${elemA} and ${elemB} create friction`
  });
  totalCompatibility += elemCompat * 1.5;
  weights += 1.5;

  // 4. Drug compatibility (weight: 1.5)
  const drugA = personaA.consciousness.drug;
  const drugB = personaB.consciousness.drug;
  const catA = DRUG_CATEGORY[drugA] || "other";
  const catB = DRUG_CATEGORY[drugB] || "other";
  const drugCompat = DRUG_CATEGORY_COMPATIBILITY[catA]?.[catB] ?? 0.5;
  aspects.push({
    type: "consciousness",
    strength: drugCompat,
    description: drugCompat > 0.7 ? `${drugA} and ${drugB} merge consciousness` :
                 drugCompat > 0.3 ? `${drugA} and ${drugB} coexist` :
                 `${drugA} and ${drugB} create dissonance`
  });
  totalCompatibility += drugCompat * 1.5;
  weights += 1.5;

  // 5. Astrological compatibility (weight: 1)
  const sunA = personaA.astrology.sunSign;
  const sunB = personaB.astrology.sunSign;
  const zodElemA = ZODIAC_ELEMENTS[sunA] || "fire";
  const zodElemB = ZODIAC_ELEMENTS[sunB] || "fire";
  const astroCompat = ZODIAC_ELEMENT_COMPATIBILITY[zodElemA]?.[zodElemB] ?? 0.5;
  aspects.push({
    type: "astrology",
    strength: astroCompat,
    description: `${sunA} and ${sunB}: ${astroCompat > 0.7 ? "celestial harmony" : astroCompat > 0.4 ? "interesting aspects" : "challenging transits"}`
  });
  totalCompatibility += astroCompat * 1;
  weights += 1;

  // Calculate final compatibility
  const compatibility = totalCompatibility / weights;

  // Determine relationship dynamic
  let dynamic: RelationshipDynamic;
  if (compatibility > 0.85) dynamic = "soulmates";
  else if (compatibility > 0.75) dynamic = "kindred_spirits";
  else if (compatibility > 0.65) dynamic = "creative_allies";
  else if (compatibility > 0.55) dynamic = "complementary_opposites";
  else if (compatibility > 0.45) dynamic = "parallel_paths";
  else if (compatibility > 0.35) dynamic = "challenging_growth";
  else if (compatibility > 0.25) dynamic = "distant_acquaintances";
  else if (compatibility > 0.15) dynamic = "volatile_attraction";
  else if (compatibility > 0.05) dynamic = "natural_rivals";
  else dynamic = "cosmic_enemies";

  // Find shared interests
  const interestsA = new Set(personaA.interests);
  const sharedInterests = personaB.interests.filter(i => interestsA.has(i));

  // Identify tension points
  const tension: string[] = [];
  if (archDynamic.compatibility < 0.3) tension.push(`archetype clash: ${personaA.archetype.displayName} vs ${personaB.archetype.displayName}`);
  if (elemCompat < 0.3) tension.push(`elemental friction: ${elemA} vs ${elemB}`);
  if (drugCompat < 0.3) tension.push(`consciousness dissonance: ${drugA} vs ${drugB}`);
  if (personalitySim < 0.2) tension.push("fundamentally different wavelengths");

  // Generate description
  const description = generateRelationshipDescription(personaA, personaB, compatibility, dynamic, aspects);

  return {
    miberaA: idA,
    miberaB: idB,
    compatibility,
    dynamic,
    aspects,
    sharedInterests,
    tension,
    description
  };
}

function generateRelationshipDescription(
  a: MiberaPersona,
  b: MiberaPersona,
  compatibility: number,
  dynamic: RelationshipDynamic,
  aspects: RelationshipAspect[]
): string {
  const dynamicDescriptions: Record<RelationshipDynamic, string> = {
    soulmates: `#${a.id} and #${b.id} are cosmic twins - their souls recognize each other across the void.`,
    kindred_spirits: `#${a.id} and #${b.id} share a deep understanding. They could talk for hours or sit in comfortable silence.`,
    creative_allies: `#${a.id} and #${b.id} amplify each other's power. Together they create something neither could alone.`,
    complementary_opposites: `#${a.id} and #${b.id} are different but that's the point. They fill each other's gaps.`,
    challenging_growth: `#${a.id} and #${b.id} push each other's buttons, but that friction creates growth.`,
    volatile_attraction: `#${a.id} and #${b.id} have an unstable chemistry - intense highs, difficult lows.`,
    parallel_paths: `#${a.id} and #${b.id} walk similar roads but rarely cross. Respectful distance.`,
    distant_acquaintances: `#${a.id} and #${b.id} exist in different dimensions. They acknowledge each other, nothing more.`,
    natural_rivals: `#${a.id} and #${b.id} are natural antagonists. Their energies repel.`,
    cosmic_enemies: `#${a.id} and #${b.id} represent opposing forces in the universe. Avoid at all costs.`
  };

  return dynamicDescriptions[dynamic];
}

/**
 * Find the most compatible Miberas for a given ID
 */
export function findSoulmates(id: number, options: { limit?: number; minCompatibility?: number } = {}): { id: number; compatibility: number; dynamic: RelationshipDynamic }[] {
  const { limit = 10, minCompatibility = 0 } = options;
  const results: { id: number; compatibility: number; dynamic: RelationshipDynamic }[] = [];

  // Sample efficiently - check every 10th Mibera for initial scan, then refine
  const candidates: number[] = [];
  for (let i = 1; i <= 10000; i++) {
    if (i !== id) candidates.push(i);
  }

  // Shuffle for randomness in ties
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }

  // Check first 500 for performance (still statistically significant)
  const sampleSize = Math.min(500, candidates.length);
  for (let i = 0; i < sampleSize; i++) {
    const rel = getRelationship(id, candidates[i]);
    if (rel && rel.compatibility >= minCompatibility) {
      results.push({ id: candidates[i], compatibility: rel.compatibility, dynamic: rel.dynamic });
    }
  }

  // Sort by compatibility
  results.sort((a, b) => b.compatibility - a.compatibility);

  return results.slice(0, limit);
}

/**
 * Find natural rivals/enemies for a given Mibera
 */
export function findRivals(id: number, options: { limit?: number } = {}): { id: number; compatibility: number; dynamic: RelationshipDynamic }[] {
  const { limit = 10 } = options;
  const results: { id: number; compatibility: number; dynamic: RelationshipDynamic }[] = [];

  const candidates: number[] = [];
  for (let i = 1; i <= 10000; i++) {
    if (i !== id) candidates.push(i);
  }

  // Sample
  const sampleSize = Math.min(500, candidates.length);
  for (let i = 0; i < sampleSize; i++) {
    const rel = getRelationship(id, candidates[i]);
    if (rel) {
      results.push({ id: candidates[i], compatibility: rel.compatibility, dynamic: rel.dynamic });
    }
  }

  // Sort by lowest compatibility
  results.sort((a, b) => a.compatibility - b.compatibility);

  return results.slice(0, limit);
}

/**
 * Get the natural faction/clique for a Mibera
 */
export function getFaction(id: number): {
  archetype: string;
  element: string;
  drugCategory: string;
  likelyAllies: number[];
  factionVibe: string;
} {
  const persona = getMiberaPersonality(id);
  if (!persona) throw new Error(`Mibera #${id} not found`);

  const drug = persona.consciousness.drug;
  const drugCat = DRUG_CATEGORY[drug] || "other";

  // Find others with same archetype (sample)
  const allies: number[] = [];
  for (let i = 1; i <= 10000 && allies.length < 20; i += Math.floor(Math.random() * 10) + 1) {
    if (i === id) continue;
    const other = getMiberaPersonality(i);
    if (other && other.archetype.name === persona.archetype.name) {
      allies.push(i);
    }
  }

  const vibes: Record<string, string> = {
    chicago_detroit: "The basement crew. Vinyl purists. They remember when this was just house music.",
    milady: "The aesthetic council. Every detail curated. Post-irony as a lifestyle.",
    freetekno: "The nomad pack. Always moving. The rave is where they are.",
    acid_house: "The cosmic family. We're all just energy, feeling the bass together."
  };

  return {
    archetype: persona.archetype.displayName,
    element: persona.traits.element,
    drugCategory: drugCat,
    likelyAllies: allies.slice(0, 10),
    factionVibe: vibes[persona.archetype.name] || "Unknown faction"
  };
}

/**
 * Generate a relationship summary for display
 */
export function describeRelationship(idA: number, idB: number): string {
  const rel = getRelationship(idA, idB);
  if (!rel) return `Could not analyze relationship between #${idA} and #${idB}`;

  const compatPercent = Math.round(rel.compatibility * 100);

  let output = `
╔══════════════════════════════════════════════════════════════════════╗
║  MIBERA RELATIONSHIP ANALYSIS: #${idA.toString().padStart(4, "0")} ↔ #${idB.toString().padStart(4, "0")}
╚══════════════════════════════════════════════════════════════════════╝

Dynamic: ${rel.dynamic.toUpperCase().replace(/_/g, " ")}
Compatibility: ${compatPercent}% ${"█".repeat(Math.round(compatPercent / 5))}${"░".repeat(20 - Math.round(compatPercent / 5))}

${rel.description}

ASPECTS:
${rel.aspects.map(a => `  ${a.type.padEnd(12)} ${(a.strength * 100).toFixed(0).padStart(3)}%  ${a.description}`).join("\n")}
`;

  if (rel.sharedInterests.length > 0) {
    output += `\nSHARED INTERESTS: ${rel.sharedInterests.join(", ")}`;
  }

  if (rel.tension.length > 0) {
    output += `\n\nTENSION POINTS:\n${rel.tension.map(t => `  ⚡ ${t}`).join("\n")}`;
  }

  return output;
}
