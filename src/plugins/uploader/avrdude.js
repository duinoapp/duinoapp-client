/* eslint-disable no-param-reassign */
/* eslint-disable no-unused-vars */
/* eslint-disable camelcase */

const asyncTimeout = timeout => new Promise(resolve => setTimeout(() => resolve(timeout), timeout));
let readBuffer = Buffer.from([]);

/* Helpers */

/* pads an 16 bit number */
const hexpad16 = (num, size = 4) => {
  const s = `0000${num}`;
  return s.substr(s.length - size);
};

const d2b = number => String.fromCharCode(number);

/* convert the ASCII hex into binary */
const fixHex = (hex) => {
  let hexfile = '';
  const buffer = Buffer.from(hex, 'base64').toString('ascii').split('\n');
  for (let x = 0; x < buffer.length; x += 1) {
    const size = parseInt(buffer[x].substr(1, 2), 16);
    if (size === 0) {
      break;
    }
    for (let y = 0; y < (size * 2); y += 2) {
      // console.log(buffer[x].substr(y+9,2));
      hexfile += String.fromCharCode(parseInt(buffer[x].substr(y + 9, 2), 16));
    }
  }
  return hexfile;
};

/* STK500 commands */

const command = {

  Sync_CRC_EOP: 0x20,
  GET_SYNC: 0x30,
  GET_SIGN_ON: 0x31,
  SET_PARAMETER: 0x40,
  GET_PARAMETER: 0x41,
  SET_DEVICE: 0x42,
  SET_DEVICE_EXT: 0x45,
  ENTER_PROGMODE: 0x50,
  LEAVE_PROGMODE: 0x51,
  CHIP_ERASE: 0x52,
  CHECK_AUTOINC: 0x53,
  LOAD_ADDRESS: 0x55,
  UNIVERSAL: 0x56,
  UNIVERSAL_MULTI: 0x57,
  PROG_FLASH: 0x60,
  PROG_DATA: 0x61,
  PROG_FUSE: 0x62,
  PROG_LOCK: 0x63,
  PROG_PAGE: 0x64,
  PROG_FUSE_EXT: 0x65,
  READ_FLASH: 0x70,
  READ_DATA: 0x71,
  READ_FUSE: 0x72,
  READ_LOCK: 0x73,
  READ_PAGE: 0x74,
  READ_SIGN: 0x75,
  READ_OSCCAL: 0x76,
  READ_FUSE_EXT: 0x77,
  READ_OSCCAL_EXT: 0x78,
};

// eslint-disable-next-line no-unused-vars
const parameters = {
  HW_VER: 0x80,
  SW_MAJOR: 0x81,
  SW_MINOR: 0x82,
  LEDS: 0x83,
  VTARGET: 0x84,
  VADJUST: 0x85,
  OSC_PSCALE: 0x86,
  OSC_CMATCH: 0x87,
  RESET_DURATION: 0x88,
  SCK_DURATION: 0x89,
  BUFSIZEL: 0x90,
  BUFSIZEH: 0x91,
  DEVICE: 0x92,
  PROGMODE: 0x93,
  PARAMODE: 0x94,
  POLLING: 0x95,
  SELFTIMED: 0x96,
  TOPCARD_DETECT: 0x98,
};

// eslint-disable-next-line no-unused-vars
const responses = {
  OK: 0x10,
  FAILED: 0x11,
  UNKNOWN: 0x12,
  NODEVICE: 0x13,
  INSYNC: 0x14,
  NOSYNC: 0x15,
};

const transmitPacket = async (buffer, serial, delay) => {
  await asyncTimeout(delay);
  await serial.writeBuff(Buffer.from(buffer, 'ascii'));
};

const stk500_send = (serial, buf, len) => serial.writeBuff(Buffer.from(buf));

