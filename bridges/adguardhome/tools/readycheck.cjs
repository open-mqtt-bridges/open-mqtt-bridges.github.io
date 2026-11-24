const { createConnection } = require('node:net');

const port = Number(process.env.BRIDGE_READY_PORT);
if (!Number.isInteger(port) || port < 1 || port > 65535) process.exit(1);
const socket = createConnection({ host: '127.0.0.1', port });
socket.setTimeout(2000, () => socket.destroy());
socket.on('error', () => socket.destroy());
socket.once('data', (data) => {
  if (data.equals(Buffer.from('1'))) process.exitCode = 0;
  socket.destroy();
});
process.exitCode = 1;
