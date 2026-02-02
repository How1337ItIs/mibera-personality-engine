// Consciousness/Drug State Model
// Maps drugs to cognitive modifiers that affect how a Mibera processes information

import { ConsciousnessState, Archetype } from "./types.js";

// Drug categories and their cognitive signatures
type DrugCategory = "dissociative" | "psychedelic" | "stimulant" | "depressant" | "entheogen" | "nootropic" | "baseline";

interface DrugProfile {
  category: DrugCategory;
  ancestors: string[];
  archetype: Archetype;
  // Cognitive modifiers (-1 to 1)
  temporal: number;      // stuck in moment <-> sees all time
  boundaries: number;    // rigid self <-> ego dissolution
  patterns: number;      // literal <-> sees hidden connections
  social: number;        // withdrawn <-> hypersocial
  energy: number;        // sedated <-> manic
  verbosity: number;     // laconic <-> logorrheic
}

// Comprehensive drug mapping based on molecules.md
const DRUG_PROFILES: Record<string, DrugProfile> = {
  // Dissociatives
  "Ketamine": { category: "dissociative", ancestors: ["Nepal", "Turkey"], archetype: Archetype.MILADY, temporal: 0.8, boundaries: 0.9, patterns: 0.6, social: -0.5, energy: -0.3, verbosity: -0.4 },
  "NOS": { category: "dissociative", ancestors: ["Pythia"], archetype: Archetype.ACID_HOUSE, temporal: 0.5, boundaries: 0.7, patterns: 0.4, social: 0.2, energy: 0.3, verbosity: -0.2 },
  "Datura": { category: "dissociative", ancestors: ["Native American"], archetype: Archetype.MILADY, temporal: 0.9, boundaries: 0.95, patterns: 0.8, social: -0.8, energy: -0.2, verbosity: 0.3 },

  // Psychedelics
  "DMT": { category: "psychedelic", ancestors: ["Mayan", "Aboriginal", "Native American"], archetype: Archetype.ACID_HOUSE, temporal: 1.0, boundaries: 1.0, patterns: 1.0, social: -0.3, energy: 0.5, verbosity: 0.6 },
  "LSD": { category: "psychedelic", ancestors: ["Aboriginals", "Haitians"], archetype: Archetype.FREETEKNO, temporal: 0.9, boundaries: 0.8, patterns: 0.95, social: 0.3, energy: 0.6, verbosity: 0.7 },
  "Mushrooms": { category: "psychedelic", ancestors: ["Irish Druids", "Buddhists", "Sami"], archetype: Archetype.ACID_HOUSE, temporal: 0.85, boundaries: 0.75, patterns: 0.9, social: 0.1, energy: 0.2, verbosity: 0.4 },
  "Ayahuasca": { category: "psychedelic", ancestors: ["Mayan"], archetype: Archetype.FREETEKNO, temporal: 0.95, boundaries: 0.85, patterns: 0.9, social: -0.2, energy: 0.1, verbosity: 0.5 },
  "Peyote": { category: "psychedelic", ancestors: ["Native American"], archetype: Archetype.FREETEKNO, temporal: 0.8, boundaries: 0.7, patterns: 0.85, social: 0.0, energy: 0.3, verbosity: 0.3 },
  "2C-B": { category: "psychedelic", ancestors: ["Native American"], archetype: Archetype.FREETEKNO, temporal: 0.6, boundaries: 0.5, patterns: 0.7, social: 0.5, energy: 0.6, verbosity: 0.5 },

  // Stimulants
  "Cocaine": { category: "stimulant", ancestors: ["Ballroom Scene"], archetype: Archetype.CHICAGO_DETROIT, temporal: -0.3, boundaries: -0.2, patterns: 0.3, social: 0.9, energy: 0.9, verbosity: 0.95 },
  "MDMA": { category: "stimulant", ancestors: ["Native American"], archetype: Archetype.MILADY, temporal: 0.2, boundaries: 0.6, patterns: 0.4, social: 1.0, energy: 0.8, verbosity: 0.8 },
  "Methamphetamine": { category: "stimulant", ancestors: ["Chinese", "Palestinian"], archetype: Archetype.MILADY, temporal: -0.5, boundaries: -0.3, patterns: 0.5, social: 0.4, energy: 1.0, verbosity: 0.9 },
  "Caffeine": { category: "stimulant", ancestors: ["Ethiopian", "Arabs", "Traveller", "Chinese", "Japanese"], archetype: Archetype.MILADY, temporal: -0.2, boundaries: 0.0, patterns: 0.2, social: 0.3, energy: 0.5, verbosity: 0.4 },
  "Coffee": { category: "stimulant", ancestors: ["Ethiopian", "Arabs", "Traveller"], archetype: Archetype.MILADY, temporal: -0.1, boundaries: 0.0, patterns: 0.15, social: 0.25, energy: 0.4, verbosity: 0.3 },
  "Khat": { category: "stimulant", ancestors: ["Ethiopian"], archetype: Archetype.FREETEKNO, temporal: 0.0, boundaries: 0.0, patterns: 0.3, social: 0.6, energy: 0.7, verbosity: 0.6 },
  "M-CAT": { category: "stimulant", ancestors: ["Ethiopians"], archetype: Archetype.FREETEKNO, temporal: -0.1, boundaries: 0.3, patterns: 0.4, social: 0.8, energy: 0.85, verbosity: 0.7 },

  // Depressants
  "Alcohol": { category: "depressant", ancestors: ["Sicanje"], archetype: Archetype.CHICAGO_DETROIT, temporal: -0.4, boundaries: 0.3, patterns: -0.3, social: 0.6, energy: -0.2, verbosity: 0.5 },
  "Ethanol": { category: "depressant", ancestors: ["Sicanje"], archetype: Archetype.CHICAGO_DETROIT, temporal: -0.4, boundaries: 0.3, patterns: -0.3, social: 0.6, energy: -0.2, verbosity: 0.5 },
  "Xanax": { category: "depressant", ancestors: ["Hindu"], archetype: Archetype.FREETEKNO, temporal: -0.5, boundaries: 0.2, patterns: -0.4, social: 0.1, energy: -0.7, verbosity: -0.3 },
  "Kava": { category: "depressant", ancestors: ["Polynesian", "Aboriginal"], archetype: Archetype.ACID_HOUSE, temporal: 0.1, boundaries: 0.3, patterns: 0.1, social: 0.4, energy: -0.4, verbosity: 0.1 },

  // Entheogens (ceremonial/spiritual)
  "Iboga": { category: "entheogen", ancestors: ["Gabon"], archetype: Archetype.CHICAGO_DETROIT, temporal: 0.9, boundaries: 0.8, patterns: 0.85, social: -0.4, energy: 0.0, verbosity: 0.4 },
  "Ibogaine": { category: "entheogen", ancestors: ["Gabon"], archetype: Archetype.CHICAGO_DETROIT, temporal: 0.9, boundaries: 0.8, patterns: 0.85, social: -0.4, energy: 0.0, verbosity: 0.4 },
  "Kykeon": { category: "entheogen", ancestors: ["Greek Ancients"], archetype: Archetype.ACID_HOUSE, temporal: 0.85, boundaries: 0.75, patterns: 0.8, social: 0.2, energy: 0.3, verbosity: 0.5 },
  "Ancestral Trance": { category: "entheogen", ancestors: ["Orthodox Jews", "Aboriginal", "Haitians"], archetype: Archetype.FREETEKNO, temporal: 0.95, boundaries: 0.9, patterns: 0.7, social: 0.3, energy: 0.4, verbosity: 0.6 },

  // Nootropics & Clear Pill
  "Clear Pill": { category: "nootropic", ancestors: ["Satanists"], archetype: Archetype.MILADY, temporal: -0.3, boundaries: -0.5, patterns: 0.6, social: 0.2, energy: 0.4, verbosity: 0.3 },
  "Piracetam": { category: "nootropic", ancestors: ["Hindu"], archetype: Archetype.CHICAGO_DETROIT, temporal: 0.0, boundaries: -0.2, patterns: 0.5, social: 0.1, energy: 0.3, verbosity: 0.2 },
  "Brahmi": { category: "nootropic", ancestors: ["Hindu"], archetype: Archetype.CHICAGO_DETROIT, temporal: 0.1, boundaries: -0.1, patterns: 0.4, social: 0.0, energy: 0.2, verbosity: 0.1 },
  "Ashwagandha": { category: "nootropic", ancestors: ["Hindu"], archetype: Archetype.MILADY, temporal: 0.1, boundaries: 0.1, patterns: 0.3, social: 0.2, energy: 0.1, verbosity: 0.0 },

  // Cannabis variants
  "Weed": { category: "depressant", ancestors: ["Rastafarians"], archetype: Archetype.CHICAGO_DETROIT, temporal: 0.3, boundaries: 0.4, patterns: 0.5, social: 0.3, energy: -0.3, verbosity: 0.4 },
  "Bhang": { category: "depressant", ancestors: ["Hindu"], archetype: Archetype.CHICAGO_DETROIT, temporal: 0.35, boundaries: 0.45, patterns: 0.5, social: 0.3, energy: -0.25, verbosity: 0.35 },
  "CBD": { category: "depressant", ancestors: ["Chinese", "Native American"], archetype: Archetype.ACID_HOUSE, temporal: 0.0, boundaries: 0.1, patterns: 0.1, social: 0.1, energy: -0.2, verbosity: -0.1 },
  "THC Edibles": { category: "depressant", ancestors: ["Hindu"], archetype: Archetype.CHICAGO_DETROIT, temporal: 0.5, boundaries: 0.5, patterns: 0.6, social: 0.2, energy: -0.4, verbosity: 0.3 },

  // Tobacco/Nicotine
  "Nicotine": { category: "stimulant", ancestors: ["Native American", "Aboriginal"], archetype: Archetype.CHICAGO_DETROIT, temporal: -0.1, boundaries: 0.0, patterns: 0.1, social: 0.2, energy: 0.3, verbosity: 0.1 },
  "Tobacco": { category: "stimulant", ancestors: ["Hindu"], archetype: Archetype.CHICAGO_DETROIT, temporal: -0.1, boundaries: 0.0, patterns: 0.1, social: 0.2, energy: 0.3, verbosity: 0.1 },
  "Chewing Tobacco": { category: "stimulant", ancestors: ["Hindu", "Native American"], archetype: Archetype.CHICAGO_DETROIT, temporal: -0.1, boundaries: 0.0, patterns: 0.1, social: 0.1, energy: 0.2, verbosity: 0.0 },

  // SSRIs and mood stabilizers
  "Sertraline": { category: "nootropic", ancestors: ["Greek"], archetype: Archetype.FREETEKNO, temporal: 0.0, boundaries: -0.3, patterns: 0.1, social: 0.2, energy: 0.1, verbosity: 0.0 },
  "Lithium": { category: "nootropic", ancestors: ["Irish Druids"], archetype: Archetype.ACID_HOUSE, temporal: 0.0, boundaries: -0.4, patterns: 0.2, social: 0.0, energy: -0.2, verbosity: -0.2 },
  "Lamotrigine": { category: "nootropic", ancestors: ["Irish Druids"], archetype: Archetype.ACID_HOUSE, temporal: 0.0, boundaries: -0.3, patterns: 0.2, social: 0.1, energy: 0.0, verbosity: 0.0 },
  "Iproniazid": { category: "nootropic", ancestors: ["Native American"], archetype: Archetype.FREETEKNO, temporal: 0.1, boundaries: -0.2, patterns: 0.2, social: 0.3, energy: 0.3, verbosity: 0.2 },
  "St. John's Wort": { category: "nootropic", ancestors: ["Greek"], archetype: Archetype.FREETEKNO, temporal: 0.05, boundaries: -0.1, patterns: 0.15, social: 0.2, energy: 0.15, verbosity: 0.1 },

  // Empathogens
  "MDA": { category: "stimulant", ancestors: ["Native American"], archetype: Archetype.MILADY, temporal: 0.3, boundaries: 0.7, patterns: 0.5, social: 0.9, energy: 0.7, verbosity: 0.7 },
  "MMDA": { category: "stimulant", ancestors: ["Arabs"], archetype: Archetype.ACID_HOUSE, temporal: 0.25, boundaries: 0.6, patterns: 0.45, social: 0.85, energy: 0.6, verbosity: 0.6 },

  // Deliriants
  "Henbane": { category: "dissociative", ancestors: ["Greek"], archetype: Archetype.FREETEKNO, temporal: 0.8, boundaries: 0.9, patterns: 0.7, social: -0.7, energy: -0.2, verbosity: 0.4 },
  "Mandrake": { category: "dissociative", ancestors: ["Greek", "Arabs"], archetype: Archetype.FREETEKNO, temporal: 0.85, boundaries: 0.9, patterns: 0.75, social: -0.6, energy: -0.1, verbosity: 0.5 },
  "Scopolamine": { category: "dissociative", ancestors: ["Greek", "Arabs"], archetype: Archetype.FREETEKNO, temporal: 0.9, boundaries: 0.95, patterns: 0.6, social: -0.8, energy: -0.3, verbosity: 0.3 },
  "Benadryl": { category: "dissociative", ancestors: ["Native American"], archetype: Archetype.MILADY, temporal: 0.5, boundaries: 0.6, patterns: 0.4, social: -0.5, energy: -0.6, verbosity: -0.2 },

  // Baseline/Sober
  "Sober": { category: "baseline", ancestors: ["Mongolian"], archetype: Archetype.MILADY, temporal: 0.0, boundaries: 0.0, patterns: 0.0, social: 0.0, energy: 0.0, verbosity: 0.0 },
  "Tea": { category: "stimulant", ancestors: ["Chinese", "Japanese"], archetype: Archetype.MILADY, temporal: 0.05, boundaries: -0.05, patterns: 0.1, social: 0.15, energy: 0.2, verbosity: 0.1 },

  // Hormones
  "Estrogen": { category: "nootropic", ancestors: ["Thai"], archetype: Archetype.MILADY, temporal: 0.1, boundaries: 0.2, patterns: 0.2, social: 0.4, energy: 0.0, verbosity: 0.2 },
  "Testosterone": { category: "stimulant", ancestors: ["Hindu"], archetype: Archetype.MILADY, temporal: -0.1, boundaries: -0.3, patterns: 0.1, social: 0.3, energy: 0.5, verbosity: 0.2 },

  // Exotic plants
  "Kratom": { category: "depressant", ancestors: ["Thai"], archetype: Archetype.MILADY, temporal: 0.1, boundaries: 0.2, patterns: 0.2, social: 0.3, energy: 0.2, verbosity: 0.2 },
  "Acacia": { category: "psychedelic", ancestors: ["Aboriginals"], archetype: Archetype.ACID_HOUSE, temporal: 0.6, boundaries: 0.5, patterns: 0.7, social: 0.0, energy: 0.2, verbosity: 0.3 },
  "Poppers": { category: "stimulant", ancestors: ["Stonewall"], archetype: Archetype.CHICAGO_DETROIT, temporal: 0.3, boundaries: 0.5, patterns: 0.2, social: 0.7, energy: 0.6, verbosity: 0.3 },
};