const stk500_recv = async (serial, resp, len, count = 0) => {
  if (count > 1000) {
    throw new Error('stk500_recv(): programmer is not responding');
  }
  if (readBuffer.length < len) {
    await asyncTimeout(1);
    return stk500_recv(serial, resp, len, count + 1);
  }
  for (let i = readBuffer.length - len; i < readBuffer.length; i+= 1) {
    resp[i] = readBuffer[i];
  }
  readBuffer = Buffer.from([]);
};

const stk500_drain = (serial, display) => serial.drain();

const stk500_getsync = async (serial) => {
  const buf = [];
  const resp = [];

  /*
   * get in sync */
  buf[0] = command.GET_SYNC;
  buf[1] = command.Sync_CRC_EOP;

  /*
   * First send and drain a few times to get rid of line noise 
   */

  stk500_send(serial, buf, 2);
  stk500_drain(serial, 0);
  stk500_send(serial, buf, 2);
  stk500_drain(serial, 0);

  readBuffer = Buffer.from([]);
  stk500_send(serial, buf, 2);
  stk500_recv(serial, resp, 2);
  if (resp[0] !== responses.INSYNC) {
    stk500_drain(serial, 0);
    throw new Error(`stk500_getsync(): not in sync: resp=${resp[0].toString(16)}`);
  }

  if (resp[1] !== responses.OK) {
    throw new Error(`stk500_getsync(): can't communicate with device: resp=${resp[0].toString(16)}`);
  }
};

/* to program a page, we need to load in the address of flash memory.
 This address is independent of the bootloader space
 the next step is to then provide up to 128 bytes of data over serial.
 There is a 0x00 and 0x46 that appears in the command.
 I have no idea what this does, but AVRDude uses this */

// eslint-disable-next-line camelcase
const stk500_prgpage = async (address, data, delay, board, serial) => {
  const addressPadded = hexpad16(address.toString(16)); /* convert and pad number to hex */
  const addressLSB = addressPadded[2] + addressPadded[3]
    + addressPadded[0] + addressPadded[1]; /* make LSB first */
  const addressH2B = String.fromCharCode(parseInt(addressLSB[0] + addressLSB[1], 16))
    + String.fromCharCode(parseInt(addressLSB[2] + addressLSB[3], 16)); /* h2b */
  await transmitPacket(
    d2b(command.LOAD_ADDRESS) + addressH2B + d2b(command.Sync_CRC_EOP), serial, delay,
  );
  const datalen = data.length;
  await transmitPacket(
    d2b(command.PROG_PAGE) + d2b(0x00)
      + d2b(datalen) + d2b(0x46) + data + d2b(command.Sync_CRC_EOP),
    serial,
    delay,
  );
};

// eslint-disable-next-line camelcase
const stk500_upload = async (heximage, board, serial, prog) => {
  let flashblock = 0;
  await transmitPacket(
    d2b(command.ENTER_PROGMODE) + d2b(command.Sync_CRC_EOP), serial, 50,
  );
  const blocksize = 128;
  const queue = [];
  for (let b = 0; b < Math.ceil(heximage.length / blocksize); b += 1) {
    const currentbyte = blocksize * b;
    const block = heximage.substr(currentbyte, blocksize);
    queue.push({ flashblock, block, delay: 250 });
    flashblock += 64;
  }
  await queue.reduce(async (a, q, i) => {
    await a;
    await stk500_prgpage(q.flashblock, q.block, q.delay, board, serial);
    prog((i + 1) / queue.length);
  }, Promise.resolve());
};

const dataEventListener = (buf) => readBuffer.concat(buf);

const arduino = async (hex, board, serial, prog = () => {}) => {
  serial.on('data', dataEventListener);
  await serial.setSignals('off');
  await asyncTimeout(50);
  await serial.setSignals('on');
  await asyncTimeout(50);
  await stk500_drain(serial);
  await stk500_getsync(serial);
  await stk500_upload(fixHex(hex), board, serial, prog);
  await serial.setSignals('off');
  serial.on('data', dataEventListener);
};

export default { arduino, avr109: arduino };
