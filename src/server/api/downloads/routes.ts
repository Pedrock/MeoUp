import { NextFunction, Request, Response, Router } from 'express';
import authenticate from '~/middleware/authenticate';
import { index } from './controllers';
import User from '~/api/users/models';
import { ServerError } from '~/middleware/express-server-error';

const router = Router();

declare global {
  namespace Express {
    interface Request {
      meocloud: {
        token: string,
        // eslint-disable-next-line camelcase
        token_secret: string
      }
    }
  }
}

function tokenMiddleware (req: Request, res: Response, next: NextFunction) {
  User.findById(req.user['id']).then((user) => {
    const { meocloudToken, meocloudSecret } = user;
    if (meocloudToken && meocloudSecret) {
      req.meocloud = {token: meocloudToken, token_secret: meocloudSecret};
      next();
    } else {
      next(new ServerError('No meocloud login.', { status: 412 }));
    }
  });
}

router.use(authenticate());

router.get('/', index.get);
router.post('/', tokenMiddleware, index.post);
router.delete('/:id', tokenMiddleware, index.delete);

export default router;
