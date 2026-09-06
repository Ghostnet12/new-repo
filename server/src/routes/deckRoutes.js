import { Router } from 'express';import { cards, spreads } from '../tarot/deck.js';
const router=Router();router.get('/',(_req,res)=>res.json({cards,spreads}));export default router;
