// BackBox Gaming OS - Lumenis v7.0
// Telemetry Combo Detector Module

class Telemetry {
    constructor() {
        this.hits = [];
        this.maxHits = 50;
        this.comboThreshold = 3;
        this.responseTimes = [];
    }

    process(payload) {
        const { hit, timestamp, responseTime } = payload;

        // Record hit
        if (hit) {
            this.hits.push({ timestamp, hit });
            if (this.hits.length > this.maxHits) this.hits.shift();
        }

        // Record response time
        if (responseTime !== undefined) {
            this.responseTimes.push(responseTime);
            if (this.responseTimes.length > this.maxHits) this.responseTimes.shift();
        }

        // Detect combo
        const combo = this.detectCombo();

        // Calculate stats
        const avgResponse = this.responseTimes.length > 0
            ? this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length
            : 0;

        return {
            combo,
            avgResponseTime: avgResponse,
            hitCount: this.hits.length,
            status: avgResponse <= 50 ? 'optimal' : 'degraded'
        };
    }

    detectCombo() {
        if (this.hits.length < this.comboThreshold) return null;

        // Group hits by timestamp proximity (within 1 second)
        const now = Date.now();
        const recent = this.hits.filter(h => now - h.timestamp < 1000);

        if (recent.length >= this.comboThreshold) {
            return {
                count: recent.length,
                type: recent.length >= 10 ? 'ultra' : recent.length >= 5 ? 'mega' : 'combo'
            };
        }
        return null;
    }

    status() {
        return {
            active: true,
            hits: this.hits.length,
            avgResponse: this.responseTimes.length > 0
                ? this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length
                : 0
        };
    }
}

module.exports = { Telemetry };