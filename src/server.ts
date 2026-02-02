// HTTP API Server for Mibera Personality Engine
// Serves personas on demand or from cache

import { createServer, IncomingMessage, ServerResponse } from "http";
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { getMiberaPersonality, exportAgentConfig, exportPersonaToJSON } from "./index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CACHE_DIR = join(__dirname, "../output/personas");

const PORT = parseInt(process.env.PORT || "3333");

function sendJSON(res: ServerResponse, data: unknown, status = 200) {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*"
  });
  res.end(JSON.stringify(data, null, 2));
}

function sendError(res: ServerResponse, message: string, status = 400) {
  sendJSON(res, { error: message }, status);
}

async function handleRequest(req: IncomingMessage, res: ServerResponse) {
  const url = new URL(req.url || "/", `http://localhost:${PORT}`);
  const path = url.pathname;

  // CORS preflight
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    });
    res.end();
    return;
  }

  // Health check
  if (path === "/" || path === "/health") {
    sendJSON(res, {
      status: "ok",
      service: "mibera-personality-engine",
      version: "0.1.0",
      endpoints: [
        "GET /mibera/:id - Full persona",
        "GET /mibera/:id/prompt - System prompt only",
        "GET /mibera/:id/agent - Agent config (Legba/OpenClaw compatible)",
        "GET /random - Random Mibera persona",
        "GET /stats - Collection statistics"
      ]
    });
    return;
  }

  // Random Mibera
  if (path === "/random") {
    const id = Math.floor(Math.random() * 10000) + 1;
    const persona = getMiberaPersonality(id);
    if (!persona) {
      sendError(res, `Could not load Mibera #${id}`, 500);
      return;
    }
    sendJSON(res, persona);
    return;
  }

  // Stats endpoint
  if (path === "/stats") {
    // Sample some Miberas to get archetype distribution
    const archetypes: Record<string, number> = {};
    const drugs: Record<string, number> = {};
    const elements: Record<string, number> = {};

    for (let i = 1; i <= 100; i++) {
      const persona = getMiberaPersonality(i);
      if (persona) {
        archetypes[persona.archetype.name] = (archetypes[persona.archetype.name] || 0) + 1;
        drugs[persona.consciousness.drug] = (drugs[persona.consciousness.drug] || 0) + 1;
        elements[persona.traits.element] = (elements[persona.traits.element] || 0) + 1;
      }
    }

    sendJSON(res, {
      totalMiberas: 10000,
      sampleSize: 100,
      archetypeDistribution: archetypes,
      drugDistribution: drugs,
      elementDistribution: elements
    });
    return;
  }

  // Mibera by ID
  const miberaMatch = path.match(/^\/mibera\/(\d+)(\/.*)?$/);
  if (miberaMatch) {
    const id = parseInt(miberaMatch[1]);
    const subpath = miberaMatch[2] || "";

    if (id < 1 || id > 10000) {
      sendError(res, "Mibera ID must be between 1 and 10000", 400);
      return;
    }

    // Try cache first
    const cacheFile = join(CACHE_DIR, `${id.toString().padStart(4, "0")}.json`);
    let persona;

    if (existsSync(cacheFile)) {
      try {
        persona = JSON.parse(readFileSync(cacheFile, "utf-8"));
      } catch {
        persona = getMiberaPersonality(id);
      }
    } else {
      persona = getMiberaPersonality(id);
    }

    if (!persona) {
      sendError(res, `Mibera #${id} not found`, 404);
      return;
    }

    // Return based on subpath
    if (subpath === "/prompt") {
      res.writeHead(200, {
        "Content-Type": "text/plain",
        "Access-Control-Allow-Origin": "*"
      });
      res.end(persona.systemPrompt);
      return;
    }

    if (subpath === "/agent") {
      sendJSON(res, exportAgentConfig(persona));
      return;
    }

    // Full persona
    sendJSON(res, persona);
    return;
  }

  // 404
  sendError(res, "Not found", 404);
}

const server = createServer(handleRequest);

server.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║  MIBERA PERSONALITY ENGINE API                               ║
╠══════════════════════════════════════════════════════════════╣
║  Server running on http://localhost:${PORT}                      ║
║                                                              ║
║  Endpoints:                                                  ║
║    GET /                    Health check                     ║
║    GET /mibera/:id          Full persona                     ║
║    GET /mibera/:id/prompt   System prompt only               ║
║    GET /mibera/:id/agent    Agent config (Legba/OpenClaw)    ║
║    GET /random              Random Mibera                    ║
║    GET /stats               Collection statistics            ║
╚══════════════════════════════════════════════════════════════╝
  `);
});

export { server };
