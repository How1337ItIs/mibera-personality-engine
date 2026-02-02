// Rave Generator - Create experiences from Mibera personalities
// "Online to get offline" - digital tools serving embodied experience

import { MiberaPersona, Archetype } from "./types.js";
import { getMiberaPersonality } from "./index.js";
import { getMiberaState, generateDream } from "./dreamscape.js";
import { getRelationship } from "./social-graph.js";

// ============================================================================
// VISUAL DREAM GENERATION (for Nano Banana / Stable Diffusion / etc)
// ============================================================================

export interface DreamVisual {
  prompt: string;
  negativePrompt: string;
  style: string;
  aspectRatio: string;
  mood: string;
  colorPalette: string[];
  suggestedSeed?: number;
}

// Visual style by archetype
const VISUAL_STYLES: Record<string, {
  baseStyle: string;
  modifiers: string[];
  colorPalettes: string[][];
  negatives: string[];
}> = {
  chicago_detroit: {
    baseStyle: "dark industrial photography, neon-lit warehouse interior, grainy film texture",
    modifiers: [
      "smoke-filled basement club",
      "abandoned Detroit factory converted to dancefloor",
      "vintage Roland TR-808 in blue light",
      "silhouettes dancing in fog",
      "concrete and steel architecture"
    ],
    colorPalettes: [
      ["#1a1a2e", "#16213e", "#0f3460", "#e94560"], // Deep blue-red
      ["#2d2d2d", "#404040", "#fb8b24", "#e36414"], // Industrial orange
      ["#0d0d0d", "#1a1a2e", "#4a0e5c", "#e94560"]  // Purple-magenta
    ],
    negatives: ["bright daylight, cartoon, anime, text, watermark, clean modern office"]
  },
  milady: {
    baseStyle: "ethereal digital art, soft focus, pastel dreamscape, kawaii aesthetic meets liminal space",
    modifiers: [
      "curated altar with small objects",
      "mirror reflections showing multiple selves",
      "perfectly arranged bedroom at golden hour",
      "elegant figure in post-ironic pose",
      "screen glow illuminating delicate features"
    ],
    colorPalettes: [
      ["#fdf6f6", "#f8e1e1", "#d4a5a5", "#9e7676"], // Soft pink
      ["#f5f5dc", "#e8d5b7", "#b7a99a", "#867070"], // Cream beige
      ["#e4d4f4", "#d4b9e8", "#b392ac", "#735d78"]  // Lavender
    ],
    negatives: ["ugly, deformed, noisy, blurry, distorted, grainy, masculine, dark, gritty"]
  },
  freetekno: {
    baseStyle: "documentary photography, forest rave at night, sound system in nature, DIY aesthetic",
    modifiers: [
      "speaker stack in misty forest clearing",
      "tekno van with generator running",
      "spiral tribe gathering at dawn",
      "dancers in camo and functional clothing",
      "campfire next to industrial equipment"
    ],
    colorPalettes: [
      ["#1a1a1d", "#2d5a27", "#8b9467", "#c5d86d"], // Forest green
      ["#2b2b2b", "#4a4a4a", "#8b8b00", "#c5d86d"], // Military olive
      ["#0a0a0a", "#1a3a1a", "#2d5a27", "#4a8b4a"]  // Deep forest
    ],
    negatives: ["clean, polished, corporate, bright studio lighting, fashion photography"]
  },
  acid_house: {
    baseStyle: "psychedelic art, sunrise over ocean, smiley face motifs, euphoric energy, liquid fractals",
    modifiers: [
      "beach at sunrise with dancers silhouetted",
      "melting smiley faces in neon colors",
      "cosmic swirls and fractal patterns",
      "hands raised in collective ecstasy",
      "ibiza sunset with balearic vibes"
    ],
    colorPalettes: [
      ["#ffdd00", "#ff6b6b", "#c44569", "#546de5"], // Smiley bright
      ["#ff9a9e", "#fecfef", "#ffecd2", "#fcb69f"], // Sunrise gradient
      ["#a8ff78", "#78ffd6", "#00d4ff", "#a445b2"]  // Acid rainbow
    ],
    negatives: ["dark, gothic, aggressive, violent, sad, monochrome, corporate"]
  }
};

