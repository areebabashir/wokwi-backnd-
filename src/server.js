import 'dotenv/config';
import app from './app.js';
import {connectDB} from './config/db.js';
const required=['MONGODB_URI','DEVICE_TOKEN','DASHBOARD_KEY'];
const missing=required.filter(k=>!process.env[k]);
if(missing.length){console.error(`Missing environment variables: ${missing.join(', ')}`);process.exit(1)}
try{
 await connectDB();
 const port=Number(process.env.PORT||5000);
 app.listen(port,()=>console.log(`AEGIS-X API running on http://localhost:${port}`));
}catch(err){console.error('Startup failed:',err.message);process.exit(1)}
