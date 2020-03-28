/* global chrome, document:false */


const SerialPort = require('browser-serialport');

// can't be global
let serialPort;

// data channel
chrome.runtime.onConnectExternal.addListener((port) => {
  console.log('socket opened');

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
    // let other end emit close when it notices port disconnect
    const resp = {};
    resp.op = 'onClose';
    port.postMessage(resp);
  });

  serialPort.on('data', (data) => {
    console.log('serialport data');
    const resp = {};
    resp.op = 'data';
    resp.data = data;
    port.postMessage(resp);
  });

  port.onMessage.addListener((msg) => {
    console.log('socket received data');

    console.log('socket received', msg);
    // check for string as well? or force buffer sends from other side...
    if (msg && msg.data) {
      const buffer = Buffer.from(msg.data);
      // console.log('writing to serial', buffer.toString('utf-8'));
      serialPort.write(buffer, (err, results) => {
        console.log(err, results);
      });
    }
  });

  port.onDisconnect.addListener(() => {
    console.log('socket disconnected');
    serialPort.close();
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
        if (err) { resp.error = err.message; }
      }));
      responder(resp);
    },
    open() {
      serialPort.open((err) => {
        console.log(msg.op, 'err:', err);
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
  };

  if (!cmds[msg.op]) {
    return responder({ error: 'Unknown op' });
  }

  cmds[msg.op]();

  return true; // required if we want to respond after the listener
});

chrome.app.runtime.onLaunched.addListener(() => {
  const a = document.createElement('a');
  a.href = 'http://127.0.0.1:8080/';
  a.target = '_blank';
  a.click();
});
