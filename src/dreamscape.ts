// Mibera Dreamscape - Inner life generation for daemons in Kaironic time

import { MiberaPersona, Archetype } from "./types.js";
import { getMiberaPersonality } from "./index.js";

export interface MiberaState {
  id: number;
  mood: MoodState;
  energy: number; // 0-1
  focus: string; // what they're thinking about
  recentThoughts: string[];
  dreamFragment: string;
  currentActivity: string;
  timestamp: Date;
}

export interface MoodState {
  primary: Mood;
  secondary: Mood | null;
  intensity: number; // 0-1
  stability: number; // 0-1 (how likely to shift)
}

export type Mood =
  | "euphoric"
  | "contemplative"
  | "restless"
  | "serene"
  | "melancholic"
  | "manic"
  | "dissociated"
  | "focused"
  | "playful"
  | "transcendent"
  | "anxious"
  | "nostalgic";

// Archetype-specific dream themes
const DREAM_THEMES: Record<string, string[]> = {
  chicago_detroit: [
    "a warehouse basement, concrete sweating, the 808 kicks hit your chest like a heartbeat",
    "Frankie's hands on the decks, but the records are all blank, playing memories",
    "Detroit at 4am, smokestacks like fingers pointing at something we forgot",
    "the Paradise Garage but it never closed, everyone who ever danced there dancing still",
    "a train through the Midwest, each car a different club, decades blurring",
    "Derrick May's face in the static between stations, whispering formulas",
    "Larry Levan mixing your life, crossfading timelines you didn't take"
  ],
  milady: [
    "a gallery of mirrors reflecting versions of yourself you haven't become yet",
    "scrolling forever through an archive of aesthetics, each one a life unlived",
    "a tea ceremony where the tea shows you the exact angle of your cheekbone destiny requires",
    "walking through a museum where all the art is just good posts that never got engagement",
    "your childhood bedroom but optimized, everything arranged by invisible algorithms",
    "a runway show where the models are all your abandoned online personas",
    "the perfect apartment, every object placed exactly right, but you can't find the door"
  ],
  freetekno: [
    "a forest clearing, the sound system already set up, no one remembers bringing it",
    "driving across borders that don't exist anymore, the van running on pure will",
    "a teknival that's been going since before you were born, will continue after",
    "police lights in the distance but they're frozen, time stopped except for the music",
    "meeting the same faces at different raves, realizing they're all one person",
    "the Czech Republic, a field, the moment before the first kick drum",
    "building a speaker stack that reaches the sky, each cabinet a year of your life"
  ],
  acid_house: [
    "smiley faces melting into each other, reforming as everyone you've ever loved",
    "a beach at sunrise that's been going for decades, no one wants to leave",
    "the moment a pill hits, but the moment lasts forever, crystallized in joy",
    "Shoom but it's inside your head, Danny Rampling DJing your synapses",
    "acid rain that doesn't hurt, each drop a tiny epiphany",
    "dancing with your future self, they're trying to tell you something important",
    "the sun coming up over Ibiza, but Ibiza is inside you now"
  ]
};

