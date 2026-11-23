import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  type:{type:String,required:true,enum:['SOS','MOTION','INTRUSION','HIGH_PRIORITY','TEMPERATURE','HUMIDITY','WARNING','INFO']},
  message:{type:String,required:true,maxlength:500},
  station:{type:String,default:'STATION ALPHA',maxlength:80},
  severity:{type:String,enum:['info','warning','critical'],default:'info'}
},{timestamps:true});
schema.index({createdAt:-1});
export default mongoose.model('Event',schema);
