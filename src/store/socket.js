
import io from 'socket.io-client';

const socket = io('http://localhost:3030');

socket.emitAsync = (action, payload) => new Promise((resolve) => {
  if (payload) socket.emit(action, payload, resolve);
  else socket.emit(action, resolve);
});

console.log('connecting to remote...');

socket.on('connect', () => console.log('connected to remote server!'));

socket.on('pong', latency => console.log(`latency: ${latency}ms`));

export default socket;
