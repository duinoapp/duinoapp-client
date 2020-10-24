import intelHex from 'intel-hex';
import Stk500 from 'stk500';

const stk500 = new Stk500({ quiet: false });
const asyncTimeout = (timeout) => new Promise((resolve) => setTimeout(() => resolve(timeout), timeout));

const bootload = (serialPort, hex, opts) => new Promise((reject, resolve) => stk500.bootload(
  serialPort,
  hex,
  opts,
  (err) => (err ? reject(err) : resolve()),
));

const arduino = async (hex, board, serial) => {
  const parsedHex = intelHex.parse(Buffer.from(hex, 'base64').toString('ascii')).data;
  const opts = {
    signature: Buffer.from([0x1e, 0x95, 0x0f]),
    pageSize: 128,
    timeout: 4000,
  };
  console.log(stk500);
  const dataLog = (buf) => console.log('data', buf.toString('hex'));
  serial.on('data', dataLog);
  await serial.setSignals('off');
  await asyncTimeout(100);
  await serial.setSignals('on');
  await asyncTimeout(100);
  await bootload(serial._port, parsedHex, opts);
  await serial.setSignals('off');
  serial.off('data', dataLog);
};

export default { arduino, avr109: arduino };