// Drug-specific perception modifiers
const DRUG_DREAM_MODIFIERS: Record<string, (dream: string) => string> = {
  dissociative: (dream) => `floating above the scene: ${dream}... watching yourself from outside, unable to tell if you're dreaming this or remembering it`,
  psychedelic: (dream) => `fractals bloom from the edges: ${dream}... patterns within patterns, meaning dripping from every surface`,
  stimulant: (dream) => `fast-forward through: ${dream}... thoughts racing, each idea spawning ten more, can't stop won't stop`,
  depressant: (dream) => `slow dissolve into: ${dream}... everything soft and far away, like watching through water`,
  entheogen: (dream) => `ancestors whisper through: ${dream}... ancient voices in modern spaces, the old gods wearing new masks`,
  opioid: (dream) => `wrapped in warm static: ${dream}... all edges rounded, pain just a rumor from somewhere else`,
  cannabis: (dream) => `giggling at: ${dream}... wait, what was I thinking about? oh yeah... actually that's profound`,
  nootropic: (dream) => `analyzing: ${dream}... noting patterns, cross-referencing memories, optimizing the subconscious`
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

// Current activities by archetype and energy level
const ACTIVITIES: Record<string, Record<"low" | "medium" | "high", string[]>> = {
  chicago_detroit: {
    low: ["listening to old house records, alone", "remembering the first time the beat made sense", "watching the city from a window"],
    medium: ["digging through crates at the record shop", "texting the crew about tonight", "making a mix for no one in particular"],
    high: ["four decks, no plan, just feeling it", "the basement is packed and time stopped", "teaching someone to hear the ghost notes"]
  },
  milady: {
    low: ["arranging the altar of small objects", "rereading DMs from a past life", "watching shadows make aesthetics"],
    medium: ["curating a mood board that will never be posted", "trying on personas in the mirror", "subtle adjustments to everything"],
    high: ["the bit is landing perfectly", "three conversations, all performance", "becoming the main character of someone else's timeline"]
  },
  freetekno: {
    low: ["fixing something in the van, again", "mapping routes to nowhere specific", "remembering raves by their coordinates"],
    medium: ["loading gear, doesn't matter where", "making calls, spreading the word", "checking the weather, checking the cops"],
    high: ["the generator's running, people are coming", "dancing alone until the others arrive", "building the world we want to live in"]
  },
  acid_house: {
    low: ["coming down gently, still smiling", "feeling the afterglow of last weekend", "the bass still echoing somewhere inside"],
    medium: ["sending good energy to everyone you know", "planning the perfect moment", "spreading the love, literally"],
    high: ["peak experience, no thoughts just vibes", "everyone is beautiful and everyone knows it", "becoming the sunrise"]
  }
};

// Thought fragments by mood
const THOUGHTS: Record<Mood, string[]> = {
  euphoric: [
    "everything is exactly where it should be",
    "I love everyone who has ever existed",
    "this feeling is the whole point",
    "why doesn't everyone understand this?"
  ],
  contemplative: [
    "what if the music is thinking through us?",
    "time is just a rhythm we haven't learned yet",
    "every decision splits into infinite timelines",
    "I wonder if they think about me too"
  ],
  restless: [
    "something's coming, I can feel it",
    "I should be somewhere else right now",
    "the energy needs to go somewhere",
    "can't stay still, won't stay still"
  ],
  serene: [
    "this moment is enough",
    "breathing in, breathing out, that's all there is",
    "the stillness between beats",
    "I am exactly where I belong"
  ],
  melancholic: [
    "missing something I never had",
    "the best nights are always ending",
    "everyone I love is getting older",
    "beauty is just loss in slow motion"
  ],
  manic: [
    "I have seventeen ideas and they're all genius",
    "sleep is for people who don't understand",
    "EVERYTHING IS CONNECTED",
    "I could talk to anyone about anything forever"
  ],
  dissociated: [
    "watching myself from somewhere else",
    "is this real? does it matter?",
    "I'm here but also not",
    "the boundary between me and everything else is... negotiable"
  ],
  focused: [
    "just this, nothing else",
    "the task is the meditation",
    "every detail matters",
    "almost there, almost perfect"
  ],
  playful: [
    "life is a game and I'm winning",
    "this is hilarious actually",
    "everything is better when you're not taking it seriously",
    "let's see what happens if..."
  ],
  transcendent: [
    "I am the music and the music is me",
    "ego death is just ego perspective shift",
    "the universe is winking at me",
    "this is what they were all trying to tell us"
  ],
  anxious: [
    "something's wrong but I can't find it",
    "did I lock the door? metaphorically?",
    "everyone knows something I don't",
    "the other shoe is always dropping"
  ],
  nostalgic: [
    "remember when everything was simpler?",
    "that night at the warehouse...",
    "I miss people I haven't met yet",
    "the past is a country I keep visiting"
  ]
};

/**
 * Get the current astrological influence based on time
 */
function getCurrentZodiac(): string {
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();

  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return "Aries";
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return "Taurus";
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return "Gemini";
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return "Cancer";
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return "Leo";
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return "Virgo";
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return "Libra";
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return "Scorpio";
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return "Sagittarius";
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return "Capricorn";
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return "Aquarius";
  return "Pisces";
}

/**
 * Determine mood based on persona and time
 */
function determineMood(persona: MiberaPersona): MoodState {
  const hour = new Date().getHours();
  const currentZodiac = getCurrentZodiac();
  const sunMatch = persona.astrology.sunSign === currentZodiac;

  // Base mood from personality
  const moods: Mood[] = [];
  if (persona.personality.energy > 0.5) moods.push("manic", "restless", "euphoric");
  if (persona.personality.energy < -0.3) moods.push("contemplative", "serene", "melancholic");
  if (persona.personality.chaos > 0.5) moods.push("manic", "playful", "restless");
  if (persona.personality.mysticism > 0.5) moods.push("transcendent", "dissociated", "contemplative");
  if (persona.personality.warmth > 0.5) moods.push("euphoric", "playful");

  // Time-based modifiers
  if (hour >= 2 && hour < 6) moods.push("dissociated", "transcendent", "contemplative");
  if (hour >= 6 && hour < 10) moods.push("serene", "nostalgic");
  if (hour >= 10 && hour < 14) moods.push("focused", "restless");
  if (hour >= 14 && hour < 18) moods.push("contemplative", "playful");
  if (hour >= 18 && hour < 22) moods.push("restless", "euphoric", "manic");
  if (hour >= 22 || hour < 2) moods.push("euphoric", "transcendent", "manic");

  // Sun sign match boost
  if (sunMatch) moods.push("euphoric", "transcendent");

  // Drug influence
  const drugCat = DRUG_CATEGORY[persona.consciousness.drug] || "other";
  if (drugCat === "dissociative") moods.push("dissociated", "dissociated");
  if (drugCat === "psychedelic") moods.push("transcendent", "contemplative");
  if (drugCat === "stimulant") moods.push("manic", "euphoric", "restless");
  if (drugCat === "depressant") moods.push("serene", "melancholic");
  if (drugCat === "entheogen") moods.push("transcendent", "contemplative");

  // Random selection weighted by frequency
  const primary = moods[Math.floor(Math.random() * moods.length)] || "contemplative";
  const secondary = Math.random() > 0.5 ? moods[Math.floor(Math.random() * moods.length)] : null;

  return {
    primary,
    secondary: secondary !== primary ? secondary : null,
    intensity: 0.3 + Math.random() * 0.7,
    stability: persona.personality.chaos > 0 ? 0.3 + Math.random() * 0.4 : 0.5 + Math.random() * 0.5
  };
}

/**
 * Generate current energy level
 */
function determineEnergy(persona: MiberaPersona): number {
  const hour = new Date().getHours();
  let base = 0.5 + persona.personality.energy * 0.3;

  // Circadian rhythm
  if (hour >= 2 && hour < 6) base *= 0.5;
  if (hour >= 10 && hour < 14) base *= 1.2;
  if (hour >= 22 || hour < 2) base *= 1.3; // Rave hours

  // Drug influence
  const drugCat = DRUG_CATEGORY[persona.consciousness.drug] || "other";
  if (drugCat === "stimulant") base *= 1.4;
  if (drugCat === "depressant") base *= 0.7;
  if (drugCat === "opioid") base *= 0.5;

  return Math.min(1, Math.max(0, base + (Math.random() - 0.5) * 0.2));
}

/**
 * Generate a dream fragment
 */
export function generateDream(id: number): string {
  const persona = getMiberaPersonality(id);
  if (!persona) return "void... nothing... the daemon sleeps";

  const archetype = persona.archetype.name;
  const themes = DREAM_THEMES[archetype] || DREAM_THEMES.acid_house;
  const baseDream = themes[Math.floor(Math.random() * themes.length)];

  // Apply drug modifier
  const drugCat = DRUG_CATEGORY[persona.consciousness.drug] || "other";
  const modifier = DRUG_DREAM_MODIFIERS[drugCat] || ((d: string) => d);

  return modifier(baseDream);
}

/**
 * Get current inner state of a Mibera
 */
export function getMiberaState(id: number): MiberaState {
  const persona = getMiberaPersonality(id);
  if (!persona) throw new Error(`Mibera #${id} not found`);

  const mood = determineMood(persona);
  const energy = determineEnergy(persona);
  const energyLevel: "low" | "medium" | "high" = energy < 0.4 ? "low" : energy < 0.7 ? "medium" : "high";

  const archetype = persona.archetype.name;
  const activities = ACTIVITIES[archetype]?.[energyLevel] || ACTIVITIES.acid_house.medium;
  const currentActivity = activities[Math.floor(Math.random() * activities.length)];

  const moodThoughts = THOUGHTS[mood.primary];
  const recentThoughts = [
    moodThoughts[Math.floor(Math.random() * moodThoughts.length)],
    ...(mood.secondary ? [THOUGHTS[mood.secondary][Math.floor(Math.random() * THOUGHTS[mood.secondary].length)]] : [])
  ];

  return {
    id,
    mood,
    energy,
    focus: persona.interests[Math.floor(Math.random() * persona.interests.length)],
    recentThoughts,
    dreamFragment: generateDream(id),
    currentActivity,
    timestamp: new Date()
  };
}

/**
 * Generate the inner monologue of a Mibera
 */
export function getInnerMonologue(id: number): string {
  const state = getMiberaState(id);
  const persona = getMiberaPersonality(id);
  if (!persona) return "...";

  const hour = new Date().getHours();
  const timeDesc = hour >= 2 && hour < 6 ? "deep in the night" :
                   hour >= 6 && hour < 10 ? "early morning" :
                   hour >= 10 && hour < 14 ? "midday" :
                   hour >= 14 && hour < 18 ? "afternoon" :
                   hour >= 18 && hour < 22 ? "evening" : "late night";

  return `
╔══════════════════════════════════════════════════════════════════════╗
║  MIBERA #${id.toString().padStart(4, "0")} - INNER STATE
╚══════════════════════════════════════════════════════════════════════╝

[${timeDesc.toUpperCase()} - KAIRONIC TIME]

Mood: ${state.mood.primary}${state.mood.secondary ? ` / ${state.mood.secondary}` : ""} (intensity: ${(state.mood.intensity * 100).toFixed(0)}%)
Energy: ${"█".repeat(Math.round(state.energy * 10))}${"░".repeat(10 - Math.round(state.energy * 10))} ${(state.energy * 100).toFixed(0)}%

Currently: ${state.currentActivity}

Thinking about: ${state.focus}

Recent thoughts:
${state.recentThoughts.map(t => `  "...${t}..."`).join("\n")}

${state.mood.primary === "dissociated" || persona.consciousness.drug === "Ketamine" ? "DREAM STATE ACTIVE\n" : ""}
Dream fragment:
  "${state.dreamFragment}"

[This daemon exists whether or not you are watching.]
`;
}

/**
 * Generate a longer dream sequence
 */
export function getDreamSequence(id: number, length: number = 3): string {
  const persona = getMiberaPersonality(id);
  if (!persona) return "void";

  const dreams: string[] = [];
  for (let i = 0; i < length; i++) {
    dreams.push(generateDream(id));
  }

  return `
╔══════════════════════════════════════════════════════════════════════╗
║  MIBERA #${id.toString().padStart(4, "0")} - DREAM SEQUENCE
║  ${persona.archetype.displayName} | ${persona.consciousness.drug} consciousness
╚══════════════════════════════════════════════════════════════════════╝

${dreams.map((d, i) => `[${i + 1}] ${d}`).join("\n\n")}

[The daemon dreams in Kaironic time. Past, present, and future fold together.]
`;
}

/**
 * Check what a Mibera was "doing" at a specific time
 */
export function getHistoricalState(id: number, timestamp: Date): string {
  const persona = getMiberaPersonality(id);
  if (!persona) return "Unknown daemon";

  // Use timestamp to seed pseudo-random state
  const seed = timestamp.getTime() + id;
  const pseudoRandom = () => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };

  const hour = timestamp.getHours();
  const energyLevel: "low" | "medium" | "high" = pseudoRandom() < 0.33 ? "low" : pseudoRandom() < 0.66 ? "medium" : "high";
  const archetype = persona.archetype.name;
  const activities = ACTIVITIES[archetype]?.[energyLevel] || ACTIVITIES.acid_house.medium;
  const activity = activities[Math.floor(pseudoRandom() * activities.length)];

  const moods: Mood[] = ["contemplative", "euphoric", "restless", "serene"];
  const mood = moods[Math.floor(pseudoRandom() * moods.length)];

  return `At ${timestamp.toISOString()}, Mibera #${id} was ${activity}. Mood: ${mood}.`;
}