// Drug visual modifiers
const DRUG_VISUALS: Record<string, string> = {
  dissociative: "fisheye lens distortion, floating perspective, detached observer viewpoint, blurred edges",
  psychedelic: "fractal patterns, breathing surfaces, trails and tracers, synesthetic color bleed",
  stimulant: "sharp focus, high contrast, motion blur, energetic movement captured",
  depressant: "soft blur, warm tones, dreamy haze, slow motion feeling",
  entheogen: "ancient symbols, ancestral faces in patterns, ceremonial atmosphere, sacred geometry",
  opioid: "extreme soft focus, warm embrace feeling, golden hour everything, floating sensation",
  cannabis: "slightly unfocused, vivid colors, food in frame somehow, cozy vibes",
  nootropic: "crystal clarity, precise geometry, clean lines, organized chaos"
};

const DRUG_CATEGORY: Record<string, string> = {
  Ketamine: "dissociative", "Nitrous Oxide": "dissociative", Dxm: "dissociative",
  Pcp: "dissociative", Mxe: "dissociative", Datura: "dissociative", Salvia: "dissociative",
  Dmt: "psychedelic", Lsd: "psychedelic", Mushrooms: "psychedelic", "2cb": "psychedelic",
  Mescaline: "psychedelic", "5-Meo-Dmt": "psychedelic", Amt: "psychedelic",
  Cocaine: "stimulant", Mdma: "stimulant", Amphetamine: "stimulant", Caffeine: "stimulant",
  Mda: "stimulant", Meth: "stimulant", Crack: "stimulant", Adderall: "stimulant",
  Alcohol: "depressant", Xanax: "depressant", Ghb: "depressant", Kava: "depressant",
  Valium: "depressant", Quaalude: "depressant", Phenibut: "depressant",
  Peyote: "entheogen", Iboga: "entheogen", Ayahuasca: "entheogen", "San Pedro": "entheogen",
  Heroin: "opioid", Opium: "opioid", Morphine: "opioid", Codeine: "opioid", Fentanyl: "opioid",
  Weed: "cannabis", Hash: "cannabis", Thc: "cannabis", Edibles: "cannabis",
  "Clear Pill": "nootropic", Piracetam: "nootropic", Modafinil: "nootropic",
};

// Element visual modifiers
const ELEMENT_VISUALS: Record<string, string> = {
  Fire: "flames, warm oranges and reds, sparks, intense lighting, heat shimmer",
  Water: "flowing, reflections, blues and teals, liquid surfaces, rain or ocean",
  Air: "ethereal, floating elements, light and airy, clouds, wind movement",
  Earth: "grounded, browns and greens, natural textures, stone and wood, rooted"
};

/**
 * Generate an image prompt for a Mibera's dream
 */
export function generateDreamVisual(id: number): DreamVisual {
  const persona = getMiberaPersonality(id);
  if (!persona) throw new Error(`Mibera #${id} not found`);

  const state = getMiberaState(id);
  const dreamText = generateDream(id);

  const archetype = persona.archetype.name;
  const style = VISUAL_STYLES[archetype] || VISUAL_STYLES.acid_house;

  const drugCat = DRUG_CATEGORY[persona.consciousness.drug] || "psychedelic";
  const drugVisual = DRUG_VISUALS[drugCat] || "";

  const elementVisual = ELEMENT_VISUALS[persona.traits.element] || "";

  // Select random modifier and palette
  const modifier = style.modifiers[Math.floor(Math.random() * style.modifiers.length)];
  const palette = style.colorPalettes[Math.floor(Math.random() * style.colorPalettes.length)];

  // Build prompt
  const prompt = [
    style.baseStyle,
    modifier,
    drugVisual,
    elementVisual,
    `mood: ${state.mood.primary}`,
    `dream scene: ${dreamText.slice(0, 200)}`,
    "masterpiece, best quality, highly detailed"
  ].filter(Boolean).join(", ");

  const negativePrompt = style.negatives.join(", ");

  return {
    prompt,
    negativePrompt,
    style: archetype,
    aspectRatio: "16:9",
    mood: state.mood.primary,
    colorPalette: palette,
    suggestedSeed: id * 1337 // Reproducible per Mibera
  };
}

/**
 * Generate a visual for the Mibera's current state
 */
