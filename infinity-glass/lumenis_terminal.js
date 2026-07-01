else if(command === "repair system"){

addLine("Lumenis initiating system repair...","neon-amber")

fetch("/api/reactor",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
event:"repair",
data:{target:"server"}
})
})

.then(r=>r.json())
.then(d=>{
addLine("Repair task dispatched to reactor","neon-cyan")
})
.catch(()=>{
addLine("Repair dispatch failed")
})

}
