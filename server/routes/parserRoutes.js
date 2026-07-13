import { Router } from 'express';
import { generate, parse } from '../controllers/parserController.js';

const router = Router();

router.post('/generate', generate);
router.post('/parse', parse);

export default router;
