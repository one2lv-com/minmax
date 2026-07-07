#!/usr/bin/env node
/**
 * API Integration Tests - Tests all HTTP endpoints and WebSocket protocol
 */
import http from 'http';

const BASE = `http://localhost:${process.env.TEST_PORT || 8080}`;
const WS_URL = `ws://localhost:${process.env.TEST_WS_PORT || 8081}`;

let pass = 0, fail = 0;

function request(method, path, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const url = new URL(BASE + path);
    const req = http.request({
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method,
      headers: data ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) } : {}
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: res.headers['content-type']?.includes('json') ? JSON.parse(body) : body });
        } catch (e) {
          resolve({ status: res.statusCode, body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function test(name, fn) {
  try {
    await fn();
    pass++;
    console.log(`  \u2713 ${name}`);
  } catch (err) {
    fail++;
    console.log(`  \u2717 ${name}: ${err.message}`);
  }
}

(async () => {
  console.log('============================================================');
  console.log('  API Integration Tests (HTTP + WebSocket)');
  console.log('============================================================');

  // Check server availability
  try {
    await request('GET', '/api/status');
  } catch (e) {
    console.log('Server not running on :8080. Start it first with:');
    console.log('  node launch.js  (or)  node ui/server.js');
    process.exit(2);
  }

  console.log('\n\u2500\u2500 Standard Endpoints \u2500'.padEnd(65, '\u2500'));
  await test('GET /api/status returns running', async () => {
    const r = await request('GET', '/api/status');
    if (r.status !== 200) throw new Error(`status=${r.status}`);
    if (r.body.status !== 'running') throw new Error(`got: ${r.body.status}`);
  });
  await test('GET /api/status has phase 9', async () => {
    const r = await request('GET', '/api/status');
    if (r.body.phase !== '9') throw new Error(`got: ${r.body.phase}`);
  });
  await test('GET /api/status has version', async () => {
    const r = await request('GET', '/api/status');
    if (!r.body.version) throw new Error('no version');
  });
  await test('GET /api/status has token', async () => {
    const r = await request('GET', '/api/status');
    if (!r.body.token) throw new Error('no token');
  });
  await test('GET /api/status has vector symbol', async () => {
    const r = await request('GET', '/api/status');
    if (r.body.vector?.symbol !== '\u00b3') throw new Error(`got: ${r.body.vector?.symbol}`);
  });
  await test('GET /api/status has delta symbol', async () => {
    const r = await request('GET', '/api/status');
    if (r.body.delta?.symbol !== '\u2206\u2079') throw new Error(`got: ${r.body.delta?.symbol}`);
  });
  await test('GET /api/memory returns object', async () => {
    const r = await request('GET', '/api/memory');
    if (r.status !== 200) throw new Error(`status=${r.status}`);
    if (typeof r.body !== 'object') throw new Error('not object');
  });
  await test('POST /api/inject adds node', async () => {
    const r = await request('POST', '/api/inject', { text: 'test injection ' + Date.now() });
    if (!r.body.ok) throw new Error('not ok');
    if (typeof r.body.nodes !== 'number') throw new Error('no count');
  });
  await test('POST /api/inject rejects empty text', async () => {
    const r = await request('POST', '/api/inject', { text: '' });
    if (r.status !== 400) throw new Error(`expected 400, got ${r.status}`);
  });
  await test('GET /api/stats returns numbers', async () => {
    const r = await request('GET', '/api/stats');
    if (typeof r.body.totalNodes !== 'number') throw new Error('no totalNodes');
  });

  console.log('\n\u2500\u2500 Phase 9 Vector Endpoints (\u00b3) \u2500'.padEnd(65, '\u2500'));
  await test('GET /api/vector3d returns vector', async () => {
    const r = await request('GET', '/api/vector3d');
    if (!r.body.vector) throw new Error('no vector');
    if (typeof r.body.magnitude !== 'number') throw new Error('no magnitude');
  });
  await test('POST /api/vector3d creates vector', async () => {
    const r = await request('POST', '/api/vector3d', { theta: 1.0, phi: 1.5, magnitude: 2.0 });
    if (!r.body.ok) throw new Error('not ok');
    if (Math.abs(r.body.vector.magnitude - 2.0) > 0.001) throw new Error(`mag: ${r.body.vector.magnitude}`);
  });
  await test('POST /api/vector3d rejects missing theta', async () => {
    const r = await request('POST', '/api/vector3d', { phi: 1.0 });
    if (r.status !== 400) throw new Error(`expected 400, got ${r.status}`);
  });
  await test('POST /api/vector3d/scale scales vector', async () => {
    const r = await request('POST', '/api/vector3d/scale', { factor: 2.0 });
    if (!r.body.ok) throw new Error('not ok');
    if (r.body.factor !== 2.0) throw new Error('factor mismatch');
  });
  await test('POST /api/vector3d/scale rejects missing factor', async () => {
    const r = await request('POST', '/api/vector3d/scale', {});
    if (r.status !== 400) throw new Error(`expected 400, got ${r.status}`);
  });

  console.log('\n\u2500\u2500 Phase 9 Delta Endpoints (\u2206/\u2206\u2079) \u2500'.padEnd(65, '\u2500'));
  await test('GET /api/delta returns state', async () => {
    const r = await request('GET', '/api/delta');
    if (r.body.maxLayers !== 9) throw new Error(`maxLayers: ${r.body.maxLayers}`);
    if (r.body.symbol !== '\u2206\u2079') throw new Error(`symbol: ${r.body.symbol}`);
  });
  await test('GET /api/delta has up to 9 layers', async () => {
    // Reset and populate with 9 layers for a deterministic count
    await request('POST', '/api/delta/reset', {});
    for (let i = 0; i < 9; i++) {
      await request('POST', '/api/delta/layer', { name: `L${i}`, weight: 1.0 });
    }
    const r = await request('GET', '/api/delta');
    if (r.body.layers.length !== 9) throw new Error(`got ${r.body.layers.length} layers`);
  });
  await test('POST /api/delta/propagate propagates', async () => {
    const r = await request('POST', '/api/delta/propagate', { target: 0.5 });
    if (!r.body.ok) throw new Error('not ok');
    if (typeof r.body.output !== 'number') throw new Error('no output');
  });
  await test('POST /api/delta/amplify amplifies (++)', async () => {
    // Set a known small magnitude first to avoid the 1.0 cap interfering
    await request('POST', '/api/vector3d', { theta: 0.5, phi: 0.5, magnitude: 0.3 });
    const r = await request('POST', '/api/delta/amplify', { factor: 1.5 });
    if (!r.body.ok) throw new Error('not ok');
    if (r.body.symbol !== '++') throw new Error('symbol mismatch');
    if (Math.abs(r.body.amplified - 0.3 * 1.5) > 0.001) throw new Error(`expected 0.45, got ${r.body.amplified}`);
  });
  await test('POST /api/delta/attenuate attenuates (--)', async () => {
    // Set a known magnitude first
    await request('POST', '/api/vector3d', { theta: 0.5, phi: 0.5, magnitude: 0.8 });
    const r = await request('POST', '/api/delta/attenuate', { factor: 0.5 });
    if (!r.body.ok) throw new Error('not ok');
    if (r.body.symbol !== '--') throw new Error('symbol mismatch');
    if (Math.abs(r.body.attenuated - 0.8 * 0.5) > 0.001) throw new Error(`expected 0.4, got ${r.body.attenuated}`);
  });
  await test('POST /api/delta/reset resets engine', async () => {
    const r = await request('POST', '/api/delta/reset', {});
    if (!r.body.ok) throw new Error('not ok');
  });
  await test('POST /api/delta/layer adds layer', async () => {
    const r = await request('POST', '/api/delta/layer', { name: 'test_layer', weight: 1.0 });
    if (!r.body.ok) throw new Error('not ok');
    if (typeof r.body.layerIndex !== 'number') throw new Error('no index');
  });

  console.log('\n\u2500\u2500 Dashboard HTML \u2500'.padEnd(65, '\u2500'));
  await test('GET / returns HTML', async () => {
    const r = await request('GET', '/');
    if (r.status !== 200) throw new Error(`status=${r.status}`);
    if (typeof r.body !== 'string' || !r.body.includes('One2lvOS')) throw new Error('not HTML');
  });
  await test('Dashboard HTML contains symbol panel', async () => {
    const r = await request('GET', '/');
    if (!r.body.includes('Phase 9 Symbols')) throw new Error('no symbol panel');
  });
  await test('Dashboard HTML contains vector control', async () => {
    const r = await request('GET', '/');
    if (!r.body.includes('3D Vector Control')) throw new Error('no vector control');
  });
  await test('Dashboard HTML contains delta engine', async () => {
    const r = await request('GET', '/');
    if (!r.body.includes('Delta Engine')) throw new Error('no delta engine');
  });

  console.log('\n\u2500\u2500 WebSocket Protocol (:8081) \u2500'.padEnd(65, '\u2500'));
  await test('WebSocket connects and receives status', async () => {
    const { default: WebSocket } = await import('ws');
    const ws = new WebSocket(WS_URL);
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('timeout')), 3000);
      ws.on('open', () => {});
      ws.on('message', (data) => {
        clearTimeout(timeout);
        const msg = JSON.parse(data);
        if (msg.type !== 'phase9_status') reject(new Error(`got: ${msg.type}`));
        else resolve();
        ws.close();
      });
      ws.on('error', reject);
    });
  });
  await test('WebSocket handles vector3d_create', async () => {
    const { default: WebSocket } = await import('ws');
    const ws = new WebSocket(WS_URL);
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('timeout')), 3000);
      ws.on('open', () => {
        ws.send(JSON.stringify({ action: 'vector3d_create', theta: 1.0, phi: 1.0, magnitude: 1.5 }));
      });
      let got = false;
      ws.on('message', (data) => {
        const msg = JSON.parse(data);
        if (msg.type === 'vector_created') {
          got = true;
          clearTimeout(timeout);
          resolve();
          ws.close();
        }
      });
      ws.on('error', reject);
    });
  });
  await test('WebSocket handles amplify', async () => {
    const { default: WebSocket } = await import('ws');
    const ws = new WebSocket(WS_URL);
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('timeout')), 3000);
      ws.on('open', () => ws.send(JSON.stringify({ action: 'amplify', factor: 1.3 })));
      ws.on('message', (data) => {
        const msg = JSON.parse(data);
        if (msg.type === 'amplified') {
          clearTimeout(timeout);
          resolve();
          ws.close();
        }
      });
      ws.on('error', reject);
    });
  });
  await test('WebSocket handles attenuate', async () => {
    const { default: WebSocket } = await import('ws');
    const ws = new WebSocket(WS_URL);
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('timeout')), 3000);
      ws.on('open', () => ws.send(JSON.stringify({ action: 'attenuate', factor: 0.5 })));
      ws.on('message', (data) => {
        const msg = JSON.parse(data);
        if (msg.type === 'attenuated') {
          clearTimeout(timeout);
          resolve();
          ws.close();
        }
      });
      ws.on('error', reject);
    });
  });
  await test('WebSocket handles propagate', async () => {
    const { default: WebSocket } = await import('ws');
    const ws = new WebSocket(WS_URL);
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('timeout')), 3000);
      ws.on('open', () => ws.send(JSON.stringify({ action: 'propagate', target: 0.5 })));
      ws.on('message', (data) => {
        const msg = JSON.parse(data);
        if (msg.type === 'propagated') {
          clearTimeout(timeout);
          resolve();
          ws.close();
        }
      });
      ws.on('error', reject);
    });
  });
  await test('WebSocket handles get_state', async () => {
    const { default: WebSocket } = await import('ws');
    const ws = new WebSocket(WS_URL);
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('timeout')), 3000);
      ws.on('open', () => ws.send(JSON.stringify({ action: 'get_state' })));
      ws.on('message', (data) => {
        const msg = JSON.parse(data);
        if (msg.type === 'state') {
          clearTimeout(timeout);
          resolve();
          ws.close();
        }
      });
      ws.on('error', reject);
    });
  });
  await test('WebSocket handles unknown action with error', async () => {
    const { default: WebSocket } = await import('ws');
    const ws = new WebSocket(WS_URL);
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('timeout')), 3000);
      ws.on('open', () => ws.send(JSON.stringify({ action: 'invalid_action_xyz' })));
      ws.on('message', (data) => {
        const msg = JSON.parse(data);
        if (msg.type === 'error') {
          clearTimeout(timeout);
          resolve();
          ws.close();
        }
      });
      ws.on('error', reject);
    });
  });

  console.log('\n============================================================');
  console.log('  API TEST RESULTS');
  console.log('============================================================');
  console.log(`  PASS: ${pass}`);
  console.log(`  FAIL: ${fail}`);
  console.log(`  TOTAL: ${pass + fail}`);
  console.log('============================================================');

  if (fail === 0) {
    console.log('  \u2713 ALL API TESTS PASSED');
  } else {
    console.log('  \u2717 Some API tests failed');
  }
  console.log('============================================================\n');

  process.exit(fail === 0 ? 0 : 1);
})();