/* eslint-disable no-unused-vars */
/* eslint-disable class-methods-use-this */
import EventEmitter from 'events';

/*
Interface should emit the following:
this.emit('data', buffer)
this.emit('message', string) // should be a string version of buffer
// message should not be emitted whilst this.mute === true
this.emit('connected', value)
this.emit('disconnected', value)
this.emit('deviceNamePrompt', value) // prompts the user to input a readable device name
*/
class BaseSerial extends EventEmitter {
  constructor() {
    super();
    this.requestRequired = false;
    this.mute = false;
    this.baud = 115200;
    this.encoding = 'ascii';
    this.devices = [];
    this.currentDevice = null;
    this.connected = false;
    this.implementation = 'basic';
  }

  install(Vue) {
    // eslint-disable-next-line no-param-reassign
    Vue.$serial = this;
    // eslint-disable-next-line no-param-reassign
    Vue.prototype.$serial = this;
  }

  async requestDevice() { return {}; }

  async listDevices() { return this.devices; }

  async isDevice(value) { return true; }

  async setCurrentDevice(value) { this.currentDevice = value; }

  async setBaud(baud) { return baud; }

  async setMute(val) { this.mute = val; }

  async write(message) { return message; }

  async writeBuff(buff) { return buff; }

  async connect() { this.connected = true; }

  async disconnect() { this.connected = false; }

  async setDeviceName(value, name) {
    if (await this.isDevice(value)) this.devices.push({ value, name });
  }
}

export default BaseSerial;
