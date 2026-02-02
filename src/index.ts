// Mibera Personality Engine - Main API
// Generate unique daemon personalities for 10,000 Miberas from Codex data

import { loadMiberaFromCodex, loadAllMiberas } from "./loader.js";
import { computePersonalityVector, computeAstrology } from "./parser.js";
import { computeConsciousnessState } from "./consciousness.js";
import { getArchetypeProfile } from "./archetypes.js";
import { createMiberaPersona } from "./generator.js";
import { MiberaPersona, MiberaTraits } from "./types.js";

export * from "./types.js";
export { getArchetypeProfile } from "./archetypes.js";
export { computeConsciousnessState, getDrugCategory } from "./consciousness.js";
export { loadMiberaFromCodex, loadAllMiberas } from "./loader.js";

/**
 * Generate a complete personality for a Mibera by ID
 * This is the main entry point for the engine
 */
export function getMiberaPersonality(id: number): MiberaPersona | null {
  // Load raw traits from Codex
  const traits = loadMiberaFromCodex(id);
  if (!traits) {
    return null;
  }

  return generatePersonalityFromTraits(traits);
}

/**
 * Generate personality from pre-loaded traits
 */
export function generatePersonalityFromTraits(traits: MiberaTraits): MiberaPersona {
  // Compute personality vector from visual traits
  const personality = computePersonalityVector(traits);

  // Get archetype profile
  const archetype = getArchetypeProfile(traits.archetype);

  // Compute consciousness state from drug affinity
  const consciousness = computeConsciousnessState(traits.drug, traits.archetype);

  // Compute astrological profile
  const astrology = computeAstrology(traits);

  // Generate complete persona
  return createMiberaPersona(traits, personality, consciousness, archetype, astrology);
}

/**
 * Generate personalities for a range of Miberas
 */
export function getMiberaPersonalities(start: number, end: number): MiberaPersona[] {
  const personas: MiberaPersona[] = [];
  for (let i = start; i <= end; i++) {
    const persona = getMiberaPersonality(i);
    if (persona) {
      personas.push(persona);
    }
  }
  return personas;
}

/**
 * Get just the system prompt for a Mibera (for quick integration)
 */
export function getMiberaSystemPrompt(id: number): string | null {
  const persona = getMiberaPersonality(id);
  return persona?.systemPrompt || null;
}

/**
 * Export persona to JSON (for storage/caching)
 */
export function exportPersonaToJSON(persona: MiberaPersona): string {
  return JSON.stringify(persona, null, 2);
}

/**
 * Export just the essential config for an agent (Legba/OpenClaw compatible)
 */
export function exportAgentConfig(persona: MiberaPersona): object {
  return {
    id: persona.id,
    name: `Mibera #${persona.id}`,
    systemPrompt: persona.systemPrompt,
    voice: persona.voice,
    interests: persona.interests,
    metadata: {
      archetype: persona.archetype.name,
      drug: persona.consciousness.drug,
      element: persona.traits.element,
      sunSign: persona.astrology.sunSign,
      swagRank: persona.traits.swagRank
    }
  };
}
