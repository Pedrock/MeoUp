import * as http from 'http';
import { urlencoded, json } from 'body-parser';
import cookieParser from 'cookie-parser';
import * as express from 'express';
import {Request, Response, NextFunction} from 'express';
import * as mongoose from 'mongoose';
//@ts-ignore
import { Nuxt, Builder } from 'nuxt';
import socketioJwt from 'socketio-jwt';
import * as socketio from 'socket.io';

import config from '../../nuxt.config';
import apiRoutes from './api';

const { HOST, PORT, DB_URL } = process.env;
if (!HOST || !PORT) {
  throw new Error('process.env.HOST or process.env.PORT not set');
}
if (!DB_URL) {
  throw new Error('process.env.DB_URL not set');
}

process.on('unhandledRejection', (reason, p) => {
  console.error('Unhandled Rejection at: Promise', p);
});

const app = express();

const server = new http.Server(app);
const io = socketio(server);

// Global middleware
// only allow http://127.0.0.1:3000 and http://localhost:3000
// only allow process.env.API_URL, process.env.SERVER_API_URL, and process.env.PAGE_URL
// app.use(cors({
//   origin: process.env.NOW_URL // fix this.
// }))
app.use(urlencoded({ extended: false }));
app.use(json());
app.use(cookieParser());

declare global {
  namespace Express {
    interface Request {
      io: SocketIO.Server
    }
  }
}

app.use((req: Request, res: Response, next: NextFunction) => {
  req.io = io;
  next();
});

// Import API Routes
app.use('/api', apiRoutes);

// Receive websocket connections
io.on('connection', socketioJwt.authorize({
  secret: process.env.SECRET,
  timeout: 15000
})).on('authenticated', function (socket) {
  socket.join(`/users/${socket.decoded_token.id}`);
  console.log('joined', `/users/${socket.decoded_token.id}`);
});

// https://github.com/nuxt/express/tree/master/template
// Import and Set Nuxt.js options
config.dev = !(process.env.NODE_ENV === 'production');
// Instantiate nuxt.js
const nuxt = new Nuxt(config);
// Build only in dev mode
if (config.dev) {
  const builder = new Builder(nuxt);
  builder.build();
}
// Add nuxt.js middleware
app.use(nuxt.render);

// Listen to the server
server.listen(PORT, <any>HOST);
console.log(`Server listening on http://${HOST}:${PORT}`);

// setup the database connection
(<any>mongoose).Promise = global.Promise;
mongoose.connect(process.env.DB_URL, { useMongoClient: true });

export default app;
