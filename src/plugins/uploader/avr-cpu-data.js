// referenced from the avrdude.conf
export default {
  atmega328p: {
    signature: Buffer.from([0x1e, 0x95, 0x0f]),
    pageSize: 128,
    numPages: 256,
    timeout: 400,
    protocol: 'stk500v1',
  },
  atmega168: {
    signature: Buffer.from([0x1e, 0x94, 0x06]),
    pageSize: 128,
    numPages: 128,
    timeout: 400,
    protocol: 'stk500v1',
  },
  atmega8: {
    signature: Buffer.from([0x1e, 0x93, 0x07]),
    pageSize: 64,
    numPages: 128,
    timeout: 400,
    protocol: 'stk500v1',
  },
  atmega2560: {
    signature: Buffer.from([0x1e, 0x98, 0x01]),
    pageSize: 256,
    numPages: 1024,
    delay1: 10,
    delay2: 1,
    timeout: 0xc8, // 200
    stabDelay: 0x64, // 100
    cmdexeDelay: 0x19, // 25
    synchLoops: 0x20, // 32
    byteDelay: 0x00, // 0
    pollValue: 0x53,
    pollIndex: 0x03, // 3
    protocol: 'stk500v2',
  },
  atmega1280: {
    signature: Buffer.from([0x1e, 0x97, 0x03]),
    pageSize: 256,
    numPages: 512,
    delay1: 10,
    delay2: 1,
    timeout: 0xc8, // 200
    stabDelay: 0x64, // 100
    cmdexeDelay: 0x19, // 25
    synchLoops: 0x20, // 32
    byteDelay: 0x00, // 0
    pollValue: 0x53,
    pollIndex: 0x03, // 3
    protocol: 'stk500v2',
  },
  atmega32u4: {
    signature: Buffer.from([0x43, 0x41, 0x54, 0x45, 0x52, 0x49, 0x4e]),
    protocol: 'avr109',
  },
};
