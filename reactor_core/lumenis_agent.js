import reactor from "./reactor.js";

export function startLumenisAgent(){

  reactor.on("intent", (event, data, source)=>{

    if(event !== "intent") return;

    const { input, intent } = data;

    if(intent === "execute"){
      reactor.emitEvent("lumenis_run_request", {
        prompt: input
      }, "lumenis_agent");
    }

    if(intent === "status"){
      reactor.emitEvent("lumenis_run_request", {
        prompt: "status"
      }, "lumenis_agent");
    }

  });

  console.log("✨ Lumenis Agent ACTIVE");
}
