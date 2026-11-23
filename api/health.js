const {connectDB} = require('../lib/db');
module.exports = async (req,res) => {
  if (req.method !== 'GET') return res.status(405).json({error:'Method not allowed'});
  try { await connectDB(); return res.status(200).json({ok:true,storage:'mongodb',database:'connected'}); }
  catch(e) { console.error('MongoDB connection:',e.message); return res.status(503).json({ok:false,storage:'mongodb',database:'unavailable',hint:'Check MONGODB_URI and Atlas Network Access'}); }
};
