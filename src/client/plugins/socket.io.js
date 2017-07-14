import io from 'socket.io-client';

export const socket = io(`http://${process.env.HOST}:${process.env.PORT}/`, {
  autoConnect: false
});

export default ({ store }) => {

  if (store.state.user.isAuthenticated) {
    socket.open();
  }

  store.watch(
    function (state) {
      return state.user.isAuthenticated;
    },
    function (isAuthenticated) {
      if (isAuthenticated) {
        socket.open();
      } else {
        socket.close();
      }
    }
  );

  socket.on('connect', () => {
    console.log('connected');
    if (store.state.user.isAuthenticated) {
      authenticate(store.state.user.token);
    }
  })
  .on('authenticated', () => {
    console.log('authenticated');
  })
  .on('unauthorized', (msg) => {
    console.log('unauthorized: ' + JSON.stringify(msg.data));
    throw new Error(msg.data.type);
  });
  return socket;
};

export const authenticate = (token) => socket.emit('authenticate', { token });
