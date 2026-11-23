export function notFound(req,res){res.status(404).json({error:'Route not found'});}
export function errorHandler(err,req,res,next){
  console.error(err);
  if (err.type==='entity.too.large') return res.status(413).json({error:'Payload too large'});
  if (err instanceof SyntaxError && 'body' in err) return res.status(400).json({error:'Invalid JSON'});
  if (err.name==='ValidationError') return res.status(400).json({error:'Validation failed'});
  res.status(500).json({error:'Internal server error'});
}
