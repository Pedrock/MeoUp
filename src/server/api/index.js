// @flow
import { Router } from 'express';
import usersRoutes from './users/routes';
import adminRoutes from './admin/routes';
import downloadsRoutes from './downloads/routes';
import listEndpoints from 'express-list-endpoints';
import authenticate from '~middleware/authenticate';
import { handleServerErrors } from '~middleware/express-server-error';

const router = Router();

router.use('/', handleServerErrors);
router.use('/users', usersRoutes);
router.use('/downloads', downloadsRoutes);
router.use('/admin', authenticate(), adminRoutes);

router.get('/', (req: $Request, res: $Response) => {
  res.json(listEndpoints(router));
});

export default router;
