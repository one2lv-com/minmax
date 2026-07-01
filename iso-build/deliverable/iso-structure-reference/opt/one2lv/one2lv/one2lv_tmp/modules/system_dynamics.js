/**
 * One2lvOS Phase 9 - System Dynamics
 * 3D Vector Mathematics with θ/φ spherical coordinates
 * Symbol: ³ (vertical dimension)
 */

const CONFIG = {
  GRAVITY: 9.81,
  FRICTION: 0.98,
  DEFAULT_MAGNITUDE: 1.0
};

/**
 * Create a 3D vector with spherical coordinates
 * ³ = vertical dimension (z-axis)
 * @param {number} theta - Azimuthal angle (radians, 0-2π)
 * @param {number} phi - Polar angle (radians, 0-π)
 * @param {number} force - Magnitude/radius
 * @returns {Object} 3D vector with x, y, z, magnitude, theta, phi
 */
function createVector3D(theta, phi, force = CONFIG.DEFAULT_MAGNITUDE) {
  const x = force * Math.cos(theta) * Math.sin(phi);  // horizontal-east
  const y = force * Math.sin(theta) * Math.sin(phi);  // horizontal-north
  const z = force * Math.cos(phi);                    // ³ vertical

  return {
    x: parseFloat(x.toFixed(6)),
    y: parseFloat(y.toFixed(6)),
    z: parseFloat(z.toFixed(6)),      // ³: vertical dimension
    magnitude: force,
    theta,                            // azimuthal angle
    phi,                              // polar angle
    timestamp: Date.now()
  };
}

/**
 * Vector addition
 */
function addVectors(v1, v2) {
  return createVector3D(
    Math.atan2(v1.y + v2.y, v1.x + v2.x),
    Math.atan2(Math.sqrt((v1.x+v2.x)**2 + (v1.y+v2.y)**2), v1.z + v2.z),
    Math.sqrt((v1.x+v2.x)**2 + (v1.y+v2.y)**2 + (v1.z+v2.z)**2)
  );
}

/**
 * Vector subtraction
 */
function subtractVectors(v1, v2) {
  return createVector3D(
    Math.atan2(v1.y - v2.y, v1.x - v2.x),
    Math.atan2(Math.sqrt((v1.x-v2.x)**2 + (v1.y-v2.y)**2), v1.z - v2.z),
    Math.sqrt((v1.x-v2.x)**2 + (v1.y-v2.y)**2 + (v1.z-v2.z)**2)
  );
}

/**
 * Scalar multiplication
 */
function scaleVector(v, scalar) {
  return createVector3D(v.theta, v.phi, v.magnitude * scalar);
}

/**
 * Dot product
 */
function dotProduct(v1, v2) {
  return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
}

/**
 * Cross product
 */
function crossProduct(v1, v2) {
  const x = v1.y * v2.z - v1.z * v2.y;
  const y = v1.z * v2.x - v1.x * v2.z;
  const z = v1.x * v2.y - v1.y * v2.x;
  const mag = Math.sqrt(x*x + y*y + z*z);
  return createVector3D(
    Math.atan2(y, x),
    Math.atan2(Math.sqrt(x*x + y*y), z),
    mag
  );
}

/**
 * Vector magnitude
 */
function magnitude(v) {
  return Math.sqrt(v.x**2 + v.y**2 + v.z**2);
}

/**
 * Normalize vector
 */
function normalize(v) {
  const mag = magnitude(v);
  if (mag === 0) return createVector3D(0, 0, 0);
  return {
    x: v.x / mag,
    y: v.y / mag,
    z: v.z / mag,
    magnitude: 1,
    theta: v.theta,
    phi: v.phi,
    timestamp: v.timestamp
  };
}

/**
 * Linear interpolation
 */
function lerp(v1, v2, t) {
  return {
    x: v1.x + (v2.x - v1.x) * t,
    y: v1.y + (v2.y - v1.y) * t,
    z: v1.z + (v2.z - v1.z) * t,
    magnitude: v1.magnitude + (v2.magnitude - v1.magnitude) * t,
    theta: v1.theta,
    phi: v1.phi,
    timestamp: Date.now()
  };
}

/**
 * Apply physics (gravity, friction)
 */
function applyPhysics(v, dt = 0.016) {
  let newZ = v.z - CONFIG.GRAVITY * dt;
  let newMag = v.magnitude * CONFIG.FRICTION;
  return createVector3D(v.theta, v.phi, Math.max(0, newMag));
}

/**
 * Convert to array [x, y, z]
 */
function toArray(v) {
  return [v.x, v.y, v.z];
}

/**
 * Convert to spherical from cartesian
 */
function toSpherical(x, y, z) {
  const r = Math.sqrt(x*x + y*y + z*z);
  const theta = Math.atan2(y, x);
  const phi = Math.atan2(Math.sqrt(x*x + y*y), z);
  return { theta, phi, magnitude: r };
}

export {
  createVector3D,
  addVectors,
  subtractVectors,
  scaleVector,
  dotProduct,
  crossProduct,
  magnitude,
  normalize,
  lerp,
  applyPhysics,
  toArray,
  toSpherical,
  CONFIG
};

export default {
  createVector3D,
  addVectors,
  subtractVectors,
  scaleVector,
  dotProduct,
  crossProduct,
  magnitude,
  normalize,
  lerp,
  applyPhysics,
  toArray,
  toSpherical,
  CONFIG
};
