// ³ Implementation: 3D Vector force amplification
const { send } = require("../council");
let state = { vectors: [], delta: { last:0, velocity:0 } };

function ingest(packet){
    const force = packet.force || 0.5;
    const theta = packet.theta || 0;
    const phi = packet.phi || 0;
    const v = {
        x: force * Math.cos(theta) * Math.sin(phi),
        y: force * Math.sin(theta) * Math.sin(phi),
        z: force * Math.cos(phi),
        magnitude: force
    };
    state.vectors.push(v);
    if(state.vectors.length > 10) state.vectors.shift();
    return state;
}
module.exports = { ingest };
