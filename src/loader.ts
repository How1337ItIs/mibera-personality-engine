// Load Mibera data from Codex markdown files

import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { MiberaTraits, Archetype } from "./types.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Path to the Codex relative to this package
const CODEX_PATH = join(__dirname, "../../../gumibera/mibera-codex-new");

function parseArchetype(value: string): Archetype {
  const normalized = value.toLowerCase().replace(/[^a-z]/g, "");
  if (normalized.includes("chicago") || normalized.includes("detroit")) {
    return Archetype.CHICAGO_DETROIT;
  }
  if (normalized.includes("milady")) {
    return Archetype.MILADY;
  }
  if (normalized.includes("freetekno")) {
    return Archetype.FREETEKNO;
  }
  if (normalized.includes("acidhouse") || normalized.includes("acid")) {
    return Archetype.ACID_HOUSE;
  }
  // Default fallback
  return Archetype.FREETEKNO;
}

function extractTraitValue(line: string): string {
  // Extract value from markdown table row: | Trait | [Value](link) | or | Trait | Value |
  const match = line.match(/\|\s*[^|]+\s*\|\s*\[?([^\]|]+)\]?/);
  if (match) {
    return match[1].trim();
  }
  // Handle "None" values
  if (line.includes("| None")) {
    return "";
  }
  return "";
}

function parseCoordinates(coordStr: string): { lat: number; lng: number } {
  const parts = coordStr.split(",").map((s) => parseFloat(s.trim()));
  return { lat: parts[0] || 0, lng: parts[1] || 0 };
}

export function loadMiberaFromCodex(id: number): MiberaTraits | null {
  const paddedId = id.toString().padStart(4, "0");
  const filePath = join(CODEX_PATH, "miberas", `${paddedId}.md`);

  if (!existsSync(filePath)) {
    console.error(`Mibera #${id} not found at ${filePath}`);
    return null;
  }

  const content = readFileSync(filePath, "utf-8");
  const lines = content.split("\n");

  const traits: Partial<MiberaTraits> = { id };

  for (const line of lines) {
    const lowerLine = line.toLowerCase();

    if (lowerLine.includes("| archetype |")) {
      traits.archetype = parseArchetype(extractTraitValue(line));
    } else if (lowerLine.includes("| ancestor |")) {
      traits.ancestor = extractTraitValue(line);
    } else if (lowerLine.includes("| time period |")) {
      traits.timePeriod = extractTraitValue(line);
    } else if (lowerLine.includes("| birthday |")) {
      traits.birthday = extractTraitValue(line);
    } else if (lowerLine.includes("| birth coordinates |")) {
      traits.birthCoordinates = parseCoordinates(extractTraitValue(line));
    } else if (lowerLine.includes("| sun sign |")) {
      traits.sunSign = extractTraitValue(line);
    } else if (lowerLine.includes("| moon sign |")) {
      traits.moonSign = extractTraitValue(line);
    } else if (lowerLine.includes("| ascending sign |")) {
      traits.ascendingSign = extractTraitValue(line);
    } else if (lowerLine.includes("| element |")) {
      traits.element = extractTraitValue(line);
    } else if (lowerLine.includes("| swag rank |")) {
      traits.swagRank = extractTraitValue(line);
    } else if (lowerLine.includes("| swag score |")) {
      traits.swagScore = parseInt(extractTraitValue(line)) || 0;
    } else if (lowerLine.includes("| background |")) {
      traits.background = extractTraitValue(line);
    } else if (lowerLine.includes("| body |")) {
      traits.body = extractTraitValue(line);
    } else if (lowerLine.includes("| hair |")) {
      traits.hair = extractTraitValue(line);
    } else if (lowerLine.includes("| eyes |")) {
      traits.eyes = extractTraitValue(line);
    } else if (lowerLine.includes("| eyebrows |")) {
      traits.eyebrows = extractTraitValue(line);
    } else if (lowerLine.includes("| mouth |")) {
      traits.mouth = extractTraitValue(line);
    } else if (lowerLine.includes("| shirt |")) {
      traits.shirt = extractTraitValue(line);
    } else if (lowerLine.includes("| hat |")) {
      traits.hat = extractTraitValue(line) || null;
    } else if (lowerLine.includes("| glasses |")) {
      traits.glasses = extractTraitValue(line) || null;
    } else if (lowerLine.includes("| mask |")) {
      traits.mask = extractTraitValue(line) || null;
    } else if (lowerLine.includes("| earrings |")) {
      traits.earrings = extractTraitValue(line) || null;
    } else if (lowerLine.includes("| face accessory |")) {
      traits.faceAccessory = extractTraitValue(line) || null;
    } else if (lowerLine.includes("| tattoo |")) {
      traits.tattoo = extractTraitValue(line) || null;
    } else if (lowerLine.includes("| item |")) {
      traits.item = extractTraitValue(line) || null;
    } else if (lowerLine.includes("| drug |")) {
      traits.drug = extractTraitValue(line);
    }
  }

  return traits as MiberaTraits;
}

export function loadAllMiberas(start = 1, end = 10000): MiberaTraits[] {
  const miberas: MiberaTraits[] = [];
  for (let i = start; i <= end; i++) {
    const mibera = loadMiberaFromCodex(i);
    if (mibera) {
      miberas.push(mibera);
    }
  }
  return miberas;
}
