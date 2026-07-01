const listeners = [];

function on(fn){
  listeners.push(fn);
}

function emitEvent(event, data = {}, source = "system"){

  console.log(`⚡ [${source}] → ${event}`);

  for(const fn of listeners){
    fn(event, data, source);
  }

}

export default {
  on,
  emitEvent
};
