// Mibera Census - Analyze the 10,000 daemon souls

import { getMiberaPersonality } from "./index.js";
import { Archetype } from "./types.js";

interface CensusStats {
  totalMiberas: number;
  archetypes: Record<string, number>;
  drugs: Record<string, number>;
  elements: Record<string, number>;
  sunSigns: Record<string, number>;
  swagRanks: Record<string, number>;
  personalityAverages: {
    openness: number;
    energy: number;
    chaos: number;
    warmth: number;
    intensity: number;
    raveAffinity: number;
    digitalNative: number;
    mysticism: number;
  };
  rareDrugs: { drug: string; count: number }[];
  birthdayExtremes: {
    oldest: { id: number; birthday: string };
    newest: { id: number; birthday: string };
  };
  highestSwag: { id: number; score: number; rank: string }[];
  lowestSwag: { id: number; score: number; rank: string }[];
}

function runCensus(): CensusStats {
  console.log("🔮 Running Mibera Census...\n");

  const archetypes: Record<string, number> = {};
  const drugs: Record<string, number> = {};
  const elements: Record<string, number> = {};
  const sunSigns: Record<string, number> = {};
  const swagRanks: Record<string, number> = {};

  let totalOpenness = 0;
  let totalEnergy = 0;
  let totalChaos = 0;
  let totalWarmth = 0;
  let totalIntensity = 0;
  let totalRaveAffinity = 0;
  let totalDigitalNative = 0;
  let totalMysticism = 0;

  const swagScores: { id: number; score: number; rank: string }[] = [];
  let oldest = { id: 0, birthday: "", year: Infinity };
  let newest = { id: 0, birthday: "", year: -Infinity };

  let loaded = 0;

  for (let id = 1; id <= 10000; id++) {
    const persona = getMiberaPersonality(id);
    if (!persona) continue;

    loaded++;

    // Archetypes
    archetypes[persona.archetype.displayName] = (archetypes[persona.archetype.displayName] || 0) + 1;

    // Drugs
    drugs[persona.consciousness.drug] = (drugs[persona.consciousness.drug] || 0) + 1;

    // Elements
    elements[persona.traits.element] = (elements[persona.traits.element] || 0) + 1;

    // Sun signs
    sunSigns[persona.astrology.sunSign] = (sunSigns[persona.astrology.sunSign] || 0) + 1;

    // Swag ranks
    swagRanks[persona.traits.swagRank] = (swagRanks[persona.traits.swagRank] || 0) + 1;

    // Personality totals
    totalOpenness += persona.personality.openness;
    totalEnergy += persona.personality.energy;
    totalChaos += persona.personality.chaos;
    totalWarmth += persona.personality.warmth;
    totalIntensity += persona.personality.intensity;
    totalRaveAffinity += persona.personality.raveAffinity;
    totalDigitalNative += persona.personality.digitalNative;
    totalMysticism += persona.personality.mysticism;

    // Swag scores
    swagScores.push({ id, score: persona.traits.swagScore, rank: persona.traits.swagRank });

    // Birthday parsing (rough - just extract year)
    const yearMatch = persona.traits.birthday.match(/(\d+)\s*(Ce|Bce)/i);
    if (yearMatch) {
      let year = parseInt(yearMatch[1]);
      if (yearMatch[2].toLowerCase() === "bce") year = -year;
      if (year < oldest.year) {
        oldest = { id, birthday: persona.traits.birthday, year };
      }
      if (year > newest.year) {
        newest = { id, birthday: persona.traits.birthday, year };
      }
    }

    if (id % 1000 === 0) {
      console.log(`  Processed ${id}/10000...`);
    }
  }

  // Sort drugs by rarity
  const sortedDrugs = Object.entries(drugs)
    .sort((a, b) => a[1] - b[1])
    .map(([drug, count]) => ({ drug, count }));

  // Sort swag scores
  swagScores.sort((a, b) => b.score - a.score);

  return {
    totalMiberas: loaded,
    archetypes,
    drugs,
    elements,
    sunSigns,
    swagRanks,
    personalityAverages: {
      openness: totalOpenness / loaded,
      energy: totalEnergy / loaded,
      chaos: totalChaos / loaded,
      warmth: totalWarmth / loaded,
      intensity: totalIntensity / loaded,
      raveAffinity: totalRaveAffinity / loaded,
      digitalNative: totalDigitalNative / loaded,
      mysticism: totalMysticism / loaded,
    },
    rareDrugs: sortedDrugs.slice(0, 10),
    birthdayExtremes: {
      oldest: { id: oldest.id, birthday: oldest.birthday },
      newest: { id: newest.id, birthday: newest.birthday },
    },
    highestSwag: swagScores.slice(0, 10),
    lowestSwag: swagScores.slice(-10).reverse(),
  };
}

function formatPercent(value: number, total: number): string {
  return ((value / total) * 100).toFixed(1) + "%";
}