export function generateStateVisual(id: number): DreamVisual {
  const persona = getMiberaPersonality(id);
  if (!persona) throw new Error(`Mibera #${id} not found`);

  const state = getMiberaState(id);
  const archetype = persona.archetype.name;
  const style = VISUAL_STYLES[archetype] || VISUAL_STYLES.acid_house;

  const modifier = style.modifiers[Math.floor(Math.random() * style.modifiers.length)];
  const palette = style.colorPalettes[Math.floor(Math.random() * style.colorPalettes.length)];

  const prompt = [
    style.baseStyle,
    modifier,
    `${state.mood.primary} atmosphere`,
    `energy level: ${state.energy > 0.7 ? "high intensity" : state.energy > 0.4 ? "moderate" : "low key"}`,
    `activity: ${state.currentActivity}`,
    ELEMENT_VISUALS[persona.traits.element] || "",
    "cinematic lighting, atmospheric, masterpiece"
  ].filter(Boolean).join(", ");

  return {
    prompt,
    negativePrompt: style.negatives.join(", "),
    style: archetype,
    aspectRatio: "1:1",
    mood: state.mood.primary,
    colorPalette: palette,
    suggestedSeed: id + Date.now() % 10000
  };
}

// ============================================================================
// RAVE GENERATION
// ============================================================================

export interface RaveConfig {
  miberas: number[];
  vibe?: string;
  duration?: number; // hours
  location?: string;
}

export interface GeneratedRave {
  name: string;
  tagline: string;
  lineup: RaveLineupSlot[];
  vibe: RaveVibe;
  location: RaveLocation;
  visual: DreamVisual;
  playlist: PlaylistSeed;
  duration: number;
  attendees: number[];
}

export interface RaveLineupSlot {
  miberaId: number;
  archetype: string;
  slot: string;
  style: string;
  bpm: number;
}

export interface RaveVibe {
  energy: number;
  chaos: number;
  warmth: number;
  mysticism: number;
  dominantElement: string;
  dominantArchetype: string;
  description: string;
}

export interface RaveLocation {
  type: string;
  description: string;
  coordinates?: { lat: number; lng: number };
}

export interface PlaylistSeed {
  genres: string[];
  bpmRange: { min: number; max: number };
  energy: string;
  mood: string;
  spotifySeeds: string[]; // Artist/track seeds for Spotify API
}

// Genre mapping by archetype
const ARCHETYPE_GENRES: Record<string, { genres: string[]; artists: string[] }> = {
  chicago_detroit: {
    genres: ["chicago house", "detroit techno", "deep house", "garage house", "electro"],
    artists: ["Frankie Knuckles", "Derrick May", "Juan Atkins", "Larry Heard", "Kevin Saunderson"]
  },
  milady: {
    genres: ["hyperpop", "ethereal wave", "dream pop", "glitchcore", "art pop"],
    artists: ["Sophie", "Arca", "Grimes", "100 gecs", "Caroline Polachek"]
  },
  freetekno: {
    genres: ["tekno", "acidcore", "frenchcore", "tribe", "spiral tribe"],
    artists: ["Spiral Tribe", "Metek", "Crystal Distortion", "Teknambul", "Infektion"]
  },
  acid_house: {
    genres: ["acid house", "balearic beat", "new beat", "rave", "trance"],
    artists: ["Phuture", "808 State", "A Guy Called Gerald", "Danny Tenaglia", "Sasha"]
  }
};

// BPM ranges by archetype
const ARCHETYPE_BPM: Record<string, { min: number; max: number; peak: number }> = {
  chicago_detroit: { min: 118, max: 130, peak: 124 },
  milady: { min: 140, max: 180, peak: 160 },
  freetekno: { min: 150, max: 200, peak: 175 },
  acid_house: { min: 120, max: 140, peak: 130 }
};

// Location types by archetype
const ARCHETYPE_LOCATIONS: Record<string, { types: string[]; descriptions: string[] }> = {
  chicago_detroit: {
    types: ["warehouse", "basement", "loft", "abandoned factory"],
    descriptions: [
      "converted warehouse, brick walls sweating with condensation",
      "underground basement club, low ceiling, no windows",
      "industrial loft space, exposed pipes, single strobe"
    ]
  },
  milady: {
    types: ["gallery", "rooftop", "boutique space", "virtual"],
    descriptions: [
      "minimalist gallery space, projections on white walls",
      "secret rooftop, city lights below, curated crowd",
      "invitation-only popup, location shared via encrypted DM"
    ]
  },
  freetekno: {
    types: ["forest", "field", "squat", "quarry", "border crossing"],
    descriptions: [
      "deep forest clearing, generator humming, coordinates dropped at midnight",
      "abandoned quarry, sound echoing off stone walls",
      "traveling teknival, somewhere between three countries"
    ]
  },
  acid_house: {
    types: ["beach", "club", "field", "warehouse"],
    descriptions: [
      "beach at sunrise, everyone still dancing from last night",
      "legendary club, sweat dripping from the ceiling",
      "open field, thousands of people, one heartbeat"
    ]
  }
};

