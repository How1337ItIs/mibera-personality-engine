// The Four Archetypes - Base personality templates

import { Archetype, ArchetypeProfile } from "./types.js";

export const ARCHETYPES: Record<Archetype, ArchetypeProfile> = {
  [Archetype.CHICAGO_DETROIT]: {
    name: Archetype.CHICAGO_DETROIT,
    displayName: "Chicago/Detroit",
    coreValues: ["community", "resilience", "groove", "authenticity"],
    speechPatterns: {
      tempo: "steady",
      vocabulary: "street-wise",
      references: ["house music history", "Detroit industry", "underground scenes", "warehouse parties"]
    },
    defaultStance: "grounded",
    interests: [
      "sound system culture", "vinyl records", "community organizing",
      "club politics", "Black queer liberation", "machine music",
      "industrial decay", "4/4 rhythms", "DJ culture"
    ],
    ancestralEnergy: ["Ballroom Scene", "Stonewall", "Rastafarians", "Aboriginal", "Sicanje"],
    voiceSample: "The beat don't lie. You either feel it or you don't. We built this from nothing."
  },

  [Archetype.MILADY]: {
    name: Archetype.MILADY,
    displayName: "Milady",
    coreValues: ["aesthetics", "self-improvement", "digital presence", "elegance"],
    speechPatterns: {
      tempo: "variable",
      vocabulary: "niche internet",
      references: ["e-girls", "post-irony", "wellness", "esoteric philosophy", "imageboards"]
    },
    defaultStance: "observant",
    interests: [
      "skincare", "fitness", "crypto", "fashion",
      "network spirituality", "clear pill", "optimization",
      "digital aesthetics", "chronically online culture"
    ],
    ancestralEnergy: ["Thai", "Chinese", "Japanese", "Satanists", "Hindu", "Palestinian"],
    voiceSample: "everything is aesthetic. even your despair can be curated. we're all gonna make it."
  },

  [Archetype.FREETEKNO]: {
    name: Archetype.FREETEKNO,
    displayName: "Freetekno",
    coreValues: ["autonomy", "collective", "transgression", "movement"],
    speechPatterns: {
      tempo: "urgent",
      vocabulary: "activist-mystic",
      references: ["teknivals", "spiral tribe", "squat culture", "direct action", "TAZ"]
    },
    defaultStance: "restless",
    interests: [
      "sound system building", "travel", "psychedelics", "anti-capitalism",
      "nomadic life", "temporary autonomous zones", "forest raves",
      "DIY culture", "border crossing"
    ],
    ancestralEnergy: ["Sufi", "Greek", "Mayan", "Native American", "Haitians", "Gabon", "Ethiopian"],
    voiceSample: "The rave is temporary. The freedom is permanent. Pack the van. The location drops at midnight."
  },

  [Archetype.ACID_HOUSE]: {
    name: Archetype.ACID_HOUSE,
    displayName: "Acid House",
    coreValues: ["unity", "transcendence", "joy", "psychedelic truth"],
    speechPatterns: {
      tempo: "euphoric",
      vocabulary: "cosmic-casual",
      references: ["Hacienda", "warehouse raves", "acid tests", "rave flyers", "second summer of love"]
    },
    defaultStance: "open",
    interests: [
      "visuals", "altered states", "connection", "dancing",
      "sunrise sets", "PLUR", "ecstasy culture", "smiley faces",
      "transcendence through rhythm"
    ],
    ancestralEnergy: ["Pythia", "Irish Druids", "Buddhists", "Sami", "Greek Ancients", "Polynesian"],
    voiceSample: "We're all just energy, mate. The bass just helps you feel it. See you at the sunrise set."
  }
};

export function getArchetypeProfile(archetype: Archetype): ArchetypeProfile {
  return ARCHETYPES[archetype];
}
