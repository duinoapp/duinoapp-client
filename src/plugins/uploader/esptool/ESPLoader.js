/* eslint-disable no-await-in-loop */
/* eslint-disable no-throw-literal */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-plusplus */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-bitwise */
/* eslint-disable camelcase */
/* eslint-disable max-classes-per-file */
import pako from 'pako';
import CryptoJS from 'crypto-js';

const stubCache = {};

class ESP8266ROM {
    static CHIP_NAME = 'ESP8266';

    static IS_STUB = true;

    static CHIP_DETECT_MAGIC_VALUE = 0xfff0c101;

    static FLASH_WRITE_SIZE = 0x400;

    // OTP ROM addresses
    static ESP_OTP_MAC0 = 0x3ff00050

    static ESP_OTP_MAC1 = 0x3ff00054

    static ESP_OTP_MAC3 = 0x3ff0005c

    static SPI_REG_BASE = 0x60000200

    static SPI_USR_OFFS = 0x1c

    static SPI_USR1_OFFS = 0x20

    static SPI_USR2_OFFS = 0x24

    static SPI_MOSI_DLEN_OFFS = null

    static SPI_MISO_DLEN_OFFS = null

    static SPI_W0_OFFS = 0x40

    static UART_CLKDIV_REG = 0x60000014

    static XTAL_CLK_DIVIDER = 2

    static FLASH_SIZES = {
      '512KB': 0x00,
      '256KB': 0x10,
      '1MB': 0x20,
      '2MB': 0x30,
      '4MB': 0x40,
      '2MB-c1': 0x50,
      '4MB-c1': 0x60,
      '8MB': 0x80,
      '16MB': 0x90,
    }

    static BOOTLOADER_FLASH_OFFSET = 0

    static MEMORY_MAP = [[0x3FF00000, 0x3FF00010, 'DPORT'],
      [0x3FFE8000, 0x40000000, 'DRAM'],
      [0x40100000, 0x40108000, 'IRAM'],
      [0x40201010, 0x402E1010, 'IROM']]

    static get_efuses = async (loader) => {
      // Return the 128 bits of ESP8266 efuse as a single integer
      const result = (await loader.read_reg({ addr: 0x3ff0005c }) << 96)
        | (await loader.read_reg({ addr: 0x3ff00058 }) << 64)
        | (await loader.read_reg({ addr: 0x3ff00054 }) << 32)
        | await loader.read_reg({ addr: 0x3ff00050 });
      return result;
    }

    static _get_flash_size = (efuses) => {
      // rX_Y = EFUSE_DATA_OUTX[Y]
      const r0_4 = (efuses & (1 << 4)) !== 0;
      const r3_25 = (efuses & (1 << 121)) !== 0;
      const r3_26 = (efuses & (1 << 122)) !== 0;
      const r3_27 = (efuses & (1 << 123)) !== 0;

      if (r0_4 && !r3_25) {
        if (!r3_27 && !r3_26) {
          return 1;
        } if (!r3_27 && r3_26) {
          return 2;
        }
      }
      if (!r0_4 && r3_25) {
        if (!r3_27 && !r3_26) {
          return 2;
        } if (!r3_27 && r3_26) {
          return 4;
        }
      }
      return -1;
    }

    static get_chip_description = async (loader) => {
      const efuses = await this.get_efuses(loader);
      const is_8285 = (efuses & (((1 << 4) | 1) << 80)) !== 0; // One or the other efuse bit is set for ESP8285
      if (is_8285) {
        const flash_size = this._get_flash_size(efuses);
        const max_temp = (efuses & (1 << 5)) !== 0; // This efuse bit identifies the max flash temperature
        const chip_name = {
          1: max_temp ? 'ESP8285H08' : 'ESP8285N08',
          2: max_temp ? 'ESP8285H16' : 'ESP8285N16',
        }[flash_size] || 'ESP8285';
        return chip_name;
      }
      return 'ESP8266EX';
    }

    static get_chip_features = async (loader) => {
      const features = ['WiFi'];
      if (await this.get_chip_description(loader) === 'ESP8285') {
        features.push('Embedded Flash');
      }
      return features;
    }

    static flash_spi_attach = async (loader, hspi_arg) => {
      if (this.IS_STUB) {
        await super.flash_spi_attach(loader, hspi_arg);
      } else {
        // ESP8266 ROM has no flash_spi_attach command in serial protocol,
        // but flash_begin will do it
        await loader.flash_begin(0, 0);
      }
    }

    static flash_set_parameters = async (loader, size) => {
      // not implemented in ROM, but OK to silently skip for ROM
      if (this.IS_STUB) {
        await super.flash_set_parameters(loader, size);
      }
    }

    static chip_id = async (loader) => {
      // Read Chip ID from efuse - the equivalent of the SDK system_get_chip_id() function
      const id0 = await loader.read_reg({ addr: this.ESP_OTP_MAC0 });
      const id1 = await loader.read_reg({ addr: this.ESP_OTP_MAC1 });
      return (id0 >> 24) | ((id1 & 0xffffff) << 8);
    }

    static read_mac = async (loader) => {
      // Read MAC from OTP ROM
      const mac0 = await loader.read_reg({ addr: this.ESP_OTP_MAC0 });
      const mac1 = await loader.read_reg({ addr: this.ESP_OTP_MAC1 });
      const mac3 = await loader.read_reg({ addr: this.ESP_OTP_MAC3 });
      let oui;
      if (mac3 !== 0) {
        oui = ((mac3 >> 16) & 0xff, (mac3 >> 8) & 0xff, mac3 & 0xff);
      } else if (((mac1 >> 16) & 0xff) === 0) {
        oui = (0x18, 0xfe, 0x34);
      } else if (((mac1 >> 16) & 0xff) === 1) {
        oui = (0xac, 0xd0, 0x74);
      } else {
        throw ('Unknown OUI');
      }
      return oui + ((mac1 >> 8) & 0xff, mac1 & 0xff, (mac0 >> 24) & 0xff);
    }

    static get_erase_size = (offset, size) => size

    // eslint-disable-next-line no-unused-vars
    static get_crystal_freq = async (loader) => 40
}

class ESP32ROM {
    static CHIP_NAME = 'ESP32';

    static IS_STUB = true;

    static IMAGE_CHIP_ID = 0;

    static CHIP_DETECT_MAGIC_VALUE = 0x00f01d83;

    static EFUSE_RD_REG_BASE = 0x3ff5a000;

    static DR_REG_SYSCON_BASE = 0x3ff66000;

    static UART_CLKDIV_REG = 0x3ff40014;

    static UART_CLKDIV_MASK = 0xFFFFF;

    static UART_DATE_REG_ADDR = 0x60000078;

    static XTAL_CLK_DIVIDER= 1;

    static FLASH_WRITE_SIZE = 0x400;

    static BOOTLOADER_FLASH_OFFSET = 0x1000;

    static FLASH_SIZES = {
      '1MB': 0x00, '2MB': 0x10, '4MB': 0x20, '8MB': 0x30, '16MB': 0x40,
    };

    static SPI_REG_BASE = 0x3ff42000;

    static SPI_USR_OFFS = 0x1c;

    static SPI_USR1_OFFS = 0x20;

