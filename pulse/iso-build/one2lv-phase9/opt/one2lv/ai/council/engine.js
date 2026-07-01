/**
 * One2lvOS Council Engine
 * Phase 4-8: Multi-agent negotiation and scoring
 */

/**
 * Negotiate between multiple plans
 * Returns the consensus plan
 */
export function negotiate(plans) {
  if (!plans || plans.length === 0) return null;
  if (plans.length === 1) return plans[0];

  // Count occurrences
  const map = {};
  plans.forEach(p => {
    const key = typeof p === 'string' ? p.trim() : JSON.stringify(p);
    map[key] = (map[key] || 0) + 1;
  });

  // Sort by frequency
  const sorted = Object.entries(map).sort((a, b) => b[1] - a[1]);

  // Return most common
  const winner = sorted[0][0];

  // Try to parse if it's JSON
  try {
    return JSON.parse(winner);
  } catch {
    return winner;
  }
}

/**
 * Score a result
 */
export function score(result) {
  if (!result) return 0;

  const str = typeof result === 'string' ? result : JSON.stringify(result);

  // Error check
  if (str.includes('error') || str.includes('denied') || str.includes('failed')) {
    return -1;
  }

  // Success check
  if (str.includes('success') || str.includes('ok') || str.includes('completed')) {
    return 1;
  }

  // Neutral
  return 0;
}

/**
 * Calculate consensus strength
 */
export function consensusStrength(plans) {
  if (!plans || plans.length === 0) return 0;

  const counts = {};
  plans.forEach(p => {
    const key = typeof p === 'string' ? p.trim() : JSON.stringify(p);
    counts[key] = (counts[key] || 0) + 1;
  });

  const maxCount = Math.max(...Object.values(counts));
  return maxCount / plans.length;
}

/**
 * Rank plans by score
 */
export function rankPlans(plans, scores) {
  const ranked = plans.map((plan, i) => ({
    plan,
    score: scores[i] || 0,
    index: i
  }));

  ranked.sort((a, b) => b.score - a.score);
  return ranked;
}

/**
 * Select best plan using weighted voting
 */
export function weightedVote(plans, weights) {
  if (!plans || plans.length === 0) return null;
  if (!weights || weights.length !== plans.length) {
    return negotiate(plans);
  }

  // Calculate weighted scores
  const scores = {};
  plans.forEach((plan, i) => {
    const key = typeof plan === 'string' ? plan.trim() : JSON.stringify(plan);
    scores[key] = (scores[key] || 0) + (weights[i] || 1);
  });

  // Sort by weighted score
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);

  const winner = sorted[0][0];
  try {
    return JSON.parse(winner);
  } catch {
    return winner;
  }
}

/**
 * Evaluate plan feasibility
 */
export function evaluatePlan(plan) {
  const str = typeof plan === 'string' ? plan : JSON.stringify(plan);

  // Check for dangerous commands
  const dangerous = ['rm -rf', 'drop', 'delete *', 'format', 'shutdown', 'reboot'];
  for (const cmd of dangerous) {
    if (str.toLowerCase().includes(cmd)) {
      return { feasible: false, reason: `Contains dangerous command: ${cmd}` };
    }
  }

  // Check for command length
  if (str.length > 500) {
    return { feasible: false, reason: 'Plan too long' };
  }

  return { feasible: true };
}

/**
 * Merge similar plans
 */
export function mergePlans(plans) {
  if (!plans || plans.length < 2) return plans;

  const merged = [];
  const processed = new Set();

  for (let i = 0; i < plans.length; i++) {
    if (processed.has(i)) continue;

    const current = plans[i];
    const similar = [current];
    processed.add(i);

    for (let j = i + 1; j < plans.length; j++) {
      if (processed.has(j)) continue;

      if (plansAreSimilar(current, plans[j])) {
        similar.push(plans[j]);
        processed.add(j);
      }
    }

    // Merge similar plans
    merged.push(similar.length > 1 ? mergeSimilar(similar) : current);
  }

  return merged;
}

/**
 * Check if two plans are similar
 */
function plansAreSimilar(a, b) {
  const strA = typeof a === 'string' ? a : JSON.stringify(a);
  const strB = typeof b === 'string' ? b : JSON.stringify(b);

  // Simple similarity: check if one contains the other
  return strA.includes(strB) || strB.includes(strA);
}

/**
 * Merge similar plans
 */
function mergeSimilar(plans) {
  // For now, just return the longest/most detailed plan
  return plans.reduce((best, current) => {
    const bestStr = typeof best === 'string' ? best : JSON.stringify(best);
    const currentStr = typeof current === 'string' ? current : JSON.stringify(current);
    return currentStr.length > bestStr.length ? current : best;
  });
}

/**
 * Create voting round result
 */
export function votingRound(plans) {
  const consensus = negotiate(plans);
  const strength = consensusStrength(plans);
  const merged = mergePlans(plans);

  return {
    plans,
    consensus,
    consensusStrength: Math.round(strength * 100) / 100,
    mergedPlans: merged,
    voteCount: plans.length,
    uniquePlans: [...new Set(plans.map(p => typeof p === 'string' ? p.trim() : JSON.stringify(p)))].length
  };
}

export default {
  negotiate,
  score,
  consensusStrength,
  rankPlans,
  weightedVote,
  evaluatePlan,
  mergePlans,
  votingRound
};
