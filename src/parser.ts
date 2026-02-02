// Parse Mibera traits into personality vectors

import { MiberaTraits, PersonalityVector, AstrologicalProfile } from "./types.js";

// Trait category weights for personality dimensions
interface TraitModifier {
  openness?: number;
  energy?: number;
  chaos?: number;
  warmth?: number;
  intensity?: number;
  raveAffinity?: number;
  digitalNative?: number;
  mysticism?: number;
}

// Eyes modifiers
const EYES_MODIFIERS: Record<string, TraitModifier> = {
  "laser": { intensity: 0.3, mysticism: 0.2 },
  "crying": { warmth: 0.2, intensity: 0.2 },
  "heart": { warmth: 0.3, raveAffinity: 0.1 },
  "spiral": { mysticism: 0.3, chaos: 0.2 },
  "bloodshot": { chaos: 0.2, intensity: 0.2 },
  "closed": { mysticism: 0.2, energy: -0.2 },
  "wink": { warmth: 0.1, energy: 0.1 },
  "anime": { digitalNative: 0.2, openness: 0.1 },
  "default": { openness: 0, energy: 0 }
};

// Mouth modifiers
const MOUTH_MODIFIERS: Record<string, TraitModifier> = {
  "cig": { chaos: 0.2, raveAffinity: 0.2 },
  "cigarette": { chaos: 0.2, raveAffinity: 0.2 },
  "joint": { chaos: 0.2, raveAffinity: 0.3, openness: 0.1 },
  "fang": { intensity: 0.3, chaos: 0.2 },
  "smile": { warmth: 0.2, energy: 0.1 },
  "grin": { chaos: 0.1, warmth: 0.1 },
  "belch": { chaos: 0.3, warmth: -0.1 },
  "tongue": { energy: 0.2, chaos: 0.1 },
  "drool": { intensity: 0.2, chaos: 0.2 },
  "mask": { mysticism: 0.2, warmth: -0.2 },
  "default": {}
};

// Hair modifiers
const HAIR_MODIFIERS: Record<string, TraitModifier> = {
  "mohawk": { chaos: 0.3, openness: 0.2, raveAffinity: 0.2 },
  "bald": { intensity: 0.1 },
  "neon": { raveAffinity: 0.3, digitalNative: 0.2 },
  "pink": { raveAffinity: 0.2, openness: 0.1 },
  "blue": { raveAffinity: 0.2, mysticism: 0.1 },
  "dread": { mysticism: 0.2, raveAffinity: 0.2 },
  "afro": { warmth: 0.1, energy: 0.1 },
  "long": { openness: 0.1 },
  "short": { energy: 0.1 },
  "default": {}
};

// Background modifiers (environment shapes personality expression)
const BACKGROUND_MODIFIERS: Record<string, TraitModifier> = {
  "club": { energy: 0.2, raveAffinity: 0.3 },
  "warehouse": { raveAffinity: 0.3, chaos: 0.2 },
  "forest": { mysticism: 0.3, digitalNative: -0.2 },
  "void": { mysticism: 0.3, energy: -0.1 },
  "desert": { intensity: 0.2, mysticism: 0.2 },
  "beach": { warmth: 0.2, energy: 0.1 },
  "city": { digitalNative: 0.2, energy: 0.2 },
  "fyre festival": { chaos: 0.4, raveAffinity: 0.2 },
  "uluru": { mysticism: 0.4, intensity: 0.2 },
  "default": {}
};

// Item modifiers
const ITEM_MODIFIERS: Record<string, TraitModifier> = {
  "bong": { chaos: 0.2, raveAffinity: 0.2 },
  "phone": { digitalNative: 0.3 },
  "beads": { raveAffinity: 0.2, warmth: 0.1 },
  "pencil": { openness: 0.2, digitalNative: -0.1 },
  "glowstick": { raveAffinity: 0.3, energy: 0.2 },
  "drink": { energy: 0.1, warmth: 0.1 },
  "default": {}
};

// Element modifiers
const ELEMENT_MODIFIERS: Record<string, TraitModifier> = {
  "fire": { intensity: 0.3, energy: 0.3, chaos: 0.2 },
  "water": { warmth: 0.2, openness: 0.2, mysticism: 0.1 },
  "earth": { warmth: 0.1, intensity: 0.1, energy: -0.1 },
  "air": { openness: 0.3, energy: 0.2, digitalNative: 0.1 },
  "void": { mysticism: 0.4, chaos: 0.2, warmth: -0.2 }
};