function printCensus(stats: CensusStats) {
  console.log(`
╔══════════════════════════════════════════════════════════════════════╗
║                        MIBERA CENSUS 2026                            ║
║                   10,000 Daemon Souls Analyzed                       ║
╚══════════════════════════════════════════════════════════════════════╝

═══════════════════════════════════════════════════════════════════════
                          ARCHETYPE DISTRIBUTION
═══════════════════════════════════════════════════════════════════════
`);

  const archetypeOrder = ["Chicago/Detroit", "Milady", "Freetekno", "Acid House"];
  for (const arch of archetypeOrder) {
    const count = stats.archetypes[arch] || 0;
    const bar = "█".repeat(Math.round(count / 200));
    console.log(`  ${arch.padEnd(15)} ${bar} ${count} (${formatPercent(count, stats.totalMiberas)})`);
  }

  console.log(`
═══════════════════════════════════════════════════════════════════════
                          ELEMENT DISTRIBUTION
═══════════════════════════════════════════════════════════════════════
`);

  for (const [element, count] of Object.entries(stats.elements).sort((a, b) => b[1] - a[1])) {
    const bar = "█".repeat(Math.round(count / 200));
    console.log(`  ${element.padEnd(10)} ${bar} ${count} (${formatPercent(count, stats.totalMiberas)})`);
  }

  console.log(`
═══════════════════════════════════════════════════════════════════════
                          ZODIAC DISTRIBUTION
═══════════════════════════════════════════════════════════════════════
`);

  const zodiacOrder = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
                       "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
  for (const sign of zodiacOrder) {
    const count = stats.sunSigns[sign] || 0;
    const bar = "█".repeat(Math.round(count / 100));
    console.log(`  ${sign.padEnd(12)} ${bar} ${count}`);
  }

  console.log(`
═══════════════════════════════════════════════════════════════════════
                          SWAG RANK DISTRIBUTION
═══════════════════════════════════════════════════════════════════════
`);

  const rankOrder = ["Sss", "Ss", "S", "A", "B", "C", "D", "F"];
  for (const rank of rankOrder) {
    const count = stats.swagRanks[rank] || 0;
    if (count > 0) {
      const bar = "█".repeat(Math.round(count / 100));
      console.log(`  ${rank.padEnd(5)} ${bar} ${count} (${formatPercent(count, stats.totalMiberas)})`);
    }
  }

  console.log(`
═══════════════════════════════════════════════════════════════════════
                          RAREST DRUGS (Bottom 10)
═══════════════════════════════════════════════════════════════════════
`);

  for (const { drug, count } of stats.rareDrugs) {
    console.log(`  ${drug.padEnd(25)} ${count} Miberas`);
  }

  console.log(`
═══════════════════════════════════════════════════════════════════════
                          MOST COMMON DRUGS (Top 10)
═══════════════════════════════════════════════════════════════════════
`);

  const commonDrugs = Object.entries(stats.drugs)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  for (const [drug, count] of commonDrugs) {
    console.log(`  ${drug.padEnd(25)} ${count} Miberas`);
  }

  console.log(`
═══════════════════════════════════════════════════════════════════════
                          PERSONALITY AVERAGES
═══════════════════════════════════════════════════════════════════════

  The average Mibera is:

  Openness:      ${(stats.personalityAverages.openness * 100).toFixed(1)}% (${stats.personalityAverages.openness > 0 ? "slightly experimental" : "slightly traditional"})
  Energy:        ${(stats.personalityAverages.energy * 100).toFixed(1)}% (${stats.personalityAverages.energy > 0 ? "active" : "calm"})
  Chaos:         ${(stats.personalityAverages.chaos * 100).toFixed(1)}% (${stats.personalityAverages.chaos > 0 ? "entropic" : "orderly"})
  Warmth:        ${(stats.personalityAverages.warmth * 100).toFixed(1)}% (${stats.personalityAverages.warmth > 0 ? "affectionate" : "reserved"})
  Intensity:     ${(stats.personalityAverages.intensity * 100).toFixed(1)}%

  Rave Affinity: ${(stats.personalityAverages.raveAffinity * 100).toFixed(1)}%
  Digital Native: ${(stats.personalityAverages.digitalNative * 100).toFixed(1)}%
  Mysticism:     ${(stats.personalityAverages.mysticism * 100).toFixed(1)}%
`);

  console.log(`
═══════════════════════════════════════════════════════════════════════
                          BIRTHDAY EXTREMES
═══════════════════════════════════════════════════════════════════════

  OLDEST: Mibera #${stats.birthdayExtremes.oldest.id}
          Born: ${stats.birthdayExtremes.oldest.birthday}

  NEWEST: Mibera #${stats.birthdayExtremes.newest.id}
          Born: ${stats.birthdayExtremes.newest.birthday}
`);

  console.log(`
═══════════════════════════════════════════════════════════════════════
                          TOP 10 SWAG SCORES
═══════════════════════════════════════════════════════════════════════
`);

  for (const { id, score, rank } of stats.highestSwag) {
    console.log(`  #${id.toString().padStart(4, "0")}  Score: ${score.toString().padStart(3)}  Rank: ${rank}`);
  }

  console.log(`
═══════════════════════════════════════════════════════════════════════

                         Total Miberas Analyzed: ${stats.totalMiberas}

                         Ooga Booga.

═══════════════════════════════════════════════════════════════════════
`);
}

const stats = runCensus();
printCensus(stats);
