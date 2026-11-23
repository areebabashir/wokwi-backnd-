import {timingSafeEqual} from 'node:crypto';
function matches(actual, expected) {
  if (!actual || !expected) return false;
  const a=Buffer.from(actual), b=Buffer.from(expected);
  return a.length===b.length && timingSafeEqual(a,b);
}
export function deviceAuth(req,res,next) {
  if (!matches(req.get('x-device-token'),process.env.DEVICE_TOKEN)) return res.status(401).json({error:'Unauthorized device'});
  next();
}
export function dashboardAuth(req,res,next) {
  if (!matches(req.get('x-dashboard-key'),process.env.DASHBOARD_KEY)) return res.status(401).json({error:'Unauthorized dashboard'});
  next();
}
