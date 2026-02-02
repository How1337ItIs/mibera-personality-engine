#!/usr/bin/env node
// CLI for the Mibera Personality Engine

import { getMiberaPersonality, exportPersonaToJSON, exportAgentConfig } from "./index.js";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

function printUsage() {
  console.log(`
Mibera Personality Engine CLI

Usage:
  npx tsx src/cli.ts <mibera_id> [options]
  npx tsx src/cli.ts --range <start> <end> [options]

Options:
  --json              Output full persona as JSON
  --prompt            Output just the system prompt
  --agent             Output Legba/OpenClaw compatible config
  --save <dir>        Save output to files in directory
  --range <s> <e>     Generate for range of IDs

Examples:
  npx tsx src/cli.ts 96                    # Show persona for Mibera #96
  npx tsx src/cli.ts 96 --prompt           # Just the system prompt
  npx tsx src/cli.ts 96 --json --save ./out # Save JSON to ./out/0096.json
  npx tsx src/cli.ts --range 1 100 --save ./personas
`);
}

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
    printUsage();
    process.exit(0);
  }

  const outputJson = args.includes("--json");
  const outputPrompt = args.includes("--prompt");
  const outputAgent = args.includes("--agent");
  const saveIndex = args.indexOf("--save");
  const saveDir = saveIndex !== -1 ? args[saveIndex + 1] : null;
  const rangeIndex = args.indexOf("--range");

  let ids: number[] = [];

  if (rangeIndex !== -1) {
    const start = parseInt(args[rangeIndex + 1]);
    const end = parseInt(args[rangeIndex + 2]);
    if (isNaN(start) || isNaN(end)) {
      console.error("Invalid range. Use --range <start> <end>");
      process.exit(1);
    }
    for (let i = start; i <= end; i++) {
      ids.push(i);
    }
  } else {
    const id = parseInt(args[0]);
    if (isNaN(id)) {
      console.error("Invalid Mibera ID. Must be a number.");
      process.exit(1);
    }
    ids.push(id);
  }

  if (saveDir && !existsSync(saveDir)) {
    mkdirSync(saveDir, { recursive: true });
  }

  for (const id of ids) {
    const persona = getMiberaPersonality(id);

    if (!persona) {
      console.error(`Could not load Mibera #${id}`);
      continue;
    }

    let output: string;

    if (outputPrompt) {
      output = persona.systemPrompt;
    } else if (outputAgent) {
      output = JSON.stringify(exportAgentConfig(persona), null, 2);
    } else if (outputJson) {
      output = exportPersonaToJSON(persona);
    } else {
      // Default: pretty print summary
      output = `
╔══════════════════════════════════════════════════════════════╗
║  MIBERA #${id.toString().padStart(4, "0")}                                               ║
╠══════════════════════════════════════════════════════════════╣
║  Archetype: ${persona.archetype.displayName.padEnd(47)}║
║  Drug: ${persona.consciousness.drug.padEnd(52)}║
║  Element: ${persona.traits.element.padEnd(49)}║
║  Birthday: ${persona.traits.birthday.slice(0, 20).padEnd(48)}║
║  Sun: ${persona.astrology.sunSign.padEnd(10)} Moon: ${persona.astrology.moonSign.padEnd(10)} Rising: ${persona.astrology.ascendingSign.padEnd(10)}║
║  Swag: ${persona.traits.swagRank} (${persona.traits.swagScore})                                            ║
╠══════════════════════════════════════════════════════════════╣
║  PERSONALITY                                                 ║
║  Openness: ${(persona.personality.openness * 100).toFixed(0).padStart(4)}%   Energy: ${(persona.personality.energy * 100).toFixed(0).padStart(4)}%   Chaos: ${(persona.personality.chaos * 100).toFixed(0).padStart(4)}%    ║
║  Warmth: ${(persona.personality.warmth * 100).toFixed(0).padStart(4)}%    Intensity: ${(persona.personality.intensity * 100).toFixed(0).padStart(4)}%                    ║
║  Rave: ${(persona.personality.raveAffinity * 100).toFixed(0).padStart(3)}%  Digital: ${(persona.personality.digitalNative * 100).toFixed(0).padStart(3)}%  Mysticism: ${(persona.personality.mysticism * 100).toFixed(0).padStart(3)}%      ║
╠══════════════════════════════════════════════════════════════╣
║  VOICE: ${persona.voice.tempo} / ${persona.voice.style}
║  Quirks: ${persona.voice.quirks.slice(0, 3).join(", ").slice(0, 50)}
╠══════════════════════════════════════════════════════════════╣
║  INTERESTS                                                   ║
${persona.interests.slice(0, 5).map(i => `║  • ${i.slice(0, 55).padEnd(56)}║`).join("\n")}
╚══════════════════════════════════════════════════════════════╝
`;
    }

    if (saveDir) {
      const filename = `${id.toString().padStart(4, "0")}.${outputPrompt ? "txt" : "json"}`;
      const filepath = join(saveDir, filename);
      writeFileSync(filepath, output);
      console.log(`Saved: ${filepath}`);
    } else {
      console.log(output);
    }
  }
}

main();
