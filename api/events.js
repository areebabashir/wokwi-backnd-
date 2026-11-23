const {randomUUID}=require('crypto');
const {connectDB,Event}=require('../lib/db');
module.exports = async (req,res) => {
  try {
    if(req.method==='POST') {
      if(!process.env.DEVICE_TOKEN || req.headers['x-device-token']!==process.env.DEVICE_TOKEN)
        return res.status(401).json({error:'Unauthorized'});
      const {type='SOS',device='esp32-1'}=req.body||{};
      if(typeof type!=='string'||typeof device!=='string')return res.status(400).json({error:'Invalid event'});
      await connectDB();
      const event=await Event.create({id:randomUUID(),type:type.slice(0,40),device:device.slice(0,80),at:new Date()});
      return res.status(201).json(event);
    }
    if(req.method==='GET'){
      await connectDB();
      return res.status(200).json(await Event.find().sort({at:-1}).limit(100).lean());
    }
    return res.status(405).json({error:'Method not allowed'});
  }catch(e){console.error('Events API:',e.message);return res.status(503).json({error:'Database unavailable'});}
};
