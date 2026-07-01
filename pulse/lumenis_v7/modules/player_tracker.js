/**
 * Player Performance Tracker
 * Tracks response times and performance metrics
 */

const stats = {
  responseTimes: [],
  actions: [],
  combos: [],
  avgResponseTime: 0,
  bestResponseTime: Infinity,
  totalActions: 0
};

const CONFIG = {
  TARGET_RESPONSE_TIME: 50, // ms
  MAX_HISTORY: 1000,
  RESPONSE_WEIGHTS: {
    hit: 1,
    dodge: 2,
    block: 3,
    combo: 5
  }
};

const PlayerTracker = {
  recordAction(action, responseTime, metadata = {}) {
    stats.totalActions++;
    stats.responseTimes.push(responseTime);

    // Track best response
    if (responseTime < stats.bestResponseTime) {
      stats.bestResponseTime = responseTime;
    }

    // Calculate running average
    const sum = stats.responseTimes.reduce((a, b) => a + b, 0);
    stats.avgResponseTime = sum / stats.responseTimes.length;

    // Store action
    stats.actions.push({
      type: action,
      responseTime,
      timestamp: Date.now(),
      ...metadata
    });

    // Keep history limited
    if (stats.responseTimes.length > CONFIG.MAX_HISTORY) {
      stats.responseTimes.shift();
      stats.actions.shift();
    }

    // Check for combo
    if (action === 'hit' && metadata.combo) {
      stats.combos.push({
        hits: metadata.combo.hits,
        timestamp: Date.now()
      });
    }

    return this.getStats();
  },

  getStats() {
    const percentiles = this.calculatePercentiles();

    return {
      totalActions: stats.totalActions,
      avgResponseTime: Math.round(stats.avgResponseTime * 100) / 100,
      bestResponseTime: stats.bestResponseTime,
      targetMet: stats.avgResponseTime <= CONFIG.TARGET_RESPONSE_TIME,
      percentile50: percentiles.p50,
      percentile95: percentiles.p95,
      percentile99: percentiles.p99,
      recentCombos: stats.combos.slice(-10),
      consistency: this.calculateConsistency()
    };
  },

  calculatePercentiles() {
    const sorted = [...stats.responseTimes].sort((a, b) => a - b);
    const len = sorted.length;

    return {
      p50: len > 0 ? sorted[Math.floor(len * 0.5)] : 0,
      p95: len > 0 ? sorted[Math.floor(len * 0.95)] : 0,
      p99: len > 0 ? sorted[Math.floor(len * 0.99)] : 0
    };
  },

  calculateConsistency() {
    if (stats.responseTimes.length < 2) return 100;

    const mean = stats.avgResponseTime;
    const squaredDiffs = stats.responseTimes.map(t => Math.pow(t - mean, 2));
    const variance = squaredDiffs.reduce((a, b) => a + b, 0) / stats.responseTimes.length;
    const stdDev = Math.sqrt(variance);

    // Lower std dev = higher consistency
    const consistency = Math.max(0, 100 - (stdDev / mean) * 100);
    return Math.round(consistency);
  },

  getRecentActions(count = 20) {
    return stats.actions.slice(-count);
  },

  reset() {
    stats.responseTimes = [];
    stats.actions = [];
    stats.combos = [];
    stats.avgResponseTime = 0;
    stats.bestResponseTime = Infinity;
    stats.totalActions = 0;
  }
};

module.exports = { PlayerTracker, CONFIG };
