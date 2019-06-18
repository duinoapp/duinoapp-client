import Vue from 'vue';

// eslint-disable-next-line import/no-mutable-exports
let Serial;

(async () => {
  // eslint-disable-next-line no-undef
  if (chrome && chrome.serial) Serial = (await import(/* webpackChunkName: "serial-chrome-app" */ './chrome-app')).default;
  else if (navigator && navigator.usb) Serial = (await import(/* webpackChunkName: "serial-chrome-app" */ './webusb')).default;
  else Serial = (await import(/* webpackChunkName: "serial-base" */ './base-serial')).default;
  Vue.use(new Serial());
})();

export default Serial;
