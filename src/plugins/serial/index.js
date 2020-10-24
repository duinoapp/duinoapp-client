import Vue from 'vue';
// import { promisify } from 'util';
// import { setExtensionId, isInstalled } from './lib/chrome-serial';

// setExtensionId(process.env.VUE_APP_CHROME_EXTENSION_ID);

// eslint-disable-next-line import/no-mutable-exports
let Serial;

(async () => {
  // eslint-disable-next-line no-undef
  // try {
  //   await promisify(isInstalled)();
  //   Serial = (await import(/* webpackChunkName: "serial-chrome-extension" */ './chrome-extension')).default;
  // } catch (err) { console.error(err); }
  // if (!Serial && window.chrome && window.chrome.serial) {
  //   Serial = (await import(/* webpackChunkName: "serial-chrome-app" */ './chrome-app')).default;
  // }
  if (!Serial && navigator && navigator.serial) {
    Serial = (await import(/* webpackChunkName: "serial-nav-app" */ './navserial')).default;
  }
  // } else if (!Serial && navigator && navigator.usb) {
  //   Serial = (await import(/* webpackChunkName: "serial-webusb-app" */ './webusb')).default;
  if (!Serial) Serial = (await import(/* webpackChunkName: "serial-base" */ './base-serial')).default;
  Vue.use(new Serial());
})();

export default Serial;
