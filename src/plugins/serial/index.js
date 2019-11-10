import Vue from 'vue';

// eslint-disable-next-line import/no-mutable-exports
let Serial;

(async () => {
  // eslint-disable-next-line no-undef
  if (window.chrome && chrome.serial) Serial = (await import(/* webpackChunkName: "serial-chrome-app" */ './chrome-app')).default;
  else if (navigator && navigator.serial) Serial = (await import(/* webpackChunkName: "serial-nav-app" */ './navserial')).default;
  else if (navigator && navigator.usb) Serial = (await import(/* webpackChunkName: "serial-webusb-app" */ './webusb')).default;
  else Serial = (await import(/* webpackChunkName: "serial-base" */ './base-serial')).default;
  Vue.use(new Serial());
})();

export default Serial;