/**
 * Calculate collective vibe from multiple Miberas
 */
function calculateCollectiveVibe(miberas: MiberaPersona[]): RaveVibe {
  let totalEnergy = 0, totalChaos = 0, totalWarmth = 0, totalMysticism = 0;
  const elements: Record<string, number> = {};
  const archetypes: Record<string, number> = {};

  for (const m of miberas) {
    totalEnergy += m.personality.energy;
    totalChaos += m.personality.chaos;
    totalWarmth += m.personality.warmth;
    totalMysticism += m.personality.mysticism;
    elements[m.traits.element] = (elements[m.traits.element] || 0) + 1;
    archetypes[m.archetype.name] = (archetypes[m.archetype.name] || 0) + 1;
  }

  const n = miberas.length || 1;
  const avgEnergy = totalEnergy / n;
  const avgChaos = totalChaos / n;
  const avgWarmth = totalWarmth / n;
  const avgMysticism = totalMysticism / n;

  const dominantElement = Object.entries(elements).sort((a, b) => b[1] - a[1])[0]?.[0] || "Fire";
  const dominantArchetype = Object.entries(archetypes).sort((a, b) => b[1] - a[1])[0]?.[0] || "acid_house";

  // Generate vibe description
  let description = "";
  if (avgEnergy > 0.3 && avgWarmth > 0.3) description = "euphoric and connected";
  else if (avgEnergy > 0.3 && avgChaos > 0.3) description = "wild and unpredictable";
  else if (avgMysticism > 0.4) description = "transcendent and otherworldly";
  else if (avgWarmth > 0.4) description = "intimate and warm";
  else if (avgChaos < -0.2) description = "focused and precise";
  else description = "balanced and flowing";

  return {
    energy: avgEnergy,
    chaos: avgChaos,
    warmth: avgWarmth,
    mysticism: avgMysticism,
    dominantElement,
    dominantArchetype,
    description
  };
}

/**
 * Generate a rave from Mibera IDs
 */
