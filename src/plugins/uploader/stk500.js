import intelHex from 'intel-hex';
import Stk500 from 'stk500';

const asyncTimeout = (timeout) => new Promise((resolve) => setTimeout(() => resolve(timeout), timeout));

const normal = async (hex, board, serial, config) => {
  const stk500 = new Stk500({ quiet: config.verbose ?? false });

  const bootload = (...args) => new Promise((resolve, reject) => stk500
    .bootload(...args, (err) => (err ? reject(err) : resolve())));

  const parsedHex = intelHex.parse(Buffer.from(hex, 'base64').toString('ascii')).data;
  const opts = {
    signature: Buffer.from([0x1e, 0x95, 0x0f]),
    pageSize: 128,
    timeout: 4000,
  };
  await bootload(serial, parsedHex, opts);
};

const arduino = async (hex, board, serial, config) => {
  await serial.setSignals('off');
  await asyncTimeout(250);
  await serial.setSignals('on');
  await asyncTimeout(100);
  await normal(hex, board, serial, config);
  await serial.setSignals('off');
};

export default {
  arduino, stk500: normal, wiring: normal, avr109: normal,
};
