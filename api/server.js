import express from "express"

const app = express()

// Security headers
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
  next();
});
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
