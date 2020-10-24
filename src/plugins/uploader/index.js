import EventEmitter from 'events';
import get from 'lodash/get';
import store from '../../store';
// import avrdude from './avrdude';
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
    // const toolProt = `${get(board, 'props.upload.tool', '').split(':').pop()}.${get(board, 'props.upload.protocol')}`;
    // console.log(board.fqbn, toolProt, !!get(toolMap, toolProt));
    // return !!get(toolMap, toolProt);
    return true;
  }

  async upload(hex) {
    const board = store.getters['boards/current'];
    const serial = this.Vue.$serial;
    const baud = get(board, 'props.upload.speed');
    const existBaud = serial.baud;
    const toolProt = `${get(board, 'props.upload.tool').split(':').pop()}.${get(board, 'props.upload.protocol')}`;
    const uploader = get(toolMap, toolProt);
    if (!uploader) throw new Error('Board not currently supported');
    await serial.setMute(true);
    if (baud !== existBaud) await serial.setBaud(baud);
    await uploader(hex, board, serial);
    if (baud !== existBaud) await serial.setBaud(existBaud);
    await serial.setMute(false);
  }
}

export default new Uploader();
