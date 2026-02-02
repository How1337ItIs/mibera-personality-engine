// Test the Mibera Personality Engine

import { getMiberaPersonality, exportAgentConfig } from "./index.js";

console.log("🔮 Mibera Personality Engine - Test Suite\n");
console.log("═".repeat(60));

// Test a few notable Miberas
const testIds = [1, 96, 333, 420, 666, 1337];

for (const id of testIds) {
  console.log(`\n🌀 Testing Mibera #${id}...`);

  const persona = getMiberaPersonality(id);

  if (!persona) {
    console.log(`   ❌ Could not load Mibera #${id}`);
    continue;
  }

  console.log(`   ✓ Archetype: ${persona.archetype.displayName}`);
  console.log(`   ✓ Drug: ${persona.consciousness.drug}`);
  console.log(`   ✓ Element: ${persona.traits.element}`);
  console.log(`   ✓ Sun Sign: ${persona.astrology.sunSign}`);
  console.log(`   ✓ Swag Rank: ${persona.traits.swagRank} (${persona.traits.swagScore})`);
  console.log(`   ✓ Personality Vector:`);
  console.log(`      - Openness: ${(persona.personality.openness * 100).toFixed(0)}%`);
  console.log(`      - Energy: ${(persona.personality.energy * 100).toFixed(0)}%`);
  console.log(`      - Chaos: ${(persona.personality.chaos * 100).toFixed(0)}%`);
  console.log(`      - Warmth: ${(persona.personality.warmth * 100).toFixed(0)}%`);
  console.log(`      - Intensity: ${(persona.personality.intensity * 100).toFixed(0)}%`);
  console.log(`      - Rave Affinity: ${(persona.personality.raveAffinity * 100).toFixed(0)}%`);
  console.log(`      - Digital Native: ${(persona.personality.digitalNative * 100).toFixed(0)}%`);
  console.log(`      - Mysticism: ${(persona.personality.mysticism * 100).toFixed(0)}%`);
  console.log(`   ✓ Voice: ${persona.voice.tempo} / ${persona.voice.style}`);
  console.log(`   ✓ Interests: ${persona.interests.slice(0, 3).join(", ")}...`);
  console.log(`   ✓ System prompt length: ${persona.systemPrompt.length} chars`);
}

console.log("\n" + "═".repeat(60));
console.log("\n📋 Sample System Prompt (Mibera #96 - Janitooor's Mibera):\n");
console.log("-".repeat(60));

const janiMibera = getMiberaPersonality(96);
if (janiMibera) {
  console.log(janiMibera.systemPrompt);
}

console.log("-".repeat(60));
console.log("\n📦 Agent Config Export (Mibera #96):\n");
if (janiMibera) {
  console.log(JSON.stringify(exportAgentConfig(janiMibera), null, 2));
}

console.log("\n" + "═".repeat(60));
console.log("\n✅ All tests complete!");
console.log("   Run with: npx tsx src/cli.ts <id> to generate any Mibera");
console.log("   Run with: npx tsx src/cli.ts --range 1 100 --save ./personas");
