import { Router } from 'express';
import authenticate from '~/middleware/authenticate';
import { index, signIn, signOut, check, oauth } from './controllers';

const router = Router();

router.post('/', index.post);

router.post('/sign-in', signIn.post);
router.post('/sign-out', authenticate(), signOut.post);

router.get('/check', check.get);

router.route('/oauth')
  .all(authenticate())
  .get(oauth.get)
  .post(oauth.post);

router.get('/oauth/check', authenticate(), oauth.check.get);

export default router;
