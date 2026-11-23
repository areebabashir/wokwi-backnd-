import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  station:{type:String,default:'STATION ALPHA',maxlength:80},
  temperature:{type:Number,default:null},humidity:{type:Number,default:null},
  distance:{type:Number,default:null},motion:{type:Boolean,default:false},
  status:{type:String,default:'UNKNOWN',maxlength:80}
},{timestamps:true});
schema.index({createdAt:-1});
export default mongoose.model('SensorReading',schema);
