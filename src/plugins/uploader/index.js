import EventEmitter from 'events';
import get from 'lodash/get';
import store from '../../store';
// import avrdude from './stk500';
import avrdude from './avrgirl';
import esptool from './esptool';

const asyncTimeout = (timeout) => new Promise((resolve) => setTimeout(() => resolve(timeout), timeout));

class Uploader extends EventEmitter {
  install(Vue) {
    // eslint-disable-next-line no-param-reassign
    Vue.$uploader = this;
    // eslint-disable-next-line no-param-reassign
    Vue.prototype.$uploader = this;
    this.Vue = Vue;
    this.toolMap = {
      avrdude,
      esptool,
      esptool_py: esptool,
    };
  }

  // eslint-disable-next-line class-methods-use-this
  isSupported(board) { // eslint-disable-line no-unused-vars
    const tool = get(board, 'props.upload.tool', '').split(':').pop();
    const toolProt = `${tool}.${get(board, 'props.upload.protocol', 'default')}`;
    return !!get(this.toolMap, toolProt) && get(this.toolMap, tool).isValid(board);
  }

  async waitForClose(serial, count = 0) {
    if (!serial.serial.isOpen || count > 50) return null;
    await asyncTimeout(100);
    return this.waitForClose(serial, count + 1);
  }

  async upload(res, config) {
    const serial = this.Vue.$serial;
    const existBaud = serial.baud;
    const [board] = store.getters['boards/find']({ query: { uuid: store.getters.currentBoard } }).data;
    const toolProt = `${board?.props?.upload?.tool?.split(':').pop()}.${board?.props?.upload?.protocol || 'default'}`;

    const uploader = get(this.toolMap, toolProt);
    if (!uploader) throw new Error('Board not currently supported');

    await serial.setMute(true);
    await serial.disconnect();

    await uploader(res, board, serial.serial, {
      ...config,
      debug: (message) => this.Vue.$compiler.emit('console.log', message),
      progress: (message, percent) => this.Vue.$compiler.emit('console.progress', { message, percent: (percent * 0.5) + 0.5 }),
    });

    await this.waitForClose(serial);
    await serial.setBaud(existBaud);
    await serial.connect();
    await serial.setMute(false);
  }
}

export default new Uploader();
