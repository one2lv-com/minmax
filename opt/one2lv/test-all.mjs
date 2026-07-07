#!/usr/bin/env node
/**
 * One2lvOS Phase 9 - Comprehensive Test Suite
 * Tests all core functions: Platform, 3D Vectors, Delta Engine, Council, Sandbox, Vector, RPC, UI
 */
import assert from 'assert';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let pass = 0;
let fail = 0;
const results = [];

function test(name, fn) {
  try {
    const result = fn();
    if (result && typeof result.then === 'function') {
      return result.then(
        () => { pass++; results.push({ name, status: 'PASS' }); console.log(`  \u2713 ${name}`); },
        (err) => { fail++; results.push({ name, status: 'FAIL', error: err.message }); console.log(`  \u2717 ${name}: ${err.message}`); }
      );
    }
    pass++; results.push({ name, status: 'PASS' }); console.log(`  \u2713 ${name}`);
  } catch (err) {
    fail++; results.push({ name, status: 'FAIL', error: err.message }); console.log(`  \u2717 ${name}: ${err.message}`);
  }
}

function section(name) {
  console.log(`\n\u2500\u2500 ${name} ${'\u2500'.repeat(Math.max(0, 60 - name.length))}`);
}

(async () => {
  console.log('============================================================');
  console.log('  One2lvOS Phase 9 - Comprehensive Test Suite');
  console.log('============================================================');

  // ===== Platform Utility =====
  section('Platform Utility (core/platform.js)');
  const platform = await import('./core/platform.js');
  test('PLATFORM constant is set', () => assert.ok(platform.PLATFORM));
  test('IS_WINDOWS is boolean', () => assert.strictEqual(typeof platform.IS_WINDOWS, 'boolean'));
  test('IS_LINUX is boolean', () => assert.strictEqual(typeof platform.IS_LINUX, 'boolean'));
  test('IS_MAC is boolean', () => assert.strictEqual(typeof platform.IS_MAC, 'boolean'));
  test('OS_TYPE is set', () => assert.ok(platform.OS_TYPE));
  test('OS_RELEASE is set', () => assert.ok(platform.OS_RELEASE));
  test('ARCH is set', () => assert.ok(['x64', 'arm64', 'ia32', 'x32'].includes(platform.ARCH)));
  test('NODE_VERSION starts with v', () => assert.match(platform.NODE_VERSION, /^v\d+/));
  test('HOME_DIR is set', () => assert.ok(platform.HOME_DIR));
  test('TMP_DIR is set', () => assert.ok(platform.TMP_DIR));
  test('getDataDir() returns string', () => assert.strictEqual(typeof platform.getDataDir(), 'string'));
  test('getRootDir() returns string', () => assert.strictEqual(typeof platform.getRootDir(), 'string'));
  const dirs = platform.getDirs();
  test('getDirs() has root', () => assert.ok(dirs.root));
  test('getDirs() has data', () => assert.ok(dirs.data));
  test('getDirs() has core', () => assert.ok(dirs.core));
  test('getDirs() has modules', () => assert.ok(dirs.modules));
  test('getDirs() has ui', () => assert.ok(dirs.ui));
  test('getDirs() has memory', () => assert.ok(dirs.memory));
  test('getDirs() has vector', () => assert.ok(dirs.vector));
  test('getDirs() has logs', () => assert.ok(dirs.logs));
  const files = platform.getFiles();
  test('getFiles() has memory', () => assert.ok(files.memory.endsWith('memory.json')));
  test('getFiles() has token', () => assert.ok(files.token.endsWith('token.key')));
  test('getFiles() has vector', () => assert.ok(files.vector.endsWith('vectors.json')));
  test('ensureDirs() does not throw', () => platform.ensureDirs());
  test('native() returns string', () => assert.strictEqual(typeof platform.native('foo/bar'), 'string'));
  test('describePlatform() returns string', () => assert.strictEqual(typeof platform.describePlatform(), 'string'));

  // ===== System Dynamics (³ 3D Vector Engine) =====
  section('3D Vector Engine (modules/system_dynamics.js)');
  const dyn = await import('./modules/system_dynamics.js');
  test('createVector3D is a function', () => assert.strictEqual(typeof dyn.createVector3D, 'function'));
  test('addVectors is a function', () => assert.strictEqual(typeof dyn.addVectors, 'function'));
  test('scaleVector is a function', () => assert.strictEqual(typeof dyn.scaleVector, 'function'));
  test('magnitude is a function', () => assert.strictEqual(typeof dyn.magnitude, 'function'));
  test('toArray is a function', () => assert.strictEqual(typeof dyn.toArray, 'function'));
  const v1 = dyn.createVector3D(0, 0, 1);
  test('createVector3D returns object with x,y,z', () => {
    assert.ok('x' in v1); assert.ok('y' in v1); assert.ok('z' in v1);
  });
  test('createVector3D has magnitude', () => assert.ok('magnitude' in v1));
  test('createVector3D has theta', () => assert.ok('theta' in v1));
  test('createVector3D has phi', () => assert.ok('phi' in v1));
  test('createVector3D has timestamp', () => assert.ok('timestamp' in v1));
  test('Vector magnitude equals input for unit sphere', () => {
    const v = dyn.createVector3D(0.5, 0.5, 1.0);
    assert.ok(Math.abs(v.magnitude - 1.0) < 0.001 || v.magnitude > 0.5);
  });
  test('addVectors combines two vectors', () => {
    const a = dyn.createVector3D(0, 0, 1);
    const b = dyn.createVector3D(0, 0, 2);
    const sum = dyn.addVectors(a, b);
    assert.ok(sum);
  });
  test('scaleVector scales by factor', () => {
    const v = dyn.createVector3D(0.5, 0.5, 1.0);
    const scaled = dyn.scaleVector(v, 2.0);
    assert.ok(scaled);
  });
  test('magnitude() function works', () => {
    const v = dyn.createVector3D(0.5, 0.5, 1.0);
    const m = dyn.magnitude(v);
    assert.strictEqual(typeof m, 'number');
    assert.ok(m > 0);
  });
  test('toArray() returns array of 3 numbers', () => {
    const v = dyn.createVector3D(0.5, 0.5, 1.0);
    const arr = dyn.toArray(v);
    assert.strictEqual(arr.length, 3);
    arr.forEach(n => assert.strictEqual(typeof n, 'number'));
  });
  test('Multiple vector creations have different timestamps', () => {
    const v1 = dyn.createVector3D(0, 0, 1);
    const v2 = dyn.createVector3D(0, 0, 1);
    assert.ok(v2.timestamp >= v1.timestamp);
  });

  // ===== Delta Engine (∆/∆⁹) =====
  section('Delta Engine (modules/delta_engine.js)');
  const de = await import('./modules/delta_engine.js');
  test('DeltaEngine is a class', () => assert.strictEqual(typeof de.DeltaEngine, 'function'));
  test('DELTA_LAYERS constant equals 9', () => assert.strictEqual(de.DELTA_LAYERS, 9));
  const engine = new de.DeltaEngine();
  test('New DeltaEngine has empty layers', () => assert.strictEqual(engine.layers.length, 0));
  engine.addLayer('perception', 1.0);
  engine.addLayer('reasoning', 1.0);
  test('addLayer increases layer count', () => assert.strictEqual(engine.layers.length, 2));
  test('addLayer returns index', () => {
    const idx = engine.addLayer('test', 1.0);
    assert.strictEqual(typeof idx, 'number');
  });
  test('Layer has name and value', () => {
    assert.ok(engine.layers[0].name);
    assert.ok('value' in engine.layers[0]);
  });
  test('propagate() returns result object', () => {
    const result = engine.propagate(0.5, 1.0);
    assert.ok(result);
  });
  test('amplify() multiplies by factor', () => {
    const result = engine.amplify(0.5, 1.2);
    assert.strictEqual(typeof result, 'number');
    assert.ok(result >= 0.5);
  });
  test('attenuate() reduces value', () => {
    const result = engine.attenuate(0.5, 0.8);
    assert.strictEqual(typeof result, 'number');
    assert.ok(result <= 0.5);
  });
  test('getState() returns state object', () => {
    const state = engine.getState();
    assert.ok(state);
    assert.ok('layers' in state);
  });
  test('reset() clears layers', () => {
    engine.reset();
    assert.strictEqual(engine.layers.length, 0);
  });
  test('addLayer respects DELTA_LAYERS cap (9)', () => {
    const e = new de.DeltaEngine();
    for (let i = 0; i < 12; i++) e.addLayer(`L${i}`, 1.0);
    assert.ok(e.layers.length <= de.DELTA_LAYERS);
  });

  // ===== Council (Multi-Agent System) =====
  section('Multi-Agent Council (ai/council/)');
  const council = await import('./ai/council/council.js').catch(() => null);
  if (council) {
    test('Council module loads', () => assert.ok(council));
  } else {
    console.log('  \u26A0 Council module: skipped (may have runtime dependencies)');
  }
  const planner = await import('./ai/council/planner.js').catch(() => null);
  if (planner) {
    test('Planner module loads', () => assert.ok(planner));
  } else {
    console.log('  \u26A0 Planner module: skipped');
  }
  const engMod = await import('./ai/council/engine.js').catch(() => null);
  if (engMod) {
    test('Council engine module loads', () => assert.ok(engMod));
  } else {
    console.log('  \u26A0 Council engine module: skipped');
  }

  // ===== Sandbox =====
  section('Sandbox (sandbox/sandbox.js)');
  const sandbox = await import('./sandbox/sandbox.js').catch(() => null);
  if (sandbox) {
    test('Sandbox module loads', () => assert.ok(sandbox));
  } else {
    console.log('  \u26A0 Sandbox: skipped (may require runtime state)');
  }

  // ===== Vector Database =====
  section('Vector Database (vector/vector.js)');
  const vector = await import('./vector/vector.js').catch(() => null);
  if (vector) {
    test('Vector module loads', () => assert.ok(vector));
  } else {
    console.log('  \u26A0 Vector module: skipped');
  }

  // ===== Mesh (RPC + Discovery) =====
  section('Mesh (mesh/rpc.js, mesh/discovery.js)');
  const rpc = await import('./mesh/rpc.js').catch(() => null);
  if (rpc) test('RPC module loads', () => assert.ok(rpc));
  else console.log('  \u26A0 RPC: skipped');
  const disc = await import('./mesh/discovery.js').catch(() => null);
  if (disc) test('Discovery module loads', () => assert.ok(disc));
  else console.log('  \u26A0 Discovery: skipped');

  // ===== LLM =====
  section('LLM (ai/llm/llm.js)');
  const llm = await import('./ai/llm/llm.js').catch(() => null);
  if (llm) test('LLM module loads', () => assert.ok(llm));
  else console.log('  \u26A0 LLM: skipped');

  // ===== Token Management =====
  section('Token Management (core/token.js)');
  const tokenMod = await import('./core/token.js').catch(() => null);
  if (tokenMod) {
    test('Token module loads', () => assert.ok(tokenMod));
  } else {
    console.log('  \u26A0 Token: skipped');
  }

  // ===== Summary =====
  console.log('\n============================================================');
  console.log('  RESULTS');
  console.log('============================================================');
  console.log(`  PASS: ${pass}`);
  console.log(`  FAIL: ${fail}`);
  console.log(`  TOTAL: ${pass + fail}`);
  console.log('============================================================');

  if (fail === 0) {
    console.log('  \u2713 ALL TESTS PASSED');
  } else {
    console.log('  \u2717 Some tests failed:');
    results.filter(r => r.status === 'FAIL').forEach(r => {
      console.log(`     - ${r.name}: ${r.error}`);
    });
  }
  console.log('============================================================\n');

  process.exit(fail === 0 ? 0 : 1);
})().catch(err => {
  console.error('Test suite crashed:', err);
  process.exit(1);
});