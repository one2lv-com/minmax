import express from "express"

const app = express()
const PORT = 8080

app.use(express.json())

app.get("/api/status",(req,res)=>{
 res.json({
  system:"One2lvOS",
  node:"Lumenis",
  status:"online",
  time:Date.now()
 })
})

app.post("/api/sensors",(req,res)=>{
 console.log("Sensor input:",req.body)
 res.json({ok:true})
})

app.listen(PORT,()=>{
 console.log("One2lvOS API running on port",PORT)
})
