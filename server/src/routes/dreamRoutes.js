import { Router } from 'express';
import { dreamJournal, dreamResult, reflectOnDream } from '../services/dreamService.js';

const router = Router();
router.use((_req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });
const send = action => async (req, res) => {
  const result = await dreamResult(() => action(req));
  res.status(result.status).json(result.body);
};
router.get('/', send(req => dreamJournal.list(req.clientHash, req.query.page)));
router.post('/reflect', send(req => reflectOnDream(req.body, { clientId: req.clientHash })));
router.post('/', send(req => dreamJournal.save(req.clientHash, req.body)));
router.delete('/:id', send(req => dreamJournal.remove(req.clientHash, req.params.id)));
export default router;