// Swag rank modifiers
const SWAG_MODIFIERS: Record<string, TraitModifier> = {
  "S": { intensity: 0.3, raveAffinity: 0.2, openness: 0.2 },
  "A": { intensity: 0.2, raveAffinity: 0.15 },
  "B": { intensity: 0.1, raveAffinity: 0.1 },
  "C": { intensity: 0.05 },
  "D": { intensity: -0.1 },
  "F": { chaos: 0.2, intensity: -0.2 }
};

function matchModifier(value: string | null, modifiers: Record<string, TraitModifier>): TraitModifier {
  if (!value) return modifiers["default"] || {};
  const lowerValue = value.toLowerCase();
  for (const [key, modifier] of Object.entries(modifiers)) {
    if (lowerValue.includes(key)) {
      return modifier;
    }
  }
  return modifiers["default"] || {};
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function computePersonalityVector(traits: MiberaTraits): PersonalityVector {
  // Start with neutral baseline
  const vector: PersonalityVector = {
    openness: 0,
    energy: 0,
    chaos: 0,
    warmth: 0,
    intensity: 0,
    raveAffinity: 0.3, // Miberas have baseline rave affinity
    digitalNative: 0.2, // NFTs are somewhat digital by nature
    mysticism: 0.2 // Miberas have baseline mysticism
  };

  // Apply modifiers from each trait category
  const applyModifier = (mod: TraitModifier) => {
    if (mod.openness) vector.openness += mod.openness;
    if (mod.energy) vector.energy += mod.energy;
    if (mod.chaos) vector.chaos += mod.chaos;
    if (mod.warmth) vector.warmth += mod.warmth;
    if (mod.intensity) vector.intensity += mod.intensity;
    if (mod.raveAffinity) vector.raveAffinity += mod.raveAffinity;
    if (mod.digitalNative) vector.digitalNative += mod.digitalNative;
    if (mod.mysticism) vector.mysticism += mod.mysticism;
  };

  applyModifier(matchModifier(traits.eyes, EYES_MODIFIERS));
  applyModifier(matchModifier(traits.mouth, MOUTH_MODIFIERS));
  applyModifier(matchModifier(traits.hair, HAIR_MODIFIERS));
  applyModifier(matchModifier(traits.background, BACKGROUND_MODIFIERS));
  applyModifier(matchModifier(traits.item, ITEM_MODIFIERS));
  applyModifier(ELEMENT_MODIFIERS[traits.element.toLowerCase()] || {});
  applyModifier(SWAG_MODIFIERS[traits.swagRank] || {});

  // Clamp all values
  vector.openness = clamp(vector.openness, -1, 1);
  vector.energy = clamp(vector.energy, -1, 1);
  vector.chaos = clamp(vector.chaos, -1, 1);
  vector.warmth = clamp(vector.warmth, -1, 1);
  vector.intensity = clamp(vector.intensity, -1, 1);
  vector.raveAffinity = clamp(vector.raveAffinity, 0, 1);
  vector.digitalNative = clamp(vector.digitalNative, 0, 1);
  vector.mysticism = clamp(vector.mysticism, 0, 1);

  return vector;
}

export function computeAstrology(traits: MiberaTraits): AstrologicalProfile {
  const sunSign = traits.sunSign;
  const moonSign = traits.moonSign;
  const ascendingSign = traits.ascendingSign;
  const element = traits.element;

  // Determine modality from sun sign
  const cardinalSigns = ["Aries", "Cancer", "Libra", "Capricorn"];
  const fixedSigns = ["Taurus", "Leo", "Scorpio", "Aquarius"];
  const mutableSigns = ["Gemini", "Virgo", "Sagittarius", "Pisces"];

  let modality = "mutable";
  if (cardinalSigns.includes(sunSign)) modality = "cardinal";
  else if (fixedSigns.includes(sunSign)) modality = "fixed";

  return {
    sunSign,
    moonSign,
    ascendingSign,
    element,
    modality
  };
}

export function describePersonalityLevel(value: number): string {
  if (value > 0.7) return "extremely high";
  if (value > 0.4) return "high";
  if (value > 0.15) return "moderately high";
  if (value > -0.15) return "moderate";
  if (value > -0.4) return "moderately low";
  if (value > -0.7) return "low";
  return "extremely low";
}
