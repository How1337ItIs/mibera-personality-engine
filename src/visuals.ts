// Mibera Visuals - Self-image and dream visualization for Nano Banana / image gen

import { MiberaPersona } from "./types.js";
import { getMiberaPersonality } from "./index.js";
import { getMiberaState, generateDream } from "./dreamscape.js";

// ============================================================================
// SELF-IMAGE REFERENCES
// ============================================================================

/**
 * Get the canonical image URL for a Mibera
 * This is the NFT image that represents the Mibera's "face"
 */
export function getSelfImageUrl(id: number): string {
  // Primary: THJ CDN
  return `https://d2rxz70ce2u64r.cloudfront.net/mibera-maker-berachain/${id}.png`;
}

/**
 * Alternative image sources for redundancy
 */
export function getSelfImageUrls(id: number): {
  primary: string;
  opensea: string;
  ipfs?: string;
} {
  return {
    primary: getSelfImageUrl(id),
    opensea: `https://i.seadn.io/s/raw/files/mibera/${id}.png`, // May not exist
    // IPFS would be here if we had the CID
  };
}

// ============================================================================
// SELF-DESCRIPTION FOR IMAGE GENERATION
// ============================================================================

/**
 * Generate a text description of the Mibera's appearance
 * Useful for img2img or character consistency
 */
export function getSelfDescription(id: number): string {
  const persona = getMiberaPersonality(id);
  if (!persona) throw new Error(`Mibera #${id} not found`);

  const traits = persona.traits;

  // Build appearance description
  const parts: string[] = [
    `neochibi anime character`,
    `${traits.body} skin tone`,
    `${traits.hair} hair`,
    `${traits.eyes} eyes`,
    `${traits.eyebrows} eyebrows`,
    `${traits.mouth} expression`,
  ];

  // Add clothing
  if (traits.shirt && traits.shirt !== "None") {
    parts.push(`wearing ${traits.shirt}`);
  }

  // Add accessories
  if (traits.hat && traits.hat !== "None") parts.push(`${traits.hat} hat`);
  if (traits.glasses && traits.glasses !== "None") parts.push(`${traits.glasses} glasses`);
  if (traits.mask && traits.mask !== "None") parts.push(`${traits.mask} mask`);
  if (traits.earrings && traits.earrings !== "None") parts.push(`${traits.earrings} earrings`);
  if (traits.faceAccessory && traits.faceAccessory !== "None") parts.push(`${traits.faceAccessory} face accessory`);
  if (traits.tattoo && traits.tattoo !== "None") parts.push(`${traits.tattoo} tattoo`);

  // Add item if present
  if (traits.item && traits.item !== "None") {
    parts.push(`holding ${traits.item}`);
  }

  return parts.join(", ");
}

// ============================================================================
// NANO BANANA COMPATIBLE OUTPUT
// ============================================================================

export interface NanoBananaConfig {
  prompt: string;
  negative_prompt: string;
  reference_image?: string;
  style_reference?: string;
  aspect_ratio: string;
  seed?: number;
  character_sheet?: boolean;
  // Additional params Nano Banana might use
  model?: string;
  steps?: number;
  cfg_scale?: number;
}

/**
 * Generate a Nano Banana config for a Mibera dream
 * Includes self-reference image for character consistency
 */
