import * as express from 'express';
import auth from './auth';
import social from './social';

const router: express.Router = express.Router();

router.use('/auth', auth);
router.use('/social', social);




export default router;
