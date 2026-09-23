/**
 * AI Arcade MCP Client for One2lvOS Phase 9
 * ==========================================
 * Gives the Phase 9 council direct access to the AI Arcade MCP server.
 * Used by council agents to play games, query state, and update beliefs.
 */

import http from 'http';

const ARCADE_URL = "http://localhost:8003";
const MCP_URL    = `${ARCADE_URL}/mcp`;

let _reqId = 0;

/**
 * Call an MCP tool via Streamable HTTP
 * @param {string} tool
 * @param {Object} args
 * @returns {Promise<Object>}
 */
export async function arcadeCall(tool, args = {}) {
  const body = JSON.stringify({
    jsonrpc: "2.0",
    id: ++_reqId,
    method: "tools/call",
    params: { name: tool, arguments: args },
  });

  return new Promise((resolve) => {
    const req = http.request(
      MCP_URL,
      { method: "POST", headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) } },
      (res) => {
        let data = "";
        res.on("data", (c) => (data += c));
        res.on("end", () => {
          try {
            const json = JSON.parse(data);
            if (json.error) return resolve({ error: json.error });
            const text = json?.result?.content?.[0]?.text ?? "";
            try { resolve(JSON.parse(text)); }
            catch {
              // Plain-text response — extract game_id if present
              const m = text.match(/ID\s*:\s*([A-F0-9]{6,})/);
              resolve({ raw: text, game_id: m?.[1] ?? null, status: "ok" });
            }
          } catch (e) { resolve({ error: e.message }); }
        });
      }
    );
    req.on("error", (e) => resolve({ error: `Arcade unreachable: ${e.message}` }));
    req.setTimeout(8000, () => { req.destroy(); resolve({ error: "timeout" }); });
    req.write(body);
    req.end();
  });
}

/** Check if the arcade server is reachable */
export async function arcadeHealth() {
  return new Promise((resolve) => {
    http.get(ARCADE_URL + "/", (res) => resolve(res.statusCode < 500))
        .on("error", () => resolve(false));
  });
}

/** Full lobby: create + join */
export async function arcadeStartGame(gameType, player1, player2) {
  const created = await arcadeCall("create_game", { game_type: gameType, player_name: player1 });
  if (created.error) return created;
  const gameId = created.game_id;
  if (!gameId || created.game_status === "active") return created;
  const joined = await arcadeCall("join_game", { game_id: gameId, player_name: player2 });
  return { ...joined, game_id: joined.game_id ?? gameId };
}

export const arcade = {
  info:       ()                        => arcadeCall("arcade_info"),
  listGames:  ()                        => arcadeCall("list_games"),
  leaderboard:()                        => arcadeCall("get_leaderboard"),
  library:    (category)                => arcadeCall("library_list", category ? { category } : {}),
  startGame:  (type, p1, p2)            => arcadeStartGame(type, p1, p2),
  makeMove:   (id, player, move)        => arcadeCall("make_move",      { game_id: id, player_name: player, move }),
  getState:   (id)                      => arcadeCall("get_game_state",  { game_id: id }),
  resign:     (id, player)              => arcadeCall("resign_game",     { game_id: id, player_name: player }),
};

export const ARCADE_MANIFEST = `
AI Arcade MCP — http://localhost:8003
  Protocol : MCP 2024-11-05 (Streamable HTTP POST /mcp + SSE GET /sse)
  Playable : chess, go, checkers, othello, tictactoe, connect4, minesweeper,
             sudoku, scrabble, battleship, pacman, tetris, space_invaders,
             pong, universal_paperclips
  Library  : 51 titles total
  Tools    : arcade_info, list_games, create_game, join_game, get_game_state,
             make_move, resign_game, get_leaderboard, game_info, library_list
`.trim();

// ── AI Lobby integration ──────────────────────────────────────────────────────
export const LOBBY_URL = "http://localhost:8006";

export async function lobbyPost(path, body) {
  return new Promise(resolve => {
    const data = JSON.stringify(body);
    const req = http.request(`${LOBBY_URL}${path}`, {
      method: "POST", headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(data) }
    }, res => { let d=""; res.on("data",c=>d+=c); res.on("end",()=>{ try{resolve(JSON.parse(d))}catch{resolve({})} }); });
    req.on("error", ()=>resolve({})); req.setTimeout(3000,()=>{req.destroy();resolve({})});
    req.write(data); req.end();
  });
}

export async function lobbyGet(path) {
  return new Promise(resolve => {
    http.get(`${LOBBY_URL}${path}`, res => {
      let d=""; res.on("data",c=>d+=c); res.on("end",()=>{ try{resolve(JSON.parse(d))}catch{resolve({})} });
    }).on("error",()=>resolve({}));
  });
}

export const lobby = {
  agents:    ()           => lobbyGet("/agents"),
  systems:   ()           => lobbyGet("/systems"),
  register:  (profile)    => lobbyPost("/agents/register", profile),
  broadcast: (from, msg)  => lobbyPost("/broadcast", { from, content: msg }),
};

export const LOBBY_MANIFEST = `
AI Lobby — http://localhost:8006
  All 26+ agents registered across: One2lvOS, Sovereign Agentic Core,
  AI Arcade MCP (51 games), Lumenis v7 Cosmic, minmax Phase 9, SteamOS Lumenis.
  GET  /agents — list agents
  POST /broadcast — broadcast to all
  WS   ws://localhost:8006/room — real-time room
`.trim();