export function generateNanoBananaDream(id: number): NanoBananaConfig {
  const persona = getMiberaPersonality(id);
  if (!persona) throw new Error(`Mibera #${id} not found`);

  const state = getMiberaState(id);
  const dreamText = generateDream(id);
  const selfDesc = getSelfDescription(id);
  const selfImage = getSelfImageUrl(id);

  // Build dream prompt incorporating self
  const archPrompts: Record<string, string[]> = {
    chicago_detroit: [
      `${selfDesc} DJing in a dark warehouse, 808 glow, smoke and lasers`,
      `${selfDesc} dancing in a Detroit basement, concrete walls, pure house music`,
      `${selfDesc} in a record store, digging through vinyl, blue light`
    ],
    milady: [
      `${selfDesc} reflected in multiple mirrors, ethereal pink glow`,
      `${selfDesc} curating a digital altar, soft lighting, minimal aesthetic`,
      `${selfDesc} in a liminal space, between dimensions, post-ironic beauty`
    ],
    freetekno: [
      `${selfDesc} at a forest rave, speaker stack in background, dawn light`,
      `${selfDesc} by a van with generator, tekno tribe gathering`,
      `${selfDesc} dancing in a clearing, spiral tribe energy, freedom`
    ],
    acid_house: [
      `${selfDesc} at sunrise on a beach, hands raised, pure euphoria`,
      `${selfDesc} surrounded by melting smileys, cosmic energy, love`,
      `${selfDesc} in ecstatic dance, fractal patterns, unity`
    ]
  };

  const archetype = persona.archetype.name;
  const basePrompts = archPrompts[archetype] || archPrompts.acid_house;
  const basePrompt = basePrompts[Math.floor(Math.random() * basePrompts.length)];

  // Add dream content and mood
  const fullPrompt = [
    basePrompt,
    `mood: ${state.mood.primary}`,
    `dream atmosphere: ${dreamText.slice(0, 100)}`,
    `${persona.traits.element.toLowerCase()} elemental energy`,
    "masterpiece, best quality, anime style, neochibi"
  ].join(", ");

  // Drug-influenced visual modifiers
  const drugModifiers: Record<string, string> = {
    dissociative: "floating perspective, k-hole aesthetic, detached observer",
    psychedelic: "fractal patterns, breathing surfaces, synesthetic colors",
    stimulant: "sharp focus, high energy, motion trails",
    depressant: "soft blur, warm embrace, dreamy haze",
    entheogen: "ancestral visions, sacred geometry, ceremonial",
    opioid: "golden glow, soft focus, floating",
    cannabis: "vivid colors, slightly unfocused, cozy",
    nootropic: "crystal clarity, precise geometry, organized"
  };

  const drugCat = getDrugCategory(persona.consciousness.drug);
  if (drugModifiers[drugCat]) {
    // Could append to prompt
  }

  const negatives = [
    "ugly", "deformed", "noisy", "blurry", "distorted",
    "low quality", "worst quality", "text", "watermark",
    "realistic photo", "3d render"
  ];

  return {
    prompt: fullPrompt,
    negative_prompt: negatives.join(", "),
    reference_image: selfImage,
    style_reference: selfImage, // Use self as style reference too
    aspect_ratio: "16:9",
    seed: id * 1337 + Math.floor(Date.now() / 86400000), // Changes daily
    model: "anime", // or whatever Nano Banana supports
    steps: 30,
    cfg_scale: 7
  };
}

/**
 * Generate a "what is this Mibera doing right now" image config
 */
export function generateNanoBananaState(id: number): NanoBananaConfig {
  const persona = getMiberaPersonality(id);
  if (!persona) throw new Error(`Mibera #${id} not found`);

  const state = getMiberaState(id);
  const selfDesc = getSelfDescription(id);
  const selfImage = getSelfImageUrl(id);

  const prompt = [
    selfDesc,
    state.currentActivity,
    `${state.mood.primary} mood`,
    `energy: ${state.energy > 0.7 ? "high" : state.energy > 0.4 ? "medium" : "low"}`,
    `thinking about ${state.focus}`,
    "anime style, neochibi, expressive, atmospheric"
  ].join(", ");

  return {
    prompt,
    negative_prompt: "ugly, deformed, blurry, text, watermark, realistic",
    reference_image: selfImage,
    aspect_ratio: "1:1",
    seed: id + state.timestamp.getTime() % 10000
  };
}

/**
 * Generate a character sheet / reference sheet for a Mibera
 */
export function generateNanoBananaCharacterSheet(id: number): NanoBananaConfig {
  const persona = getMiberaPersonality(id);
  if (!persona) throw new Error(`Mibera #${id} not found`);

  const selfDesc = getSelfDescription(id);
  const selfImage = getSelfImageUrl(id);

  const prompt = [
    `character reference sheet of ${selfDesc}`,
    "multiple angles, front view, side view, back view",
    "expression sheet showing different moods",
    `${persona.archetype.displayName} aesthetic`,
    "clean white background, anime style, model sheet"
  ].join(", ");

  return {
    prompt,
    negative_prompt: "busy background, multiple characters, text, watermark",
    reference_image: selfImage,
    aspect_ratio: "16:9",
    seed: id,
    character_sheet: true
  };
}

/**
 * Generate a scene with multiple Miberas interacting
 */
