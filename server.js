const express=require('express'); const cors=require('cors'); const {Redis}=require('@upstash/redis');
const app=express(); app.use(cors()); app.use(express.json());
const redis=process.env.UPSTASH_REDIS_REST_URL&&process.env.UPSTASH_REDIS_REST_TOKEN?Redis.fromEnv():null;
const key='command-center:events';
app.get('/api/health',(req,res)=>res.json({ok:true,storage:redis?'redis':'unconfigured'}));
app.post('/api/events',async(req,res)=>{
 if(!redis)return res.status(503).json({error:'Configure Upstash Redis'});
 if(process.env.DEVICE_TOKEN && req.get('x-device-token')!==process.env.DEVICE_TOKEN)return res.status(401).json({error:'Unauthorized'});
 const {type='SOS',device='esp32-1',value=null}=req.body||{};
 const event={id:crypto.randomUUID(),type:String(type).slice(0,40),device:String(device).slice(0,80),value,at:new Date().toISOString()};
 try {await redis.lpush(key,JSON.stringify(event));await redis.ltrim(key,0,199);res.status(201).json(event)}
 catch(e){console.error(e);res.status(500).json({error:'Storage failed'})}
});
app.get('/api/events',async(req,res)=>{
 if(!redis)return res.status(503).json({error:'Configure Upstash Redis'});
 try {const data=await redis.lrange(key,0,99);res.json(data.map(x=>typeof x==='string'?JSON.parse(x):x))}
 catch(e){console.error(e);res.status(500).json({error:'Storage failed'})}
});
module.exports=app;
if(require.main===module)app.listen(process.env.PORT||3001,()=>console.log('API running'));
