// Core type definitions for the Mibera Personality Engine

export enum Archetype {
  CHICAGO_DETROIT = "chicago_detroit",
  MILADY = "milady",
  FREETEKNO = "freetekno",
  ACID_HOUSE = "acid_house"
}

export interface MiberaTraits {
  id: number;
  archetype: Archetype;
  ancestor: string;
  timePeriod: string;
  birthday: string;
  birthCoordinates: { lat: number; lng: number };
  sunSign: string;
  moonSign: string;
  ascendingSign: string;
  element: string;
  swagRank: string;
  swagScore: number;
  background: string;
  body: string;
  hair: string;
  eyes: string;
  eyebrows: string;
  mouth: string;
  shirt: string;
  hat: string | null;
  glasses: string | null;
  mask: string | null;
  earrings: string | null;
  faceAccessory: string | null;
  tattoo: string | null;
  item: string | null;
  drug: string;
}

export interface PersonalityVector {
  // Classic dimensions (-1 to 1)
  openness: number;
  energy: number;
  chaos: number;
  warmth: number;
  intensity: number;

  // Mibera-specific (0 to 1)
  raveAffinity: number;
  digitalNative: number;
  mysticism: number;
}

export interface ConsciousnessState {
  drug: string;
  archetype: Archetype;
  ancestors: string[];

  // Cognitive modifiers (-1 to 1)
  temporalPerception: number;
  boundaryDissolution: number;
  patternRecognition: number;
  socialAffinity: number;
  energyLevel: number;
  verbosity: number;
}

export interface ArchetypeProfile {
  name: Archetype;
  displayName: string;
  coreValues: string[];
  speechPatterns: {
    tempo: string;
    vocabulary: string;
    references: string[];
  };
  defaultStance: string;
  interests: string[];
  ancestralEnergy: string[];
  voiceSample: string;
}

export interface AstrologicalProfile {
  sunSign: string;
  moonSign: string;
  ascendingSign: string;
  element: string;
  modality: string;
}

export interface VoiceConfig {
  tempo: string;
  style: string;
  quirks: string[];
  avoidances: string[];
}

export interface MiberaPersona {
  id: number;
  traits: MiberaTraits;
  personality: PersonalityVector;
  consciousness: ConsciousnessState;
  archetype: ArchetypeProfile;
  astrology: AstrologicalProfile;
  voice: VoiceConfig;
  interests: string[];
  systemPrompt: string;
}
