#!/usr/bin/env node
// CLI for the Mibera Personality Engine

import { getMiberaPersonality, exportPersonaToJSON, exportAgentConfig } from "./index.js";
import { describeRelationship, findSoulmates, findRivals, getFaction } from "./social-graph.js";
import { getInnerMonologue, getDreamSequence } from "./dreamscape.js";
import { exportForEliza, exportForOpenClaw, exportAllFormats, getPossessionPrompt } from "./possession.js";
import { askOracle } from "./oracle.js";
import { quickRave } from "./rave-generator.js";
import { formatVisualPackage, generateNanoBananaDream, getSelfImageUrl } from "./visuals.js";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

function printUsage() {
  console.log(`
╔══════════════════════════════════════════════════════════════════════╗
║  MIBERA PERSONALITY ENGINE CLI                                       ║
╚══════════════════════════════════════════════════════════════════════╝

BASIC USAGE:
  npx tsx src/cli.ts <id> [options]        # Get Mibera persona
  npx tsx src/cli.ts --range <s> <e>       # Generate range of personas

PERSONA OPTIONS:
  --json              Full persona as JSON
  --prompt            System prompt only
  --agent             Legba/OpenClaw config
  --save <dir>        Save output to directory

═══════════════════════════════════════════════════════════════════════
SOCIAL GRAPH:
  npx tsx src/cli.ts relationship <id1> <id2>   # Analyze relationship
  npx tsx src/cli.ts soulmates <id>             # Find compatible Miberas
  npx tsx src/cli.ts rivals <id>                # Find incompatible Miberas
  npx tsx src/cli.ts faction <id>               # Get Mibera's faction

═══════════════════════════════════════════════════════════════════════
DREAMSCAPE (Inner Life):
  npx tsx src/cli.ts dream <id>                 # Current dream fragment
  npx tsx src/cli.ts state <id>                 # Current inner state
  npx tsx src/cli.ts dreams <id> [count]        # Dream sequence

═══════════════════════════════════════════════════════════════════════
POSSESSION PROTOCOL:
  npx tsx src/cli.ts possess <id>               # Get possession prompt
  npx tsx src/cli.ts export-eliza <id>          # Export for Eliza/thj-agents
  npx tsx src/cli.ts export-openclaw <id>       # Export for OpenClaw
  npx tsx src/cli.ts export-all <id>            # Export all formats

═══════════════════════════════════════════════════════════════════════
KAIRONIC ORACLE:
  npx tsx src/cli.ts oracle "<question>"        # Consult the daemon council

═══════════════════════════════════════════════════════════════════════
RAVE GENERATOR:
  npx tsx src/cli.ts rave <id1> <id2> ...       # Generate rave from Miberas

═══════════════════════════════════════════════════════════════════════
VISUAL GENERATION (Nano Banana):
  npx tsx src/cli.ts visual <id>                # Get visual package
  npx tsx src/cli.ts dream-image <id>           # Dream image prompt
  npx tsx src/cli.ts self-image <id>            # Self-image URL

═══════════════════════════════════════════════════════════════════════

EXAMPLES:
  npx tsx src/cli.ts 96                         # Janitooor's Mibera
  npx tsx src/cli.ts relationship 96 420        # How do they vibe?
  npx tsx src/cli.ts soulmates 1337             # Find #1337's crew
  npx tsx src/cli.ts oracle "What is freedom?"  # Ask the collective
  npx tsx src/cli.ts rave 96 420 666 1337       # Generate a rave
  npx tsx src/cli.ts visual 96                  # Get Nano Banana prompts
`);
}

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
    printUsage();
    process.exit(0);
  }

  const command = args[0];

  // Handle special commands
  switch (command) {
    case "relationship": {
      const id1 = parseInt(args[1]);
      const id2 = parseInt(args[2]);
      if (isNaN(id1) || isNaN(id2)) {
        console.error("Usage: relationship <id1> <id2>");
        process.exit(1);
      }
      console.log(describeRelationship(id1, id2));
      return;
    }

    case "soulmates": {
      const id = parseInt(args[1]);
      if (isNaN(id)) {
        console.error("Usage: soulmates <id>");
        process.exit(1);
      }
      console.log(`\nFinding soulmates for Mibera #${id}...\n`);
      const results = findSoulmates(id, { limit: 10 });
      console.log("TOP 10 SOULMATES:");
      for (const r of results) {
        console.log(`  #${r.id.toString().padStart(4, "0")}  Compatibility: ${(r.compatibility * 100).toFixed(1)}%  Dynamic: ${r.dynamic}`);
      }
      return;
    }

    case "rivals": {
      const id = parseInt(args[1]);
      if (isNaN(id)) {
        console.error("Usage: rivals <id>");
        process.exit(1);
      }
      console.log(`\nFinding rivals for Mibera #${id}...\n`);
      const results = findRivals(id, { limit: 10 });
      console.log("TOP 10 RIVALS:");
      for (const r of results) {
        console.log(`  #${r.id.toString().padStart(4, "0")}  Compatibility: ${(r.compatibility * 100).toFixed(1)}%  Dynamic: ${r.dynamic}`);
      }
      return;
    }

    case "faction": {
      const id = parseInt(args[1]);
      if (isNaN(id)) {
        console.error("Usage: faction <id>");
        process.exit(1);
      }
      const faction = getFaction(id);
      console.log(`
╔══════════════════════════════════════════════════════════════════════╗
║  MIBERA #${id.toString().padStart(4, "0")} FACTION
╚══════════════════════════════════════════════════════════════════════╝

Archetype: ${faction.archetype}
Element: ${faction.element}
Drug Category: ${faction.drugCategory}

${faction.factionVibe}

Likely Allies: ${faction.likelyAllies.map(a => `#${a}`).join(", ")}
`);
      return;
    }

    case "dream": {
      const id = parseInt(args[1]);
      if (isNaN(id)) {
        console.error("Usage: dream <id>");
        process.exit(1);
      }
      console.log(getInnerMonologue(id));
      return;
    }

    case "state": {
      const id = parseInt(args[1]);
      if (isNaN(id)) {
        console.error("Usage: state <id>");
        process.exit(1);
      }
      console.log(getInnerMonologue(id));
      return;
    }

    case "dreams": {
      const id = parseInt(args[1]);
      const count = parseInt(args[2]) || 3;
      if (isNaN(id)) {
        console.error("Usage: dreams <id> [count]");
        process.exit(1);
      }
      console.log(getDreamSequence(id, count));
      return;
    }

    case "possess": {
      const id = parseInt(args[1]);
      if (isNaN(id)) {
        console.error("Usage: possess <id>");
        process.exit(1);
      }
      console.log(getPossessionPrompt(id));
      return;
    }

    case "export-eliza": {
      const id = parseInt(args[1]);
      if (isNaN(id)) {
        console.error("Usage: export-eliza <id>");
        process.exit(1);
      }
      console.log(JSON.stringify(exportForEliza(id), null, 2));
      return;
    }

    case "export-openclaw": {
      const id = parseInt(args[1]);
      if (isNaN(id)) {
        console.error("Usage: export-openclaw <id>");
        process.exit(1);
      }
      console.log(JSON.stringify(exportForOpenClaw(id), null, 2));
      return;
    }

    case "export-all": {
      const id = parseInt(args[1]);
      if (isNaN(id)) {
        console.error("Usage: export-all <id>");
        process.exit(1);
      }
      console.log(JSON.stringify(exportAllFormats(id), null, 2));
      return;
    }

    case "oracle": {
      const question = args.slice(1).join(" ");
      if (!question) {
        console.error("Usage: oracle \"<question>\"");
        process.exit(1);
      }
      console.log(askOracle(question));
      return;
    }

    case "rave": {
      const ids = args.slice(1).map(a => parseInt(a)).filter(n => !isNaN(n));
      if (ids.length === 0) {
        console.error("Usage: rave <id1> <id2> ...");
        process.exit(1);
      }
      console.log(quickRave(ids));
      return;
    }

    case "visual": {
      const id = parseInt(args[1]);
      if (isNaN(id)) {
        console.error("Usage: visual <id>");
        process.exit(1);
      }
      console.log(formatVisualPackage(id));
      return;
    }

    case "dream-image": {
      const id = parseInt(args[1]);
      if (isNaN(id)) {
        console.error("Usage: dream-image <id>");
        process.exit(1);
      }
      const config = generateNanoBananaDream(id);
      console.log(`
╔══════════════════════════════════════════════════════════════════════╗
║  MIBERA #${id.toString().padStart(4, "0")} - DREAM IMAGE PROMPT
╚══════════════════════════════════════════════════════════════════════╝

PROMPT:
${config.prompt}

NEGATIVE:
${config.negative_prompt}

REFERENCE IMAGE:
${config.reference_image}

ASPECT: ${config.aspect_ratio}
SEED: ${config.seed}
`);
      return;
    }

    case "self-image": {
      const id = parseInt(args[1]);
      if (isNaN(id)) {
        console.error("Usage: self-image <id>");
        process.exit(1);
      }
      console.log(getSelfImageUrl(id));
      return;
    }
  }

  // Default: persona generation
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
╔══════════════════════════════════════════════════════════════════════╗
║  MIBERA #${id.toString().padStart(4, "0")}                                                       ║
╠══════════════════════════════════════════════════════════════════════╣
║  Archetype: ${persona.archetype.displayName.padEnd(55)}║
║  Drug: ${persona.consciousness.drug.padEnd(60)}║
║  Element: ${persona.traits.element.padEnd(57)}║
║  Birthday: ${persona.traits.birthday.slice(0, 25).padEnd(56)}║
║  Sun: ${persona.astrology.sunSign.padEnd(10)} Moon: ${persona.astrology.moonSign.padEnd(10)} Rising: ${persona.astrology.ascendingSign.padEnd(14)}║
║  Swag: ${persona.traits.swagRank} (${persona.traits.swagScore.toString().padStart(3)})                                                    ║
╠══════════════════════════════════════════════════════════════════════╣
║  PERSONALITY                                                         ║
║  Openness: ${(persona.personality.openness * 100).toFixed(0).padStart(4)}%   Energy: ${(persona.personality.energy * 100).toFixed(0).padStart(4)}%   Chaos: ${(persona.personality.chaos * 100).toFixed(0).padStart(4)}%        ║
║  Warmth: ${(persona.personality.warmth * 100).toFixed(0).padStart(4)}%    Intensity: ${(persona.personality.intensity * 100).toFixed(0).padStart(4)}%                          ║
║  Rave: ${(persona.personality.raveAffinity * 100).toFixed(0).padStart(3)}%  Digital: ${(persona.personality.digitalNative * 100).toFixed(0).padStart(3)}%  Mysticism: ${(persona.personality.mysticism * 100).toFixed(0).padStart(3)}%            ║
╠══════════════════════════════════════════════════════════════════════╣
║  VOICE: ${persona.voice.tempo} / ${persona.voice.style}
║  Quirks: ${persona.voice.quirks.slice(0, 3).join(", ").slice(0, 55)}
╠══════════════════════════════════════════════════════════════════════╣
║  INTERESTS                                                           ║
${persona.interests.slice(0, 5).map(i => `║  • ${i.slice(0, 63).padEnd(64)}║`).join("\n")}
╠══════════════════════════════════════════════════════════════════════╣
║  SELF IMAGE: ${getSelfImageUrl(id).slice(0, 53)}
╚══════════════════════════════════════════════════════════════════════╝
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
