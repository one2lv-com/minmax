/**
 * Combo Detector with Response Time Tracking
 * Detects 3+ hits within 2 seconds
 */

let comboState = {
  hits: 0,
  lastHitTime: 0,
  windowMs: 2000,
  minHits: 3,
  responseTimes: [],
  avgResponseTime: 0
};

function detectCombo(event) {
  const now = Date.now();

  // Reset if outside window
  if (now - comboState.lastHitTime > comboState.windowMs) {
    comboState.hits = 0;
  }

  comboState.lastHitTime = now;

  if (event.type === 'hit') {
    comboState.hits += event.damage ? 1 : 1;

    if (comboState.hits >= comboState.minHits) {
      const combo = {
        highlight: true,
        hits: comboState.hits,
        timestamp: now,
        damage: event.damage || 10
      };

      // Reset after detecting combo
      comboState.hits = 0;

      return combo;
    }
  }

  return null;
}

function recordResponseTime(ms) {
  comboState.responseTimes.push(ms);

  // Keep last 100
  if (comboState.responseTimes.length > 100) {
    comboState.responseTimes.shift();
  }

  // Calculate average
  comboState.avgResponseTime =
    comboState.responseTimes.reduce((a, b) => a + b, 0) /
    comboState.responseTimes.length;
}

function getStats() {
  return {
    ...comboState,
    targetMet: comboState.avgResponseTime <= 50
  };
}

function resetCombo() {
  comboState.hits = 0;
}

module.exports = {
  detectCombo,
  recordResponseTime,
  getStats,
  resetCombo
};