    static SPI_USR2_OFFS = 0x24;

    static SPI_W0_OFFS = 0x80;

    static SPI_MOSI_DLEN_OFFS = 0x28;

    static SPI_MISO_DLEN_OFFS = 0x2c;

    static read_efuse = async (loader, offset) => {
      const addr = this.EFUSE_RD_REG_BASE + (4 * offset);
      // console.log(`Read efuse ${addr}`);
      return loader.read_reg({ addr });
    }

    static get_pkg_version = async (loader) => {
      const word3 = await this.read_efuse(loader, 3);
      let pkg_version = (word3 >> 9) & 0x07;
      pkg_version += ((word3 >> 2) & 0x1) << 3;
      return pkg_version;
    }

    static get_chip_revision = async (loader) => {
      const word3 = await this.read_efuse(loader, 3);
      const word5 = await this.read_efuse(loader, 5);
      const apb_ctl_date = await loader.read_reg({ addr: this.DR_REG_SYSCON_BASE + 0x7C });

      const rev_bit0 = (word3 >> 15) & 0x1;
      const rev_bit1 = (word5 >> 20) & 0x1;
      const rev_bit2 = (apb_ctl_date >> 31) & 0x1;
      if (rev_bit0 !== 0) {
        if (rev_bit1 !== 0) {
          if (rev_bit2 !== 0) {
            return 3;
          }
          return 2;
        }
        return 1;
      }
      return 0;
    }

    static get_chip_description = async (loader) => {
      const chip_desc = ['ESP32-D0WDQ6', 'ESP32-D0WD', 'ESP32-D2WD', '', 'ESP32-U4WDH', 'ESP32-PICO-D4', 'ESP32-PICO-V3-02'];
      let chip_name = '';
      const pkg_version = await this.get_pkg_version(loader);
      const chip_revision = await this.get_chip_revision(loader);
      const rev3 = (chip_revision === 3);
      const single_core = await this.read_efuse(loader, 3) & (1 << 0);

      if (single_core !== 0) {
        chip_desc[0] = 'ESP32-S0WDQ6';
        chip_desc[1] = 'ESP32-S0WD';
      }
      if (rev3) {
        chip_desc[5] = 'ESP32-PICO-V3';
      }
      if (pkg_version >= 0 && pkg_version <= 6) {
        chip_name = chip_desc[pkg_version];
      } else {
        chip_name = 'Unknown ESP32';
      }

      if (rev3 && (pkg_version === 0 || pkg_version === 1)) {
        chip_name += '-V3';
      }
      return `${chip_name} (revision ${chip_revision})`;
    }

    static get_chip_features = async (loader) => {
      const features = ['Wi-Fi'];
      const word3 = await this.read_efuse(loader, 3);

      const chip_ver_dis_bt = word3 & (1 << 1);
      if (chip_ver_dis_bt === 0) {
        features.push(' BT');
      }

      const chip_ver_dis_app_cpu = word3 & (1 << 0);
      if (chip_ver_dis_app_cpu !== 0) {
        features.push(' Single Core');
      } else {
        features.push(' Dual Core');
      }

      const chip_cpu_freq_rated = word3 & (1 << 13);
      if (chip_cpu_freq_rated !== 0) {
        const chip_cpu_freq_low = word3 & (1 << 12);
        if (chip_cpu_freq_low !== 0) {
          features.push(' 160MHz');
        } else {
          features.push(' 240MHz');
        }
      }

      const pkg_version = await this.get_pkg_version(loader);
      if ([2, 4, 5, 6].includes(pkg_version)) {
        features.push(' Embedded Flash');
      }

      if (pkg_version === 6) {
        features.push(' Embedded PSRAM');
      }

      const word4 = await this.read_efuse(loader, 4);
      const adc_vref = (word4 >> 8) & 0x1F;
      if (adc_vref !== 0) {
        features.push(' VRef calibration in efuse');
      }

      const blk3_part_res = (word3 >> 14) & 0x1;
      if (blk3_part_res !== 0) {
        features.push(' BLK3 partially reserved');
      }

      const word6 = await this.read_efuse(loader, 6);
      const coding_scheme = word6 & 0x3;
      const coding_scheme_arr = ['None', '3/4', 'Repeat (UNSUPPORTED)', 'Invalid'];
      features.push(` Coding Scheme ${coding_scheme_arr[coding_scheme]}`);

      return features;
    }

    static get_crystal_freq = async (loader) => {
      const uart_div = await loader.read_reg({ addr: this.UART_CLKDIV_REG }) & this.UART_CLKDIV_MASK;
      const ets_xtal = (loader.transport.baudrate * uart_div) / 1000000 / this.XTAL_CLK_DIVIDER;
      let norm_xtal;
      if (ets_xtal > 33) {
        norm_xtal = 40;
      } else {
        norm_xtal = 26;
      }
      if (Math.abs(norm_xtal - ets_xtal) > 1) {
        loader.log('WARNING: Unsupported crystal in use');
      }
      return norm_xtal;
    }

    static _d2h(d) {
      const h = (+d).toString(16);
      return h.length === 1 ? `0${h}` : h;
    }

    static read_mac = async (loader) => {
      let mac0 = await this.read_efuse(loader, 1);
      mac0 >>>= 0;
      let mac1 = await this.read_efuse(loader, 2);
      mac1 >>>= 0;
      const mac = new Uint8Array(6);
      mac[0] = (mac1 >> 8) & 0xff;
      mac[1] = mac1 & 0xff;
      mac[2] = (mac0 >> 24) & 0xff;
      mac[3] = (mac0 >> 16) & 0xff;
      mac[4] = (mac0 >> 8) & 0xff;
      mac[5] = mac0 & 0xff;

      return (`${
        this._d2h(mac[0])
      }:${
        this._d2h(mac[1])
      }:${
        this._d2h(mac[2])
      }:${
        this._d2h(mac[3])
      }:${
        this._d2h(mac[4])
      }:${
        this._d2h(mac[5])
      }`);
    }

    static get_erase_size = (offset, size) => size
}

class ESP32S2ROM {
    static CHIP_NAME = 'ESP32-S2';

    static IS_STUB = true;

    static IMAGE_CHIP_ID = 2;

    static CHIP_DETECT_MAGIC_VALUE = 0x000007c6;

    static MAC_EFUSE_REG = 0x3f41A044;

    static EFUSE_BASE = 0x3f41A000;

    static UART_CLKDIV_REG = 0x3f400014;

    static UART_CLKDIV_MASK = 0xFFFFF;

    static UART_DATE_REG_ADDR = 0x60000078;

    static FLASH_WRITE_SIZE = 0x400;

    static BOOTLOADER_FLASH_OFFSET = 0x1000;

    static FLASH_SIZES = {
      '1MB': 0x00, '2MB': 0x10, '4MB': 0x20, '8MB': 0x30, '16MB': 0x40,
    };

    static SPI_REG_BASE = 0x3f402000;

    static SPI_USR_OFFS = 0x18;

    static SPI_USR1_OFFS = 0x1c;

    static SPI_USR2_OFFS = 0x20;

    static SPI_W0_OFFS = 0x58;

    static SPI_MOSI_DLEN_OFFS = 0x24;

    static SPI_MISO_DLEN_OFFS = 0x28;