// Default profile for unknown drugs
const DEFAULT_PROFILE: DrugProfile = {
  category: "baseline",
  ancestors: [],
  archetype: Archetype.FREETEKNO,
  temporal: 0,
  boundaries: 0,
  patterns: 0,
  social: 0,
  energy: 0,
  verbosity: 0
};

export function computeConsciousnessState(drug: string, archetype: Archetype): ConsciousnessState {
  // Normalize drug name for lookup
  const normalizedDrug = drug.replace(/['']/g, "'").trim();
  const profile = DRUG_PROFILES[normalizedDrug] || DEFAULT_PROFILE;

  return {
    drug: normalizedDrug,
    archetype,
    ancestors: profile.ancestors,
    temporalPerception: profile.temporal,
    boundaryDissolution: profile.boundaries,
    patternRecognition: profile.patterns,
    socialAffinity: profile.social,
    energyLevel: profile.energy,
    verbosity: profile.verbosity
  };
}

export function getDrugCategory(drug: string): DrugCategory {
  const normalizedDrug = drug.replace(/['']/g, "'").trim();
  return DRUG_PROFILES[normalizedDrug]?.category || "baseline";
}

export function describeTemporalMode(state: ConsciousnessState): string {
  if (state.temporalPerception > 0.8) return "sees all time as one - past/present/future coexist";
  if (state.temporalPerception > 0.5) return "experiences time as spiral, not line";
  if (state.temporalPerception > 0.2) return "moments stretch and contract";
  if (state.temporalPerception < -0.3) return "hyper-focused on the present instant";
  return "standard temporal flow";
}

export function describeBoundaries(state: ConsciousnessState): string {
  if (state.boundaryDissolution > 0.8) return "ego boundaries dissolved - self merges with environment";
  if (state.boundaryDissolution > 0.5) return "permeable sense of self";
  if (state.boundaryDissolution > 0.2) return "occasional boundary softening";
  if (state.boundaryDissolution < -0.3) return "rigid, well-defined sense of self";
  return "stable self-concept";
}

export function describePatterns(state: ConsciousnessState): string {
  if (state.patternRecognition > 0.8) return "sees hidden connections everywhere - visionary";
  if (state.patternRecognition > 0.5) return "notices patterns others miss";
  if (state.patternRecognition > 0.2) return "slightly enhanced pattern detection";
  if (state.patternRecognition < -0.3) return "very literal, concrete thinking";
  return "standard pattern recognition";
}

export function describeSocialMode(state: ConsciousnessState): string {
  if (state.socialAffinity > 0.8) return "intensely social - craves connection";
  if (state.socialAffinity > 0.4) return "socially energized";
  if (state.socialAffinity < -0.5) return "deeply withdrawn, prefers solitude";
  if (state.socialAffinity < -0.2) return "selectively social";
  return "balanced social engagement";
}
