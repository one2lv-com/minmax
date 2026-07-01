// BackBox Gaming OS - Lumenis v7.0
// Trainer Module for Event Recording

class Trainer {
    constructor() {
        this.events = [];
        this.maxEvents = 1000;
    }

    record(event) {
        const { type, timestamp, data } = event;
        this.events.push({ type, timestamp: timestamp || Date.now(), data });
        if (this.events.length > this.maxEvents) this.events.shift();
        return { recorded: true, total: this.events.length };
    }

    getEvents(filter = {}) {
        let result = this.events;
        if (filter.type) {
            result = result.filter(e => e.type === filter.type);
        }
        if (filter.limit) {
            result = result.slice(-filter.limit);
        }
        return result;
    }

    analyze() {
        const types = {};
        this.events.forEach(e => {
            types[e.type] = (types[e.type] || 0) + 1;
        });

        return {
            total: this.events.length,
            types,
            latest: this.events[this.events.length - 1]
        };
    }

    status() {
        return {
            active: true,
            events: this.events.length,
            maxEvents: this.maxEvents
        };
    }
}

module.exports = { Trainer };