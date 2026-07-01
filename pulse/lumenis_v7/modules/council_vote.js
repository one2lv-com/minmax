/**
 * AI Council Voting System
 * Weighted voting for multi-agent strategy consensus
 */

const votes = {};
const voteHistory = [];
const MAX_HISTORY = 100;

const CouncilVoting = {
  vote(agent, strategy) {
    if (!votes[strategy]) {
      votes[strategy] = { count: 0, agents: [] };
    }

    votes[strategy].count++;
    votes[strategy].agents.push({
      agent,
      timestamp: Date.now()
    });

    voteHistory.push({ agent, strategy, timestamp: Date.now() });

    // Keep history limited
    if (voteHistory.length > MAX_HISTORY) {
      voteHistory.shift();
    }

    console.log(`🗳️ Council Vote: ${agent} voted for "${strategy}"`);
    console.log(`📊 Current standings:`, this.getResult());

    return this.getResult();
  },

  getResult() {
    let best = null;
    let max = 0;

    Object.entries(votes).forEach(([strategy, data]) => {
      if (data.count > max) {
        max = data.count;
        best = strategy;
      }
    });

    return best || 'Neutral';
  },

  getVotes() {
    return { ...votes };
  },

  getHistory() {
    return [...voteHistory];
  },

  clearVotes() {
    Object.keys(votes).forEach(key => delete votes[key]);
    voteHistory.length = 0;
  },

  // Weighted voting based on agent performance
  weightedVote(agent, strategy, weight) {
    if (!votes[strategy]) {
      votes[strategy] = { count: 0, agents: [], weight: 0 };
    }

    votes[strategy].count += weight;
    votes[strategy].weight += weight;
    votes[strategy].agents.push({
      agent,
      weight,
      timestamp: Date.now()
    });

    voteHistory.push({
      agent,
      strategy,
      weight,
      timestamp: Date.now()
    });
  }
};

module.exports = { CouncilVoting };
