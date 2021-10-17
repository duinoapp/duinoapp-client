/* eslint-disable camelcase */
import ESPLoader from './ESPLoader';
import Transport from './webserial';

const asyncTimeout = (timeout) => new Promise((resolve) => setTimeout(() => resolve(timeout), timeout));
const isValid = (board) => ['esp8266', 'esp32'].includes(board.props?.build?.mcu);

// eslint-disable-next-line no-unused-vars
const upload = async ({ files, flash_mode, flash_freq }, board, serial, config) => {
  const log = (...args) => config.debug(`${args.join(' ')}\r\n`);
  const term = { log, debug: log, write: config.debug };

  const { port } = serial;
  const transport = new Transport(port, term);
  let espLoader;

  try {
    log('> Connecting...');
    espLoader = new ESPLoader(transport, term);
    await espLoader.main_fn();
    // await espLoader.flash_id();
    log('> Connected');
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    log('Failed to connect:', typeof err === 'string' ? err : err.message);
    try {
      await transport.disconnect();
    } catch (err2) {
      // eslint-disable-next-line no-console
      console.error(err2);
    }
    return;
  }

  try {
    if (board.config?.wipe && board.config.wipe !== 'none') {
      log('> Erasing device flash...');
      await espLoader.erase_flash();
      log('> Successfully erased device flash');
    }
    log('> Writing main data partition, this may take a while...');
    await espLoader.write_flash({
      fileArray: files.map((file) => ({ ...file, data: Buffer.from(file.data, 'base64') })),
      flash_size: 'keep',
      // flash_freq,
      // flash_mode,
      // compress: board.props?.build?.mcu !== 'esp8266',
    });
    await espLoader.flash_defl_finish({ reboot: true });
    await asyncTimeout(100);
    log('> Successfully written data partition');
    log('> Flashing succeeded! Have a nice day! :)');
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    log('Failed to upload:', typeof err === 'string' ? err : err.message);
  }

  try {
    await transport.disconnect();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
  }
};

export default {
  isValid,
  default: upload,
};
