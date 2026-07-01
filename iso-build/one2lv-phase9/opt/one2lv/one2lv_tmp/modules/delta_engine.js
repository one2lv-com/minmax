/**
 * One2lvOS Phase 9 - Delta Engine
 * 9-Layer Gradient Stack
 * Symbols: ∆ (delta), ∆⁹ (layers cap at 9)
 */

const DELTA_LAYERS = 9; // ∆⁹: Maximum 9 gradient layers

/**
 * Delta layer structure
 */
class DeltaLayer {
  constructor(name, weight = 1.0) {
    this.name = name;
    this.weight = weight;
    this.value = 0;
    this.velocity = 0;
    this.acceleration = 0;
    this.history = [];
    this.timestamp = Date.now();
  }
}

/**
 * 9-Layer Gradient Stack
 * ∆: Each layer applies gradient descent optimization
 * ∆⁹: Layers capped at 9 for stability
 */
class DeltaEngine {
  constructor() {
    this.layers = [];
    this.gradientHistory = [];
    this.learningRate = 0.01;
    this.momentum = 0.9;
  }

  /**
   * Add a gradient layer
   * @param {string} name - Layer identifier
   * @param {number} weight - Initial weight
   * @returns {number} Layer index
   */
  addLayer(name, weight = 1.0) {
    if (this.layers.length >= DELTA_LAYERS) {
      console.log('[∆⁹] Layer cap reached (9), replacing oldest');
      this.layers.shift();
    }
    const layer = new DeltaLayer(name, weight);
    this.layers.push(layer);
    return this.layers.length - 1;
  }

  /**
   * Amplify value (++)
   * @param {number} value - Input value
   * @param {number} factor - Amplification factor (default 1.2)
   * @returns {number} Amplified value
   */
  amplify(value, factor = 1.2) {
    // ∆⁹: Cap output at 1.0 for stability
    return Math.min(1.0, value * factor);
  }

  /**
   * Attenuate value (--)
   * @param {number} value - Input value
   * @param {number} factor - Attenuation factor (default 0.8)
   * @returns {number} Attenuated value
   */
  attenuate(value, factor = 0.8) {
    return value * factor;
  }

  /**
   * Apply gradient descent through all layers (∆)
   * @param {number} target - Target value
   * @param {number} output - Current output
   * @returns {Object} Delta result with layers applied
   */
  propagate(target, output) {
    let current = output;
    const deltas = [];

    for (let i = 0; i < this.layers.length; i++) {
      const layer = this.layers[i];
      const error = target - current;
      const gradient = error * layer.weight;

      // Store delta
      deltas.push({
        layer: layer.name,
        delta: gradient,
        layerIndex: i
      });

      // Update velocity with momentum
      layer.velocity = this.momentum * layer.velocity + gradient * this.learningRate;

      // Update value
      layer.value = current + layer.velocity;

      // Record history
      layer.history.push({
        input: current,
        output: layer.value,
        delta: gradient,
        timestamp: Date.now()
      });

      // Keep history bounded (last 100 entries per layer)
      if (layer.history.length > 100) {
        layer.history.shift();
      }

      current = layer.value;
    }

    return {
      output: current,
      deltas,
      error: target - current,
      layers: this.layers.length
    };
  }

  /**
   * Backpropagate gradient
   * @param {number} loss - Loss value
   */
  backpropagate(loss) {
    let gradient = loss;

    for (let i = this.layers.length - 1; i >= 0; i--) {
      const layer = this.layers[i];
      layer.acceleration = gradient * layer.weight;
      gradient = layer.acceleration;
    }
  }

  /**
   * Get current gradient stack state
   * @returns {Object} Stack state with all layers
   */
  getState() {
    return {
      layers: this.layers.map((l, i) => ({
        index: i,
        name: l.name,
        weight: l.weight,
        value: l.value,
        velocity: l.velocity,
        acceleration: l.acceleration,
        historyLength: l.history.length
      })),
      gradientHistory: this.gradientHistory.slice(-10),
      totalLayers: this.layers.length,
      maxLayers: DELTA_LAYERS,
      learningRate: this.learningRate,
      momentum: this.momentum
    };
  }

  /**
   * Reset all layers
   */
  reset() {
    this.layers = [];
    this.gradientHistory = [];
  }

  /**
   * Export delta configuration
   */
  export() {
    return {
      layers: this.layers.map(l => ({
        name: l.name,
        weight: l.weight,
        value: l.value
      })),
      learningRate: this.learningRate,
      momentum: this.momentum
    };
  }

  /**
   * Import delta configuration
   */
  import(config) {
    this.reset();
    this.learningRate = config.learningRate || 0.01;
    this.momentum = config.momentum || 0.9;
    for (const layer of config.layers || []) {
      this.addLayer(layer.name, layer.weight);
      const idx = this.layers.length - 1;
      this.layers[idx].value = layer.value || 0;
    }
  }
}

// Global delta engine instance
const globalDeltaEngine = new DeltaEngine();

export { DeltaEngine, DeltaLayer, DELTA_LAYERS, globalDeltaEngine };
export default DeltaEngine;