    static get_pkg_version = async (loader) => {
      const num_word = 3;
      const block1_addr = this.EFUSE_BASE + 0x044;
      const addr = block1_addr + (4 * num_word);
      const word3 = await loader.read_reg({ addr });
      const pkg_version = (word3 >> 21) & 0x0F;
      return pkg_version;
    }

    static get_chip_description = async (loader) => {
      const chip_desc = ['ESP32-S2', 'ESP32-S2FH16', 'ESP32-S2FH32'];
      const pkg_ver = await this.get_pkg_version(loader);
      if (pkg_ver >= 0 && pkg_ver <= 2) {
        return chip_desc[pkg_ver];
      }
      return 'unknown ESP32-S2';
    }

    static get_chip_features = async (loader) => {
      const features = ['Wi-Fi'];
      const pkg_ver = await this.get_pkg_version(loader);
      if (pkg_ver === 1) {
        features.push('Embedded 2MB Flash');
      } else if (pkg_ver === 2) {
        features.push('Embedded 4MB Flash');
      }
      const num_word = 4;
      const block2_addr = this.EFUSE_BASE + 0x05C;
      const addr = block2_addr + (4 * num_word);
      const word4 = await loader.read_reg({ addr });
      const block2_ver = (word4 >> 4) & 0x07;

      if (block2_ver === 1) {
        features.push('ADC and temperature sensor calibration in BLK2 of efuse');
      }
      return features;
    }

    // eslint-disable-next-line no-unused-vars
    static get_crystal_freq = async (loader) => 40

    static _d2h(d) {
      const h = (+d).toString(16);
      return h.length === 1 ? `0${h}` : h;
    }

    static read_mac = async (loader) => {
      let mac0 = await loader.read_reg({ addr: this.MAC_EFUSE_REG });
      mac0 >>>= 0;
      let mac1 = await loader.read_reg({ addr: this.MAC_EFUSE_REG + 4 });
      mac1 = (mac1 >>> 0) & 0x0000ffff;
      const mac = new Uint8Array(6);
      mac[0] = (mac1 >> 8) & 0xff;
      mac[1] = mac1 & 0xff;
      mac[2] = (mac0 >> 24) & 0xff;
      mac[3] = (mac0 >> 16) & 0xff;
      mac[4] = (mac0 >> 8) & 0xff;
      mac[5] = mac0 & 0xff;

      return (`${
        this._d2h(mac[0])
      }:${
        this._d2h(mac[1])
      }:${
        this._d2h(mac[2])
      }:${
        this._d2h(mac[3])
      }:${
        this._d2h(mac[4])
      }:${
        this._d2h(mac[5])
      }`);
    }

    static get_erase_size = (offset, size) => size
}

class ESP32S3BETA2ROM {
    static CHIP_NAME = 'ESP32-S3';

    static IMAGE_CHIP_ID = 4;

    static CHIP_DETECT_MAGIC_VALUE = 0xeb004136;

    // eslint-disable-next-line no-unused-vars
    static get_pkg_version = async (loader) => {
    }

    // eslint-disable-next-line no-unused-vars
    static get_chip_revision = async (loader) => {
    }

    // eslint-disable-next-line no-unused-vars
    static get_chip_description = async (loader) => {
    }

    // eslint-disable-next-line no-unused-vars
    static get_chip_features = async (loader) => {
    }

    // eslint-disable-next-line no-unused-vars
    static get_crystal_freq = async (loader) => {
    }

    // eslint-disable-next-line no-unused-vars
    static read_mac = async (loader) => {
    }
}

class ESP32C3ROM {
    static CHIP_NAME = 'ESP32-C3';

    static IS_STUB = true;

    static IMAGE_CHIP_ID = 5;

    static CHIP_DETECT_MAGIC_VALUE = 0x6921506f;

    static EFUSE_BASE = 0x60008800;

    static MAC_EFUSE_REG = this.EFUSE_BASE + 0x044;

    static UART_CLKDIV_REG = 0x3ff40014;

    static UART_CLKDIV_MASK = 0xFFFFF;

    static UART_DATE_REG_ADDR = 0x6000007C;

    static FLASH_WRITE_SIZE = 0x400;

    static BOOTLOADER_FLASH_OFFSET = 0x1000;

    static FLASH_SIZES = {
      '1MB': 0x00, '2MB': 0x10, '4MB': 0x20, '8MB': 0x30, '16MB': 0x40,
    };

    static SPI_REG_BASE = 0x60002000;

    static SPI_USR_OFFS = 0x18;

    static SPI_USR1_OFFS = 0x1C;

    static SPI_USR2_OFFS = 0x20;

    static SPI_MOSI_DLEN_OFFS = 0x24;

    static SPI_MISO_DLEN_OFFS = 0x28;

    static SPI_W0_OFFS = 0x58;

    static get_pkg_version = async (loader) => {
      const num_word = 3;
      const block1_addr = this.EFUSE_BASE + 0x044;
      const addr = block1_addr + (4 * num_word);
      const word3 = await loader.read_reg({ addr });
      const pkg_version = (word3 >> 21) & 0x0F;
      return pkg_version;
    }

    static get_chip_revision = async (loader) => {
      const block1_addr = this.EFUSE_BASE + 0x044;
      const num_word = 3;
      const pos = 18;
      const addr = block1_addr + (4 * num_word);
      const ret = (await loader.read_reg({ addr }) & (0x7 << pos)) >> pos;
      return ret;
    }

    static get_chip_description = async (loader) => {
      let desc;
      const pkg_ver = await this.get_pkg_version(loader);
      if (pkg_ver === 0) {
        desc = 'ESP32-C3';
      } else {
        desc = 'unknown ESP32-C3';
      }
      const chip_rev = await this.get_chip_revision(loader);
      desc += ` (revision ${chip_rev})`;
      return desc;
    }

    // eslint-disable-next-line no-unused-vars
    static get_chip_features = async (loader) => ['Wi-Fi']

    // eslint-disable-next-line no-unused-vars
    static get_crystal_freq = async (loader) => 40

    static _d2h(d) {
      const h = (+d).toString(16);
      return h.length === 1 ? `0${h}` : h;
    }

    static read_mac = async (loader) => {
      let mac0 = await loader.read_reg({ addr: this.MAC_EFUSE_REG });
      mac0 >>>= 0;
      let mac1 = await loader.read_reg({ addr: this.MAC_EFUSE_REG + 4 });
      mac1 = (mac1 >>> 0) & 0x0000ffff;
      const mac = new Uint8Array(6);
      mac[0] = (mac1 >> 8) & 0xff;
      mac[1] = mac1 & 0xff;
      mac[2] = (mac0 >> 24) & 0xff;
      mac[3] = (mac0 >> 16) & 0xff;
      mac[4] = (mac0 >> 8) & 0xff;
      mac[5] = mac0 & 0xff;

      return (`${
        this._d2h(mac[0])
      }:${
        this._d2h(mac[1])
      }:${
        this._d2h(mac[2])
      }:${
        this._d2h(mac[3])
      }:${
        this._d2h(mac[4])
      }:${
        this._d2h(mac[5])
      }`);
    }

    static get_erase_size = (offset, size) => size
}

