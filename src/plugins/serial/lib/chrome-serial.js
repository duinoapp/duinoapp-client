/* eslint-disable no-param-reassign */
/* global chrome:false */
import has from 'lodash/has';
import { EventEmitter } from 'events';

let extensionId;
export const setExtensionId = (id) => {
  extensionId = id;
};
// const SerialPortFactory = {};

export class SerialPort extends EventEmitter {
  constructor(path, options, openImmediately = true, callback) {
    super();

    const self = this;
    self.port = {};

    // eslint-disable-next-line prefer-rest-params
    const args = Array.prototype.slice.call(arguments);
    callback = args.pop();
    if (typeof (callback) !== 'function') {
      callback = null;
    }

    this.options = ((typeof options !== 'function') && options) || {};

    callback = callback || ((err) => {
      if (err) {
        if (self._events.error) {
          self.emit('error', err);
        } else {
          // factory doesnt exist atm
          // factory.emit('error', err);
        }
      }
    });

    chrome.runtime.sendMessage(extensionId, { op: 'construct', path, options: this.options },
      (response) => {
        if (chrome.runtime.lastError) {
          callback(chrome.runtime.lastError);
          return;
        }

        if (response && response.error) {
          callback(new Error(response.error));
          return;
        }

        if (openImmediately) {
          process.nextTick(() => {
            self.open(callback);
          });
        }
      });
  }

  // always open immediately
  open(callback) {
    if (!callback) { callback = () => {}; }

    const self = this;

    chrome.runtime.sendMessage(extensionId, { op: 'open' },
      (response) => {
        if (chrome.runtime.lastError) {
          return callback(chrome.runtime.lastError);
        }

        if (response && response.error) {
          return callback(new Error(response.error));
        }

        self.port = chrome.runtime.connect(extensionId);
        if (chrome.runtime.lastError) {
          // any other cleanup?
          return callback(chrome.runtime.lastError);
        }

        self.port.onDisconnect.addListener(() => {
          self.port = null;
        });

        const handleMessage = (msg) => {
          // console.log(msg, 'received');

          const cmds = {
            onDisconnect() {
              self.port.disconnect();
              // no way to know chrome port is disconnected?
              // can't just next tick so null here instead of waiting for ondisconnect
              self.port = null;
              self.emit('disconnect', msg.error);
            },
            onError() {
              self.emit('error', msg.error);
            },
            onClose() {
              self.port.disconnect();
              // no way to know chrome port is disconnected?
              // can't just next tick so null here instead of waiting for ondisconnect
              self.port = null;
              self.emit('close');
            },
            onOpen() {
              self.emit('open');
            },
            data() {
              if (has(msg, 'data.data')) {
                self.emit('data', Buffer.from(msg.data.data));
              }
            },
          };

          if (!has(cmds, msg.op)) {
            // eslint-disable-next-line no-console
            console.log('unknown op');
          }

          cmds[msg.op]();
        };

        self.port.onMessage.addListener(handleMessage);
        return callback();
      });
  }

  write(data, callback) {
    if (!callback) { callback = () => {}; }

    // check if port is open somehow or chrome will just die
    if (!this.port) { return callback(new Error('Serialport not open')); }

    // node-serialport accepts strings or buffers
    // force a buffer so we know what we're dealing with on the other side
    // todo check for buffer and or error on other unknown types?
    if (typeof data === 'string') {
      this.port.postMessage(Buffer.from(data));
    } else {
      this.port.postMessage(data);
    }

    return callback(chrome.runtime.lastError);
  }

  // eslint-disable-next-line class-methods-use-this
  flush(callback) {
    if (!callback) { callback = () => {}; }

    chrome.runtime.sendMessage(extensionId, { op: 'flush' },
      (response) => {
        if (chrome.runtime.lastError) {
          return callback(chrome.runtime.lastError);
        }

        if (response && response.error) {
          return callback(new Error(response.error));
        }

        return callback(null, response.data);
      });
  }

  // eslint-disable-next-line class-methods-use-this
  set(signals, callback) {
    if (!callback) { callback = () => {}; }

    chrome.runtime.sendMessage(extensionId, { op: 'set', signals },
      (response) => {
        if (chrome.runtime.lastError) {
          return callback(chrome.runtime.lastError);
        }

        if (response && response.error) {
          return callback(new Error(response.error));
        }

        return callback(null, response.data);
      });
  }

  // eslint-disable-next-line class-methods-use-this
  drain(callback) {
    if (!callback) { callback = () => {}; }

    chrome.runtime.sendMessage(extensionId, { op: 'drain' },
      (response) => {
        if (chrome.runtime.lastError) {
          return callback(chrome.runtime.lastError);
        }

        if (response && response.error) {
          return callback(new Error(response.error));
        }

        return callback(null, response.data);
      });
  }

  // eslint-disable-next-line class-methods-use-this
  close(callback) {
    if (!callback) { callback = () => {}; }

    chrome.runtime.sendMessage(extensionId, { op: 'close' },
      (response) => {
        if (chrome.runtime.lastError) {
          return callback(chrome.runtime.lastError);
        }

        if (response && response.error) {
          return callback(new Error(response.error));
        }

        return callback();
      });
  }
}

export const list = (callback) => {
  chrome.runtime.sendMessage(extensionId, { op: 'list' },
    (response) => {
      if (chrome.runtime.lastError) {
        return callback(chrome.runtime.lastError);
      }

      if (response && response.error) {
        return callback(new Error(response.error));
      }

      return callback(null, response.data);
    });
};

/*
input none
callback callback
*/
const getManifest = (callback) => {
  chrome.runtime.sendMessage(extensionId, { op: 'getManifest' },
    (response) => {
      if (chrome.runtime.lastError) {
        return callback(chrome.runtime.lastError);
      }

      if (response && response.error) {
        return callback(new Error(response.error));
      }

      return callback(null, response.data);
    });
};

export const isInstalled = (callback) => {
  if (!has(window, 'chrome') || typeof chrome.runtime === 'undefined') {
    return callback(new Error('chrome-serialport not installed'));
  }

  return getManifest(callback);
};
