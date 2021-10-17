import Avrgirl from 'avrgirl-arduino/avrgirl-arduino-browser';
import cpuData from './avr-cpu-data';

const getConfig = (board) => {
  const cpu = board.props?.build?.mcu;
  return {
    baud: board.props?.upload?.speed,
    ...(cpuData[cpu] || {}),
  };
};

const isValid = (board) => true || !!getConfig(board)?.protocol;

const upload = ({ hex }, board, serial, config) => new Promise((resolve, reject) => {
  const avrgirl = new Avrgirl({
    board: getConfig(board),
    serialPort: serial,
    debug: config.verbose ? config.debug : undefined,
  });

  avrgirl.flash(Buffer.from(hex, 'base64'), (err) => {
    if (err) reject(err);
    else resolve();
  });
});

export default {
  isValid,
  arduino: upload,
  wiring: upload,
};