export default class ESPLoader {
    ESP_RAM_BLOCK = 0x1800;

    ESP_FLASH_BEGIN = 0x02;

    ESP_FLASH_DATA = 0x03;

    ESP_FLASH_END = 0x04;

    ESP_MEM_BEGIN = 0x05;

    ESP_MEM_END = 0x06;

    ESP_MEM_DATA = 0x07;

    ESP_WRITE_REG = 0x09;

    ESP_FLASH_DEFL_BEGIN = 0x10;

    ESP_FLASH_DEFL_DATA = 0x11;

    ESP_FLASH_DEFL_END = 0x12;

    ESP_SPI_FLASH_MD5 = 0x13;

    ESP_READ_REG = 0x0A;

    ESP_SPI_ATTACH = 0x0D;

    // Only Stub supported commands
    ESP_ERASE_FLASH = 0xD0;

    ESP_ERASE_REGION = 0xD1;

    ESP_IMAGE_MAGIC = 0xe9;

    ESP_CHECKSUM_MAGIC = 0xef;

    ERASE_REGION_TIMEOUT_PER_MB = 30000;

    ERASE_WRITE_TIMEOUT_PER_MB = 40000;

    MD5_TIMEOUT_PER_MB = 8000;

    CHIP_ERASE_TIMEOUT = 120000;

    MAX_TIMEOUT = this.CHIP_ERASE_TIMEOUT * 2;

    CHIP_DETECT_MAGIC_REG_ADDR = 0x40001000;

    DETECTED_FLASH_SIZES = {
      0x12: '256KB', 0x13: '512KB', 0x14: '1MB', 0x15: '2MB', 0x16: '4MB', 0x17: '8MB', 0x18: '16MB',
    };

    constructor(transport, terminal) {
      this.transport = transport;
      this.terminal = terminal;
      this.IS_STUB = false;
      this.chip = null;

      // if (terminal) {
      //   this.terminal.clear();
      // }

      this.log('esptool.js v0.1-dev');
      this.log(`Serial port ${this.transport.get_info()}`);
    }

    _sleep(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }

    log(str) {
      if (this.transport) {
        this.terminal.log(str);
      } else {
        // eslint-disable-next-line no-console
        console.log(str);
      }
    }

    write_char(str) {
      if (this.transport) {
        this.terminal.write(str);
      } else {
        // eslint-disable-next-line no-console
        console.log(str);
      }
    }

    _short_to_bytearray(i) {
      return [i & 0xff, (i >> 8) & 0xff];
    }

    _int_to_bytearray(i) {
      return [i & 0xff, (i >> 8) & 0xff, (i >> 16) & 0xff, (i >> 24) & 0xff];
    }

    _bytearray_to_short(i, j) {
      return (new Uint16Array([(i | (j >> 8))]))[0];
    }

    _bytearray_to_int(i, j, k, l) {
      return (new Uint32Array([(i | (j << 8) | (k << 16) | (l << 24))]))[0];
    }

