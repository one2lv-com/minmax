// ∆ Implementation: 9-layer gradient stack
const layers = [];
const MAX = 9; // ∆⁹

const amplify = (v) => Math.min(1.0, v * 1.2); // ++
const attenuate = (v) => v * 0.8;             // --

function pushTransform(state){
    layers.unshift({...state, t: Date.now()});
    if(layers.length > MAX) layers.pop();
    return { depth: layers.length, symbol: "∆⁹" };
}
module.exports = { pushTransform, amplify, attenuate };
