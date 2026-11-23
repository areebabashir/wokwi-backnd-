import SensorReading from '../models/SensorReading.js';
export async function createReading(req,res,next){
 try{
  const b=req.body||{};
  for(const k of ['temperature','humidity','distance']){
    if(b[k]!==undefined&&b[k]!==null&&(typeof b[k]!=='number'||!Number.isFinite(b[k])))
      return res.status(400).json({error:`Invalid ${k}`});
  }
  if(b.motion!==undefined&&typeof b.motion!=='boolean')return res.status(400).json({error:'Invalid motion'});
  if(b.station!==undefined&&(typeof b.station!=='string'||b.station.length>80))return res.status(400).json({error:'Invalid station'});
  if(b.status!==undefined&&(typeof b.status!=='string'||b.status.length>80))return res.status(400).json({error:'Invalid status'});
  const reading=await SensorReading.create({station:b.station||'STATION ALPHA',temperature:b.temperature??null,
    humidity:b.humidity??null,distance:b.distance??null,motion:b.motion??false,status:b.status||'UNKNOWN'});
  res.status(201).json({ok:true,reading});
 }catch(err){next(err)}
}
export async function listReadings(req,res,next){
 try{
  const limit=Math.min(Math.max(Number.parseInt(req.query.limit)||60,1),200);
  const readings=await SensorReading.find().sort({createdAt:-1}).limit(limit).lean();
  res.json({readings});
 }catch(err){next(err)}
}
