const mongoose = require('mongoose');
const eventSchema = new mongoose.Schema({
  id: {type:String,required:true,unique:true},
  type: {type:String,required:true},
  device: {type:String,required:true},
  at: {type:Date,default:Date.now}
},{versionKey:false});
const Event = mongoose.models.Event || mongoose.model('Event',eventSchema);
let pending;
async function connectDB(){
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI missing');
  if (mongoose.connection.readyState === 1) return;
  if (!pending) pending = mongoose.connect(process.env.MONGODB_URI,{serverSelectionTimeoutMS:8000,maxPoolSize:5}).catch(e=>{pending=null;throw e});
  await pending;
}
module.exports={connectDB,Event};
