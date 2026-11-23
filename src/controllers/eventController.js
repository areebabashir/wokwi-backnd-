import Event from '../models/Event.js';
const types=new Set(['SOS','MOTION','INTRUSION','HIGH_PRIORITY','TEMPERATURE','HUMIDITY','WARNING','INFO']);
const severity=type=>['SOS','INTRUSION','HIGH_PRIORITY'].includes(type)?'critical':['MOTION','WARNING','TEMPERATURE','HUMIDITY'].includes(type)?'warning':'info';
export async function createEvent(req,res,next){
  try {
    const {type,message,station}=req.body||{};
    if(!types.has(type)||typeof message!=='string'||!message.trim()||message.length>500||
       (station!==undefined&&(typeof station!=='string'||station.length>80)))
      return res.status(400).json({error:'Invalid event payload'});
    const event=await Event.create({type,message:message.trim(),station:station||'STATION ALPHA',severity:severity(type)});
    res.status(201).json({ok:true,event});
  }catch(err){next(err)}
}
export async function listEvents(req,res,next){
  try {
    const limit=Math.min(Math.max(Number.parseInt(req.query.limit)||50,1),200);
    const filter={};
    if(req.query.type){if(!types.has(req.query.type))return res.status(400).json({error:'Invalid event type'});filter.type=req.query.type;}
    const events=await Event.find(filter).sort({createdAt:-1}).limit(limit).lean();
    res.json({events});
  }catch(err){next(err)}
}