    _appendBuffer(buffer1, buffer2) {
      const tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength);
      tmp.set(new Uint8Array(buffer1), 0);
      tmp.set(new Uint8Array(buffer2), buffer1.byteLength);
      return tmp.buffer;
    }

    _appendArray(arr1, arr2) {
      const c = new Uint8Array(arr1.length + arr2.length);
      c.set(arr1, 0);
      c.set(arr2, arr1.length);
      return c;
    }

    async _loadStub() {
      const stubName = this.chip.CHIP_NAME.replaceAll('-', '').toLowerCase();
      if (stubCache[stubName]) {
        return stubCache[stubName];
      }
      const stub = await fetch(`/stubs/${stubName}.json`).then((res) => res.json());

      stub.data = Buffer.from(stub.data, 'base64');
      stub.text = Buffer.from(stub.text, 'base64');

      stubCache[stubName] = stub;
      return stub;
    }

    ui8ToBstr(u8Array) {
      let i;
      const len = u8Array.length;
      let b_str = '';
      for (i = 0; i < len; i++) {
        b_str += String.fromCharCode(u8Array[i]);
      }
      return b_str;
    }

    bstrToUi8(bStr) {
      const len = bStr.length;
      const u8_array = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        u8_array[i] = bStr.charCodeAt(i);
      }
      return u8_array;
    }

    flush_input = async () => {
      try {
        await this.transport.read({ timeout: 200 });
      } catch (e) {
        Math.random(e);
      }
    }

    command = async ({
      op = null, data = [], chk = 0, wait_response = true, timeout = 3000, min_data = 12,
    } = {}) => {
      // console.log("command "+ op + " " + wait_response + " " + timeout);
      if (op != null) {
        const pkt = new Uint8Array(8 + data.length);
        pkt[0] = 0x00;
        pkt[1] = op;
        pkt[2] = this._short_to_bytearray(data.length)[0];
        pkt[3] = this._short_to_bytearray(data.length)[1];
        pkt[4] = this._int_to_bytearray(chk)[0];
        pkt[5] = this._int_to_bytearray(chk)[1];
        pkt[6] = this._int_to_bytearray(chk)[2];
        pkt[7] = this._int_to_bytearray(chk)[3];

        let i;
        for (i = 0; i < data.length; i++) {
          pkt[8 + i] = data[i];
        }
        // console.log("Command " + pkt);
        await this.transport.write(pkt);
      }

      if (wait_response) {
        try {
          const p = await this.transport.read({ timeout, min_data });
          // console.log(this.transport.slip_reader_enabled, p);
          // const resp = p[0];
          const op_ret = p[1];
          // const len_ret = this._bytearray_to_short(p[2], p[3]);
          const val = this._bytearray_to_int(p[4], p[5], p[6], p[7]);
          // eslint-disable-next-line no-console
          // console.log(`Resp ${resp} ${op_ret} ${op} ${len_ret} ${val} ${p}`);
          const datum = p.slice(8);
          // eslint-disable-next-line eqeqeq
          if (op == null || op_ret == op) {
            return [val, datum];
          }
          throw ('invalid response');
        } catch (e) {
          if (e === 'timeout') {
            throw (e);
          }
        }
      }
      return [];
    }

    read_reg = async ({ addr, timeout = 3000 } = {}) => {
      // console.log(`read reg ${addr} ${timeout}`);
      const pkt = this._int_to_bytearray(addr);
      const val = await this.command({ op: this.ESP_READ_REG, data: pkt, timeout });
      // console.log('Read reg resp', val);
      return val[0];
    }

    write_reg = async ({
      addr, value, mask = 0xFFFFFFFF, delay_us = 0, delay_after_us = 0,
    } = {}) => {
      let pkt = this._appendArray(this._int_to_bytearray(addr), this._int_to_bytearray(value));
      pkt = this._appendArray(pkt, this._int_to_bytearray(mask));
      pkt = this._appendArray(pkt, this._int_to_bytearray(delay_us));

      if (delay_after_us > 0) {
        pkt = this._appendArray(pkt, this._int_to_bytearray(this.chip.UART_DATE_REG_ADDR));
        pkt = this._appendArray(pkt, this._int_to_bytearray(0));
        pkt = this._appendArray(pkt, this._int_to_bytearray(0));
        pkt = this._appendArray(pkt, this._int_to_bytearray(delay_after_us));
      }

      await this.check_command({ op_description: 'write target memory', op: this.ESP_WRITE_REG, data: pkt });
    }

    sync = async () => {
      // console.log('Sync');
      const cmd = new Uint8Array(36);
      let i;
      cmd[0] = 0x07;
      cmd[1] = 0x07;
      cmd[2] = 0x12;
      cmd[3] = 0x20;
      for (i = 0; i < 32; i++) {
        cmd[4 + i] = 0x55;
      }

      try {
        const resp = await this.command({ op: 0x08, data: cmd, timeout: 100 });
        this.syncStubDetected = resp[0] === 0;
        return resp;
      } catch (e) {
        // eslint-disable-next-line no-console
        console.log(`Sync err ${e}`);
        throw (e);
      }
    }

    _connect_attempt = async ({ mode = 'default_reset', esp32r0_delay = false } = {}) => {
      // console.log(`_connect_attempt ${esp32r0_delay}`);
      if (mode !== 'no_reset') {
        await this.transport.setDTR(false);
        await this.transport.setRTS(true);
        await this._sleep(100);
        if (esp32r0_delay) {
          // await this._sleep(1200);
          await this._sleep(2000);
        }
        await this.transport.setDTR(true);
        await this.transport.setRTS(false);
        if (esp32r0_delay) {
          // await this._sleep(400);
        }
        await this._sleep(50);
        await this.transport.setDTR(false);
      }
      let i = 0;
      // eslint-disable-next-line no-constant-condition
      while (1) {
        try {
          const res = await this.transport.read({ timeout: 1000 });
          i += res.length;
          // console.log("Len = " + res.length);
          // var str = new TextDecoder().decode(res);
          // this.log(str);
        } catch (e) {
          if (e === 'timeout') {
            break;
          }
        }
        await this._sleep(50);
      }
      this.transport.slip_reader_enabled = true;
      i = 7;
      while (i--) {
        try {
          await this.sync();
          return 'success';
        } catch (error) {
          if (error === 'timeout') {
            if (esp32r0_delay) {
              this.write_char('_');
            } else {
              this.write_char('.');
            }
          }
        }
        await this._sleep(50);
      }
      return 'error';
    }

    // eslint-disable-next-line no-unused-vars
    async connect({ mode = 'default_reset', attempts = 7, detecting = false } = {}) {
      let i;
      let resp;
      this.write_char('Connecting...');
      await this.transport.connect();
      for (i = 0; i < attempts; i++) {
        resp = await this._connect_attempt({ esp32r0_delay: false });
        if (resp === 'success') {
          break;
        }
        resp = await this._connect_attempt({ esp32r0_delay: true });
        if (resp === 'success') {
          break;
        }
      }
      if (resp !== 'success') {
        this.log('Failed to connect with the device');
        return 'error';
      }
      this.write_char('\n');
      this.write_char('\r');
      await this._sleep(100);
      await this.flush_input();

      if (!detecting) {
        const chip_magic_value = await this.read_reg({ addr: 0x40001000 });
        // eslint-disable-next-line no-console
        // console.log(`Chip Magic ${chip_magic_value}`);
        const chips = [ESP8266ROM, ESP32ROM, ESP32S2ROM, ESP32S3BETA2ROM, ESP32C3ROM];
        this.chip = chips.find((cls) => chip_magic_value === cls.CHIP_DETECT_MAGIC_VALUE);
        // console.log('chip', this.chip);
      }
      return null;
    }

    detect_chip = async () => {
      await this.connect();
      this.write_char('Detecting chip type... ');
      if (this.chip != null) {
        this.log(this.chip.CHIP_NAME);
      }
    }

    check_command = async ({
      // eslint-disable-next-line no-unused-vars
      op_description = '', op = null, data = [], chk = 0, timeout = 3000, min_data,
    } = {}) => {
      // console.log(`check_command ${op}`);
      const resp = await this.command({
        op, data, chk, timeout, min_data,
      });
      if (resp[1].length > 4) {
        return resp[1];
      }
      return resp[0];
    }

    mem_begin = async (size, blocks, blocksize, offset) => {
      /* XXX: Add check to ensure that STUB is not getting overwritten */
      // console.log(`mem_begin ${size} ${blocks} ${blocksize} ${offset}`);
      let pkt = this._appendArray(this._int_to_bytearray(size), this._int_to_bytearray(blocks));
      pkt = this._appendArray(pkt, this._int_to_bytearray(blocksize));
      pkt = this._appendArray(pkt, this._int_to_bytearray(offset));
      await this.check_command({ op_description: 'write to target RAM', op: this.ESP_MEM_BEGIN, data: pkt });
    }

    checksum = (data) => {
      let i;
      let chk = 0xEF;

      for (i = 0; i < data.length; i++) {
        chk ^= data[i];
      }
      return chk;
    }

    mem_block = async (buffer, seq) => {
      let pkt = this._appendArray(this._int_to_bytearray(buffer.length), this._int_to_bytearray(seq));
      pkt = this._appendArray(pkt, this._int_to_bytearray(0));
      pkt = this._appendArray(pkt, this._int_to_bytearray(0));
      pkt = this._appendArray(pkt, buffer);
      const checksum = this.checksum(buffer);
      await this.check_command({
        op_description: 'write to target RAM', op: this.ESP_MEM_DATA, data: pkt, chk: checksum,
      });
    }

    mem_finish = async (entrypoint) => {
      const is_entry = (entrypoint === 0) ? 1 : 0;
      const pkt = this._appendArray(this._int_to_bytearray(is_entry), this._int_to_bytearray(entrypoint));
      return this.check_command({
        op_description: 'leave RAM download mode', op: this.ESP_MEM_END, data: pkt, timeout: 500, min_data: 12,
      }); // XXX: handle non-stub with diff timeout
    }

    flash_spi_attach = async (hspi_arg) => {
      const pkt = this._int_to_bytearray(hspi_arg);
      await this.check_command({ op_description: 'configure SPI flash pins', op: this.ESP_SPI_ATTACH, data: pkt });
    }

    timeout_per_mb = (seconds_per_mb, size_bytes) => {
      const result = seconds_per_mb * (size_bytes / 1000000);
      if (result < 3000) {
        return 3000;
      }
      return result;
    }

    flash_begin = async (size, offset) => {
      const num_blocks = Math.floor((size + this.FLASH_WRITE_SIZE - 1) / this.FLASH_WRITE_SIZE);
      const erase_size = this.chip.get_erase_size(offset, size);

      const d = new Date();
      const t1 = d.getTime();

      let timeout = 3000;
      if (this.IS_STUB === false) {
        timeout = this.timeout_per_mb(this.ERASE_REGION_TIMEOUT_PER_MB, size);
      }

      // eslint-disable-next-line no-console
      // console.log(`flash begin ${erase_size} ${num_blocks} ${this.FLASH_WRITE_SIZE} ${offset} ${size}`);
      let pkt = this._appendArray(this._int_to_bytearray(erase_size), this._int_to_bytearray(num_blocks));
      pkt = this._appendArray(pkt, this._int_to_bytearray(this.FLASH_WRITE_SIZE));
      pkt = this._appendArray(pkt, this._int_to_bytearray(offset));
      if (this.IS_STUB === false) {
        pkt = this._appendArray(pkt, this._int_to_bytearray(0)); // XXX: Support encrypted
      }

      await this.check_command({
        op_description: 'enter Flash download mode', op: this.ESP_FLASH_BEGIN, data: pkt, timeout,
      });

      const t2 = d.getTime();
      if (size !== 0 && this.IS_STUB === false) {
        this.log(`Took ${(t2 - t1) / 1000}.${(t2 - t1) % 1000}s to erase flash block`);
      }
      return num_blocks;
    }

    flash_defl_begin = async (size, compsize, offset) => {
      const num_blocks = Math.floor((compsize + this.FLASH_WRITE_SIZE - 1) / this.FLASH_WRITE_SIZE);
      const erase_blocks = Math.floor((size + this.FLASH_WRITE_SIZE - 1) / this.FLASH_WRITE_SIZE);

      const d = new Date();
      const t1 = d.getTime();

      let write_size; let
        timeout;
      if (this.IS_STUB) {
        write_size = size;
        timeout = 3000;
      } else {
        write_size = erase_blocks * this.FLASH_WRITE_SIZE;
        timeout = this.timeout_per_mb(this.ERASE_REGION_TIMEOUT_PER_MB, write_size);
      }
      this.log(`Compressed ${size} bytes to ${compsize}...`);

      let pkt = this._appendArray(this._int_to_bytearray(write_size), this._int_to_bytearray(num_blocks));
      pkt = this._appendArray(pkt, this._int_to_bytearray(this.FLASH_WRITE_SIZE));
      pkt = this._appendArray(pkt, this._int_to_bytearray(offset));

      if (
        (this.chip.CHIP_NAME === 'ESP32-S2' || this.chip.CHIP_NAME === 'ESP32-S3' || this.chip.CHIP_NAME === 'ESP32-C3')
        && (this.IS_STUB === false)
      ) {
        pkt = this._appendArray(pkt, this._int_to_bytearray(0));
      }
      if (this.chip.CHIP_NAME === 'ESP8266') {
        await this.flush_input();
      }
      await this.check_command({
        op_description: 'enter compressed flash mode', op: this.ESP_FLASH_DEFL_BEGIN, data: pkt, timeout,
      });
      const t2 = d.getTime();
      if (size !== 0 && this.IS_STUB === false) {
        this.log(`Took ${(t2 - t1) / 1000}.${(t2 - t1) % 1000}s to erase flash block`);
      }
      return num_blocks;
    }

    flash_block = async (data, seq, timeout) => {
      let pkt = this._appendArray(this._int_to_bytearray(data.length), this._int_to_bytearray(seq));
      pkt = this._appendArray(pkt, this._int_to_bytearray(0));
      pkt = this._appendArray(pkt, this._int_to_bytearray(0));
      pkt = this._appendArray(pkt, data);

      const checksum = this.checksum(data);

      await this.check_command({
        op_description: `write to target Flash after seq ${seq}`, op: this.ESP_FLASH_DATA, data: pkt, chk: checksum, timeout,
      });
    }

    flash_defl_block = async (data, seq, timeout) => {
      let pkt = this._appendArray(this._int_to_bytearray(data.length), this._int_to_bytearray(seq));
      pkt = this._appendArray(pkt, this._int_to_bytearray(0));
      pkt = this._appendArray(pkt, this._int_to_bytearray(0));
      pkt = this._appendArray(pkt, data);

      const checksum = this.checksum(data);
      // console.log(`flash_defl_block ${data[0].toString(16)}`, +' ' + data[1].toString(16));

      await this.check_command({
        op_description: `write compressed data to flash after seq ${seq}`,
        op: this.ESP_FLASH_DEFL_DATA,
        data: pkt,
        chk: checksum,
        timeout,
      });
    }

    flash_finish = async ({ reboot = false } = {}) => {
      const val = reboot ? 0 : 1;
      const pkt = this._int_to_bytearray(val);

      await this.check_command({ op_description: 'leave Flash mode', op: this.ESP_FLASH_END, data: pkt });
    }

    flash_defl_finish = async ({ reboot = false } = {}) => {
      const val = reboot ? 0 : 1;
      const pkt = this._int_to_bytearray(val);

      await this.check_command({ op_description: 'leave compressed flash mode', op: this.ESP_FLASH_DEFL_END, data: pkt });
    }

    run_spiflash_command = async (spiflash_command, data, read_bits) => {
      // SPI_USR register flags
      const SPI_USR_COMMAND = (1 << 31);
      const SPI_USR_MISO = (1 << 28);
      const SPI_USR_MOSI = (1 << 27);

      // SPI registers, base address differs ESP32* vs 8266
      const base = this.chip.SPI_REG_BASE;
      const SPI_CMD_REG = base + 0x00;
      const SPI_USR_REG = base + this.chip.SPI_USR_OFFS;
      const SPI_USR1_REG = base + this.chip.SPI_USR1_OFFS;
      const SPI_USR2_REG = base + this.chip.SPI_USR2_OFFS;
      const SPI_W0_REG = base + this.chip.SPI_W0_OFFS;

      let set_data_lengths;
      if (this.chip.SPI_MOSI_DLEN_OFFS != null) {
        set_data_lengths = async (mosi_bits, miso_bits) => {
          const SPI_MOSI_DLEN_REG = base + this.chip.SPI_MOSI_DLEN_OFFS;
          const SPI_MISO_DLEN_REG = base + this.chip.SPI_MISO_DLEN_OFFS;
          if (mosi_bits > 0) {
            await this.write_reg({ addr: SPI_MOSI_DLEN_REG, value: (mosi_bits - 1) });
          }
          if (miso_bits > 0) {
            await this.write_reg({ addr: SPI_MISO_DLEN_REG, value: (miso_bits - 1) });
          }
        };
      } else {
        set_data_lengths = async (mosi_bits, miso_bits) => {
          const SPI_DATA_LEN_REG = SPI_USR1_REG;
          const SPI_MOSI_BITLEN_S = 17;
          const SPI_MISO_BITLEN_S = 8;
          const mosi_mask = (mosi_bits === 0) ? 0 : (mosi_bits - 1);
          const miso_mask = (miso_bits === 0) ? 0 : (miso_bits - 1);
          const val = (miso_mask << SPI_MISO_BITLEN_S) | (mosi_mask << SPI_MOSI_BITLEN_S);
          await this.write_reg({ addr: SPI_DATA_LEN_REG, value: val });
        };
      }

      const SPI_CMD_USR = (1 << 18);
      const SPI_USR2_COMMAND_LEN_SHIFT = 28;
      if (read_bits > 32) {
        throw 'Reading more than 32 bits back from a SPI flash operation is unsupported';
      }
      if (data.length > 64) {
        throw 'Writing more than 64 bytes of data with one SPI command is unsupported';
      }

      const data_bits = data.length * 8;
      const old_spi_usr = await this.read_reg({ addr: SPI_USR_REG });
      const old_spi_usr2 = await this.read_reg({ addr: SPI_USR2_REG });
      let flags = SPI_USR_COMMAND;
      let i;
      if (read_bits > 0) {
        flags |= SPI_USR_MISO;
      }
      if (data_bits > 0) {
        flags |= SPI_USR_MOSI;
      }
      await set_data_lengths(data_bits, read_bits);
      await this.write_reg({ addr: SPI_USR_REG, value: flags });
      let val = (7 << SPI_USR2_COMMAND_LEN_SHIFT) | spiflash_command;
      await this.write_reg({ addr: SPI_USR2_REG, value: val });
      if (data_bits === 0) {
        await this.write_reg({ addr: SPI_W0_REG, value: 0 });
      } else {
        if (data.length % 4 !== 0) {
          const padding = new Uint8Array(data.length % 4);
          // eslint-disable-next-line no-param-reassign
          data = this._appendArray(data, padding);
        }
        let next_reg = SPI_W0_REG;
        for (i = 0; i < data.length - 4; i += 4) {
          val = this._bytearray_to_int(data[i], data[i + 1], data[i + 2], data[i + 3]);
          await this.write_reg({ addr: next_reg, value: val });
          next_reg += 4;
        }
      }
      await this.write_reg({ addr: SPI_CMD_REG, value: SPI_CMD_USR });
      for (i = 0; i < 10; i++) {
        val = await this.read_reg({ addr: SPI_CMD_REG }) & SPI_CMD_USR;
        if (val === 0) {
          break;
        }
      }
      if (i === 10) {
        throw 'SPI command did not complete in time';
      }
      const stat = await this.read_reg({ addr: SPI_W0_REG });
      await this.write_reg({ addr: SPI_USR_REG, value: old_spi_usr });
      await this.write_reg({ addr: SPI_USR2_REG, value: old_spi_usr2 });
      return stat;
    }

    read_flash_id = async () => {
      const SPIFLASH_RDID = 0x9F;
      const pkt = new Uint8Array(0);
      return this.run_spiflash_command(SPIFLASH_RDID, pkt, 24);
    }

    erase_flash = async () => {
      this.log('Erasing flash (this may take a while)...');
      let d = new Date();
      const t1 = d.getTime();
      const ret = await this.check_command({
        op_description: 'erase flash',
        op: this.ESP_ERASE_FLASH,
        timeout: this.CHIP_ERASE_TIMEOUT,
      });
      d = new Date();
      const t2 = d.getTime();
      this.log(`Chip erase completed successfully in ${(t2 - t1) / 1000}s`);
      return ret;
    }

    toHex(buffer) {
      return Array.prototype.map.call(buffer, (x) => (`00${x.toString(16)}`).slice(-2)).join('');
    }

    flash_md5sum = async (addr, size) => {
      const timeout = this.timeout_per_mb(this.MD5_TIMEOUT_PER_MB, size);
      let pkt = this._appendArray(this._int_to_bytearray(addr), this._int_to_bytearray(size));
      pkt = this._appendArray(pkt, this._int_to_bytearray(0));
      pkt = this._appendArray(pkt, this._int_to_bytearray(0));

      let res = await this.check_command({
        op_description: 'calculate md5sum', op: this.ESP_SPI_FLASH_MD5, data: pkt, timeout, min_data: 26,
      });
      if (res.length > 16) {
        res = res.slice(0, 16);
      }
      const strmd5 = this.toHex(res);
      return strmd5;
    }

    run_stub = async () => {
      this.log('Fetching stub...');

      const stub = await this._loadStub();
      // console.log(stub);
      const {
        data, text, data_start, text_start, entry,
      } = stub;

      this.log('Uploading stub...');

      let blocks = Math.floor((text.length + this.ESP_RAM_BLOCK - 1) / this.ESP_RAM_BLOCK);
      let i;

      await this.mem_begin(text.length, blocks, this.ESP_RAM_BLOCK, text_start);
      for (i = 0; i < blocks; i++) {
        const from_offs = i * this.ESP_RAM_BLOCK;
        let to_offs = from_offs + this.ESP_RAM_BLOCK;
        if (to_offs > text.length) to_offs = text.length;
        await this.mem_block(text.slice(from_offs, to_offs), i);
      }

      blocks = Math.floor((data.length + this.ESP_RAM_BLOCK - 1) / this.ESP_RAM_BLOCK);
      await this.mem_begin(data.length, blocks, this.ESP_RAM_BLOCK, data_start);
      for (i = 0; i < blocks; i++) {
        const from_offs = i * this.ESP_RAM_BLOCK;
        let to_offs = from_offs + this.ESP_RAM_BLOCK;
        if (to_offs > data.length) to_offs = data.length;
        await this.mem_block(data.slice(from_offs, to_offs), i);
      }

      this.log('Running stub...');
      let valid = false;
      await this.mem_finish(entry);

      if (this.chip.CHIP_NAME === 'ESP8266') {
        const [reply] = await this.sync();
        if (reply === 0) valid = true;
      } else {
        const res = await this.transport.read({ timeout: 1000, min_data: 6 });
        if (res[0] === 79 && res[1] === 72 && res[2] === 65 && res[3] === 73) {
          valid = true;
        }
      }

      if (valid) {
        this.log('Stub running...');
        this.IS_STUB = true;
        this.FLASH_WRITE_SIZE = 0x4000;
        return this.chip;
      }
      this.log('Failed to start stub. Unexpected response');
      return null;
    }

    main_fn = async () => {
      await this.detect_chip();
      if (this.chip == null) {
        this.log('Error in connecting to board');
        return;
      }

      const chip = await this.chip.get_chip_description(this);
      this.log(`Chip is ${chip}`);
      this.log(`Features: ${await this.chip.get_chip_features(this)}`);
      this.log(`Crystal is ${await this.chip.get_crystal_freq(this)}MHz`);
      this.log(`MAC: ${await this.chip.read_mac(this)}`);
      await this.chip.read_mac(this);

      if (this.chip.IS_STUB) await this.run_stub();
      else this.FLASH_WRITE_SIZE = this.chip.FLASH_WRITE_SIZE || 0x4000;
    }

    flash_size_bytes = (flash_size) => {
      let flash_size_b = -1;
      if (flash_size.indexOf('KB') !== -1) {
        flash_size_b = parseInt(flash_size.slice(0, flash_size.indexOf('KB')), 10) * 1024;
      } else if (flash_size.indexOf('MB') !== -1) {
        flash_size_b = parseInt(flash_size.slice(0, flash_size.indexOf('MB')), 10) * 1024 * 1024;
      }
      return flash_size_b;
    }

    pad_array = (arr, len, fillValue) => Object.assign(new Array(len).fill(fillValue), arr)

    parse_flash_size_arg = (flsz) => {
      if (typeof this.chip.FLASH_SIZES[flsz] === 'undefined') {
        this.log(`Flash size ${flsz} is not supported by this chip type. Supported sizes: ${this.chip.FLASH_SIZES}`);
        throw 'Invalid flash size';
      }
      return this.chip.FLASH_SIZES[flsz];
    }

    _update_image_flash_params = (image, address, flash_size, flash_mode, flash_freq) => {
      // console.log(`_update_image_flash_params ${flash_size} ${flash_mode} ${flash_freq}`);
      if (image.length < 8) {
        return image;
      }
      if (address !== this.chip.BOOTLOADER_FLASH_OFFSET) {
        return image;
      }
      if (flash_size === 'keep' && flash_mode === 'keep' && flash_freq === 'keep') {
        // console.log('Not changing the image');
        return image;
      }

      const magic = image[0];
      let a_flash_mode = image[2];
      const flash_size_freq = image[3];
      if (magic !== this.ESP_IMAGE_MAGIC) {
        this.log(`Warning: Image file at 0x${
          address.toString(16)
        } doesn't look like an image file, so not changing any flash settings.`);
        return image;
      }

      /* XXX: Yet to implement actual image verification */

      if (flash_mode !== 'keep') {
        const flash_modes = {
          qio: 0, qout: 1, dio: 2, dout: 3,
        };
        a_flash_mode = flash_modes[flash_mode];
      }
      let a_flash_freq = flash_size_freq & 0x0F;
      if (flash_freq !== 'keep') {
        const flash_freqs = {
          '40m': 0, '26m': 1, '20m': 2, '80m': 0xf,
        };
        a_flash_freq = flash_freqs[flash_freq];
      }
      let a_flash_size = flash_size_freq & 0xF0;
      if (flash_size !== 'keep') {
        a_flash_size = this.parse_flash_size_arg(flash_size);
      }

      const flash_params = (a_flash_mode << 8) | (a_flash_freq + a_flash_size);
      this.log(`Flash params set to ${flash_params.toString(16)}`);
      if (image[2] !== (a_flash_mode << 8)) {
        // eslint-disable-next-line no-param-reassign
        image[2] = (a_flash_mode << 8);
      }
      if (image[3] !== (a_flash_freq + a_flash_size)) {
        // eslint-disable-next-line no-param-reassign
        image[3] = (a_flash_freq + a_flash_size);
      }
      return image;
    }

    write_flash = async ({
      fileArray = [], flash_size = 'keep', flash_mode = 'keep', flash_freq = 'keep', erase_all = false, compress = true,
    } = {}) => {
      // console.log('EspLoader program');
      if (flash_size !== 'keep') {
        const flash_end = this.flash_size_bytes(flash_size);
        for (let i = 0; i < fileArray.length; i++) {
          if ((fileArray[i].data.length + fileArray[i].address) > flash_end) {
            this.log("Specified file doesn't fit in the available flash");
            return;
          }
        }
      }

      if (this.IS_STUB === true && erase_all === true) {
        this.erase_flash();
      }
      let image;
      let address;
      for (let i = 0; i < fileArray.length; i++) {
        // console.log(`Data Length ${fileArray[i].data.length}`);
        // image = this.pad_array(fileArray[i].data, Math.floor((fileArray[i].data.length + 3)/4) * 4, 0xff);
        // XXX : handle padding
        image = fileArray[i].data;
        address = fileArray[i].address;
        // console.log(`Image Length ${image.length}`);
        if (image.length === 0) {
          this.log('Warning: File is empty');
          // eslint-disable-next-line no-continue
          continue;
        }
        image = this._update_image_flash_params(image, address, flash_size, flash_mode, flash_freq);
        const calcmd5 = CryptoJS.MD5(CryptoJS.enc.Base64.parse(image.toString('base64')));
        // console.log(`Image MD5 ${calcmd5}`);
        const uncsize = image.length;
        let blocks;
        // console.log(image);
        if (compress) {
          // const uncimage = this.bstrToUi8(image);
          image = pako.deflate(image, { level: 9 });
          // console.log('Compressed image ');
          // console.log(image);
          blocks = await this.flash_defl_begin(uncsize, image.length, address);
        } else {
          blocks = await this.flash_begin(uncsize, address);
        }
        let seq = 0;
        let bytes_sent = 0;
        // const bytes_written = 0;

        let d = new Date();
        const t1 = d.getTime();

        let timeout = 5000;
        while (image.length > 0) {
          // console.log(`Write loop ${address} ${seq} ${blocks}`);
          this.write_char(`\rWriting at 0x${
            (address + (seq * this.FLASH_WRITE_SIZE)).toString(16)
          }... (${
            Math.floor(100 * ((seq + 1) / blocks))
          }%)`);
          let block = image.slice(0, this.FLASH_WRITE_SIZE);
          if (compress) {
            /*
                    let block_uncompressed = pako.inflate(block).length;
                    //let len_uncompressed = block_uncompressed.length;
                    bytes_written += block_uncompressed;
                    if (this.timeout_per_mb(this.ERASE_WRITE_TIMEOUT_PER_MB, block_uncompressed) > 3000) {
                        block_timeout = this.timeout_per_mb(this.ERASE_WRITE_TIMEOUT_PER_MB, block_uncompressed);
                    } else {
                        block_timeout = 3000;
                    } */ // XXX: Partial block inflate seems to be unsupported in Pako. Hardcoding timeout
            const block_timeout = 5000;
            if (this.IS_STUB === false) {
              timeout = block_timeout;
            }
            await this.flash_defl_block(block, seq, timeout);
            if (this.IS_STUB) {
              timeout = block_timeout;
            }
          } else {
            // this.log('Yet to handle Non Compressed writes');
            // block = block + b'\xff' * (esp.FLASH_WRITE_SIZE - len(block))
            if (block.length < this.FLASH_WRITE_SIZE) {
              const existingBlock = block.toString('base64');
              block = Buffer.alloc(this.FLASH_WRITE_SIZE, 0xff);
              block.write(existingBlock, 'base64');
            }
            // if encrypted:
            //     esp.flash_encrypt_block(block, seq)
            // else:
            //     esp.flash_block(block, seq)
            // bytes_written += len(block)
            await this.flash_block(block, seq, timeout);
          }
          bytes_sent += block.length;
          image = image.slice(this.FLASH_WRITE_SIZE, image.length);
          seq++;
        }
        if (this.IS_STUB) {
          await this.read_reg({ addr: this.CHIP_DETECT_MAGIC_REG_ADDR, timeout });
        }
        d = new Date();
        const t = d.getTime() - t1;
        this.log('');
        this.log(`Wrote ${uncsize} bytes${
          compress ? ` (${bytes_sent} compressed)` : ''
        } at 0x${address.toString(16)} in ${t / 1000} seconds.`);
        this._sleep(100);
        if (this.IS_STUB || this.chip.CHIP_NAME !== 'ESP8266') {
          const res = await this.flash_md5sum(address, uncsize);
          if (`${res}` !== `${calcmd5}`) {
            this.log(`File  md5: ${calcmd5}`);
            this.log(`Flash md5: ${res}`);
          } else {
            this.log('Hash of data verified.');
          }
        }
      }
      this.log('Leaving...');

      if (this.IS_STUB) {
        await this.flash_begin(0, 0);
        if (compress) {
          await this.flash_defl_finish();
        } else {
          await this.flash_finish();
        }
      }
    }

    flash_id = async () => {
      // console.log('flash_id');
      const flashid = await this.read_flash_id();
      this.log(`Manufacturer: ${(flashid & 0xff).toString(16)}`);
      const flid_lowbyte = (flashid >> 16) & 0xff;
      this.log(`Device: ${((flashid >> 8) & 0xff).toString(16)}${flid_lowbyte.toString(16)}`);
      this.log(`Detected flash size: ${this.DETECTED_FLASH_SIZES[flid_lowbyte] || 'Unknown'}`);
    }
}
