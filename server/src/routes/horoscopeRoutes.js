import { Router } from 'express';
import { horoscopeSchema } from '../validation/schemas.js';
import { generateHoroscope } from '../services/horoscopeService.js';

const router=Router();
router.post('/daily',async(req,res)=>{
  res.set('Cache-Control','no-store');
  const parsed=horoscopeSchema.safeParse(req.body);
  if(!parsed.success) return res.status(400).json({error:'Invalid horoscope request',issues:parsed.error.issues});
  res.json(await generateHoroscope(parsed.data));
});
export default router;
