import Event from '../models/Event.js';
import SensorReading from '../models/SensorReading.js';
export async function getDashboard(req,res,next){
 try{
  const [events,readings,eventCount,criticalCount]=await Promise.all([
   Event.find().sort({createdAt:-1}).limit(50).lean(),
   SensorReading.find().sort({createdAt:-1}).limit(60).lean(),
   Event.countDocuments(),Event.countDocuments({severity:'critical'})
  ]);
  res.json({events,readings,latest:readings[0]||null,eventCount,criticalCount});
 }catch(err){next(err)}
}
