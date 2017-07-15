import { urlencoded, json } from 'body-parser';
import cookieParser from 'cookie-parser';
// import cors from 'cors'
import express from 'express';
import mongoose from 'mongoose';
import Nuxt from 'nuxt';
import http from 'http';
import socketioJwt from 'socketio-jwt';
import socketio from 'socket.io';

import config from '../../nuxt.config';
import apiRoutes from './api';

const app = express();

const server = http.Server(app);
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

app.use((req, res, next) => {
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
// Start nuxt.js
async function start () {
  // Import and Set Nuxt.js options
  config.dev = !(process.env.NODE_ENV === 'production');
  // Instantiate nuxt.js
  const nuxt = new Nuxt(config);
  // Add nuxt.js middleware
  app.use(nuxt.render);

  // Listen to the server
  server.listen(process.env.PORT, process.env.HOST);
  console.log(`Server listening on http://${process.env.HOST}:${process.env.PORT}`); // eslint-disable-line no-console
}

// setup the database connection
mongoose.Promise = global.Promise;
mongoose.connect(process.env.DB_URL);

start();

export default app;
