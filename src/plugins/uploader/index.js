import EventEmitter from 'events';
import get from 'lodash/get';
import store from '../../store';
import avrdude from './stk500';

const toolMap = {
  avrdude,
};

class Uploader extends EventEmitter {
  install(Vue) {
    // eslint-disable-next-line no-param-reassign
    Vue.$uploader = this;
    // eslint-disable-next-line no-param-reassign
    Vue.prototype.$uploader = this;
    this.Vue = Vue;
  }

  // eslint-disable-next-line class-methods-use-this
  isSupported(board) { // eslint-disable-line no-unused-vars
    const toolProt = `${get(board, 'props.upload.tool', '').split(':').pop()}.${get(board, 'props.upload.protocol')}`;
    return !!get(toolMap, toolProt);
  }

  async upload(hex, config) {
    const serial = this.Vue.$serial;
    const existBaud = serial.baud;
    const [board] = store.getters['boards/find']({ query: { uuid: store.getters.currentBoard } }).data;
    const baud = config?.speed ?? board?.props?.upload?.speed;
    const toolProt = `${board?.props?.upload?.tool?.split(':').pop()}.${board?.props?.upload?.protocol}`;

    const uploader = get(toolMap, toolProt);
    if (!uploader) throw new Error('Board not currently supported');

    await serial.setMute(true);
    if (baud !== existBaud) await serial.setBaud(baud);

    await uploader(hex, board, serial, config);

    if (baud !== existBaud) await serial.setBaud(existBaud);
    await serial.setMute(false);
  }
}

export default new Uploader();