export function generateRave(config: RaveConfig): GeneratedRave {
  const { miberas: miberaIds, vibe, duration = 6, location } = config;

  // Load personas
  const personas = miberaIds
    .map(id => getMiberaPersonality(id))
    .filter((p): p is MiberaPersona => p !== null);

  if (personas.length === 0) {
    throw new Error("No valid Miberas provided");
  }

  // Calculate collective vibe
  const raveVibe = calculateCollectiveVibe(personas);
  const dominantArch = raveVibe.dominantArchetype;

  // Generate lineup
  const lineup: RaveLineupSlot[] = personas.map((p, i) => {
    const bpmRange = ARCHETYPE_BPM[p.archetype.name] || ARCHETYPE_BPM.acid_house;
    const hourOffset = Math.floor(i * (duration / personas.length));
    const slot = `${(22 + hourOffset) % 24}:00 - ${(22 + hourOffset + Math.ceil(duration / personas.length)) % 24}:00`;

    return {
      miberaId: p.id,
      archetype: p.archetype.displayName,
      slot,
      style: ARCHETYPE_GENRES[p.archetype.name]?.genres[0] || "house",
      bpm: bpmRange.min + Math.floor(Math.random() * (bpmRange.max - bpmRange.min))
    };
  });

  // Generate location
  const locOptions = ARCHETYPE_LOCATIONS[dominantArch] || ARCHETYPE_LOCATIONS.acid_house;
  const locType = locOptions.types[Math.floor(Math.random() * locOptions.types.length)];
  const locDesc = locOptions.descriptions[Math.floor(Math.random() * locOptions.descriptions.length)];

  const raveLocation: RaveLocation = {
    type: location || locType,
    description: locDesc,
    coordinates: personas[0] ? personas[0].traits.birthCoordinates : undefined
  };

  // Generate visual
  const visual = generateDreamVisual(personas[0].id);

  // Generate playlist seed
  const genreInfo = ARCHETYPE_GENRES[dominantArch] || ARCHETYPE_GENRES.acid_house;
  const bpmRange = ARCHETYPE_BPM[dominantArch] || ARCHETYPE_BPM.acid_house;

  const playlist: PlaylistSeed = {
    genres: genreInfo.genres.slice(0, 3),
    bpmRange: { min: bpmRange.min, max: bpmRange.max },
    energy: raveVibe.energy > 0.3 ? "high" : raveVibe.energy > 0 ? "medium" : "low",
    mood: raveVibe.warmth > 0.3 ? "euphoric" : raveVibe.mysticism > 0.3 ? "hypnotic" : "driving",
    spotifySeeds: genreInfo.artists.slice(0, 5)
  };

  // Generate name and tagline
  const nameTemplates: Record<string, string[]> = {
    chicago_detroit: ["The Basement Sessions", "Underground Movement", "House Nation", "Detroit Love"],
    milady: ["Curated", "The Algorithm", "Post-Rave", "Aesthetic Experience"],
    freetekno: ["TAZ", "Spiral", "Free Party", "Teknival", "The Gathering"],
    acid_house: ["Summer of Love", "Sunrise", "Unity", "Shoom Revival"]
  };

  const names = nameTemplates[dominantArch] || nameTemplates.acid_house;
  const name = names[Math.floor(Math.random() * names.length)];

  const tagline = `${personas.length} Miberas. ${duration} hours. ${raveVibe.description}. ${raveLocation.type}.`;

  // Find compatible attendees (sample)
  const attendees = miberaIds.slice(); // Start with the lineup
  for (let i = 1; i <= 100 && attendees.length < 50; i++) {
    const randomId = Math.floor(Math.random() * 10000) + 1;
    if (!attendees.includes(randomId)) {
      const rel = getRelationship(personas[0].id, randomId);
      if (rel && rel.compatibility > 0.5) {
        attendees.push(randomId);
      }
    }
  }

  return {
    name,
    tagline,
    lineup,
    vibe: raveVibe,
    location: raveLocation,
    visual,
    playlist,
    duration,
    attendees
  };
}

/**
 * Format rave for display
 */
export function formatRave(rave: GeneratedRave): string {
  return `
╔══════════════════════════════════════════════════════════════════════╗
║  ${rave.name.toUpperCase().padEnd(64)}║
║  ${rave.tagline.slice(0, 64).padEnd(64)}║
╚══════════════════════════════════════════════════════════════════════╝

LOCATION: ${rave.location.type}
${rave.location.description}

VIBE: ${rave.vibe.description}
Energy: ${(rave.vibe.energy * 100).toFixed(0)}% | Chaos: ${(rave.vibe.chaos * 100).toFixed(0)}% | Warmth: ${(rave.vibe.warmth * 100).toFixed(0)}%
Dominant Element: ${rave.vibe.dominantElement} | Dominant Archetype: ${rave.vibe.dominantArchetype}

LINEUP:
${rave.lineup.map(slot => `  ${slot.slot}  Mibera #${slot.miberaId.toString().padStart(4, "0")} [${slot.archetype}] - ${slot.style} @ ${slot.bpm} BPM`).join("\n")}

PLAYLIST SEED:
  Genres: ${rave.playlist.genres.join(", ")}
  BPM: ${rave.playlist.bpmRange.min}-${rave.playlist.bpmRange.max}
  Energy: ${rave.playlist.energy} | Mood: ${rave.playlist.mood}
  Spotify Artists: ${rave.playlist.spotifySeeds.join(", ")}

EXPECTED ATTENDANCE: ${rave.attendees.length} Miberas

VISUAL PROMPT (for image generation):
${rave.visual.prompt}

Negative: ${rave.visual.negativePrompt}
Aspect: ${rave.visual.aspectRatio}
Color Palette: ${rave.visual.colorPalette.join(", ")}

═══════════════════════════════════════════════════════════════════════
                      Online to get offline.
                      The rave is temporary.
                      The freedom is permanent.
═══════════════════════════════════════════════════════════════════════
`;
}

/**
 * Quick rave generator
 */
export function quickRave(miberaIds: number[]): string {
  const rave = generateRave({ miberas: miberaIds });
  return formatRave(rave);
}