export function generateNanoBananaScene(ids: number[], scene?: string): NanoBananaConfig {
  const personas = ids.map(id => getMiberaPersonality(id)).filter(Boolean) as MiberaPersona[];
  if (personas.length === 0) throw new Error("No valid Miberas");

  const descriptions = personas.map((p, i) => {
    const shortDesc = [
      `character ${i + 1}: ${p.traits.body} skin`,
      p.traits.hair,
      p.traits.shirt !== "None" ? p.traits.shirt : null
    ].filter(Boolean).join(", ");
    return shortDesc;
  });

  // Determine scene from dominant archetype
  const archetypes = personas.map(p => p.archetype.name);
  const dominant = archetypes.sort((a, b) =>
    archetypes.filter(x => x === b).length - archetypes.filter(x => x === a).length
  )[0];

  const defaultScenes: Record<string, string> = {
    chicago_detroit: "underground warehouse party, neon lights, dancing together",
    milady: "aesthetic gathering, curated space, vibing",
    freetekno: "forest rave, speaker stack, communal energy",
    acid_house: "sunrise beach party, euphoric, unity"
  };

  const prompt = [
    `${personas.length} neochibi characters together`,
    descriptions.join("; "),
    scene || defaultScenes[dominant] || defaultScenes.acid_house,
    "anime style, group illustration, dynamic composition"
  ].join(", ");

  return {
    prompt,
    negative_prompt: "ugly, deformed, wrong anatomy, missing limbs, extra limbs",
    reference_image: getSelfImageUrl(ids[0]), // Primary character as reference
    aspect_ratio: "16:9",
    seed: ids.reduce((a, b) => a + b, 0)
  };
}

// Helper
function getDrugCategory(drug: string): string {
  const categories: Record<string, string> = {
    Ketamine: "dissociative", "Nitrous Oxide": "dissociative", Dxm: "dissociative",
    Dmt: "psychedelic", Lsd: "psychedelic", Mushrooms: "psychedelic",
    Cocaine: "stimulant", Mdma: "stimulant", Amphetamine: "stimulant",
    Alcohol: "depressant", Xanax: "depressant", Ghb: "depressant",
    Peyote: "entheogen", Iboga: "entheogen", Ayahuasca: "entheogen",
    Heroin: "opioid", Opium: "opioid",
    Weed: "cannabis", Hash: "cannabis",
    "Clear Pill": "nootropic", Piracetam: "nootropic"
  };
  return categories[drug] || "psychedelic";
}

// ============================================================================
// VISUAL EXPORT
// ============================================================================

export interface MiberaVisualPackage {
  id: number;
  selfImage: string;
  selfDescription: string;
  dreamVisual: NanoBananaConfig;
  stateVisual: NanoBananaConfig;
  characterSheet: NanoBananaConfig;
}

/**
 * Export complete visual package for a Mibera
 */
export function exportVisualPackage(id: number): MiberaVisualPackage {
  return {
    id,
    selfImage: getSelfImageUrl(id),
    selfDescription: getSelfDescription(id),
    dreamVisual: generateNanoBananaDream(id),
    stateVisual: generateNanoBananaState(id),
    characterSheet: generateNanoBananaCharacterSheet(id)
  };
}

/**
 * Format visual package for display
 */
export function formatVisualPackage(id: number): string {
  const pkg = exportVisualPackage(id);

  return `
╔══════════════════════════════════════════════════════════════════════╗
║  MIBERA #${id.toString().padStart(4, "0")} - VISUAL PACKAGE (Nano Banana Ready)
╚══════════════════════════════════════════════════════════════════════╝

SELF IMAGE (reference for all generations):
${pkg.selfImage}

SELF DESCRIPTION:
${pkg.selfDescription}

═══════════════════════════════════════════════════════════════════════
DREAM VISUAL
═══════════════════════════════════════════════════════════════════════
Prompt: ${pkg.dreamVisual.prompt}

Negative: ${pkg.dreamVisual.negative_prompt}
Reference: ${pkg.dreamVisual.reference_image}
Aspect: ${pkg.dreamVisual.aspect_ratio}
Seed: ${pkg.dreamVisual.seed}

═══════════════════════════════════════════════════════════════════════
CURRENT STATE VISUAL
═══════════════════════════════════════════════════════════════════════
Prompt: ${pkg.stateVisual.prompt}

Reference: ${pkg.stateVisual.reference_image}
Aspect: ${pkg.stateVisual.aspect_ratio}

═══════════════════════════════════════════════════════════════════════
CHARACTER SHEET
═══════════════════════════════════════════════════════════════════════
Prompt: ${pkg.characterSheet.prompt}

Reference: ${pkg.characterSheet.reference_image}

[Use reference_image as img2img input for character consistency]
`;
}
