import io from 'socket.io-client';
const socket = io(`http://${process.env.HOST}:${process.env.PORT}/`);

export default socket;
