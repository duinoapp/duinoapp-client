/* global chrome, document:false */


const SerialPort = require('browser-serialport');

// can't be global
let serialPort;
let dataFunc = () => {};

// data channel
chrome.runtime.onConnectExternal.addListener((port) => {
  console.log('socket opened');

  dataFunc = (data) => {
    console.log('serialport data', data);
    const resp = {};
    resp.op = 'data';
    resp.data = data;
    port.postMessage(resp);
  };

  serialPort.on('disconnect', (err) => {
    console.log('serialport disconnected', err);
    const resp = {};
    resp.op = 'onDisconnect';
    port.postMessage(resp);
  });

  // collapse into .error field?
  serialPort.on('error', (err) => {
    console.log('serialport errored', err);
    const resp = {};
    resp.op = 'onError';
    port.postMessage(resp);
  });

  serialPort.on('close', () => {
    console.log('serialport closed');
    serialPort.closed = true;
    // let other end emit close when it notices port disconnect
    const resp = {};
    resp.op = 'onClose';
    port.postMessage(resp);
  });

  port.onMessage.addListener((msg) => {
    console.log('socket received data');

    console.log('socket received', Buffer.from(msg.data, 'base64').toString('hex'));
    // check for string as well? or force buffer sends from other side...
    if (msg && msg.data) {
      const buffer = Buffer.from(msg.data, 'base64');
      // console.log('writing to serial', buffer.toString('utf-8'));
      serialPort.write(buffer, (err, results) => {
        console.log(err, results);
      });
    }
  });

  port.onDisconnect.addListener(() => {
    console.log('socket disconnected');
    if (!serialPort.closed) serialPort.close();
  });
});

// command channel
chrome.runtime.onMessageExternal.addListener((msg, sender, responder) => {
  console.log(msg);

  const cmds = {
    getManifest() {
      const resp = {};
      resp.data = chrome.runtime.getManifest();
      responder(resp);
    },
    list() {
      SerialPort.list((err, data) => {
        console.log(msg.op, 'err:', err, data);
        const resp = {};
        if (err) { resp.error = err.message; }
        if (data) { resp.data = data; }
        responder(resp);
      });
    },
    construct() {
      console.log('construct');
      const resp = {};
      serialPort = new SerialPort.SerialPort(msg.path, msg.options, false, ((err) => {
        console.log(msg.op, 'err:', err);
        serialPort.options.serial.onReceiveError.addListener(console.error);
        if (err) { resp.error = err.message; }
      }));
      responder(resp);
    },
    open() {
      serialPort.open((err) => {
        console.log(msg.op, 'err:', err);
        serialPort.on('data', data => dataFunc(data));
        const resp = {};
        if (err) { resp.error = err.message; }
        responder(resp);
      });
    },
    close() {
      serialPort.close((err) => {
        console.log(msg.op, 'err:', err);
        const resp = {};
        if (err) { resp.error = err.message; }
        responder(resp);
      });
    },
    drain() {
      serialPort.drain((err, data) => {
        console.log(msg.op, 'err:', err, data);
        const resp = {};
        if (err) { resp.error = err.message; }
        if (data) { resp.data = data; }
        responder(resp);
      });
    },
    flush() {
      serialPort.flush((err, data) => {
        console.log(msg.op, 'err:', err, data);
        const resp = {};
        if (err) { resp.error = err.message; }
        if (data) { resp.data = data; }
        responder(resp);
      });
    },
    set() {
      serialPort.set(msg.signals, (err, data) => {
        console.log(msg.op, 'err:', err, data);
        const resp = {};
        if (err) { resp.error = err.message; }
        if (data) { resp.data = data; }
        responder(resp);
      });
    },
  };

  if (!cmds[msg.op]) {
    return responder({ error: 'Unknown op' });
  }

  cmds[msg.op]();

  return true; // required if we want to respond after the listener
});

const openDuinoApp = () => {
  const a = document.createElement('a');
  a.href = 'https://duino.app/';
  a.target = '_blank';
  a.click();
};

chrome.app.runtime.onLaunched.addListener(openDuinoApp);

chrome.browserAction.onClicked.addListener(openDuinoApp);
