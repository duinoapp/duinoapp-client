let Serial;
// eslint-disable-next-line no-undef
if (chrome && chrome.serial) Serial = import(/* webpackChunkName: "serial-chrome-app" */ './chrome-app');
else if (navigator && navigator.usb) Serial = import(/* webpackChunkName: "serial-chrome-app" */ './webusb');

export default new Serial();
