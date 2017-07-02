import { Router } from 'express'
import authenticate from '~middleware/authenticate'
import { index } from './controllers'
import User from '../users/models'
import { ServerError } from '~middleware/express-server-error'

const router = Router()

function tokenMiddleware (req, res, next) {
  User.findById(req.user.id).then((user) => {
    const { meocloudToken, meocloudSecret } = user
    if (meocloudToken && meocloudSecret) {
      req.meocloud = {token: meocloudToken, token_secret: meocloudSecret}
      next()
    } else {
      next(new ServerError('No meocloud login.', { status: 412 }))
    }
  })
}

router.route('/')
  .all(authenticate())
  .get(index.get)
  .post(tokenMiddleware, index.post)

export default router
