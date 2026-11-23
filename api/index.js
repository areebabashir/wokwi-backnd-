import 'dotenv/config';
import app from '../src/app.js';
import {connectDB} from '../src/config/db.js';
let connecting;
export default async function handler(req,res){
 try{
  if(!process.env.DEVICE_TOKEN||!process.env.DASHBOARD_KEY||!process.env.MONGO_URI)
   return res.status(503).json({error:'Backend environment not configured'});
  if(!connecting)connecting=connectDB().catch(e=>{connecting=null;throw e});
  await connecting;
  return app(req,res);
 }catch(e){console.error(e);return res.status(503).json({error:'Database unavailable'})}
}
