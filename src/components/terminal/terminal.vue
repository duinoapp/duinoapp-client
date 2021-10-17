<template>
  <div :id="id" :style="{ height, width: '100%' }" />
</template>

<script>
import 'xterm/css/xterm.css';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';

export default {
  props: {
    height: {
      type: String,
      default: '-webkit-fill-available',
    },
  },
  data() {
    return {
      id: `xterm-${Math.random()}`,
    };
  },
  mounted() {
    const term = new Terminal({
      disableStdin: true,
      ...(this.$attrs || {}),
    });
    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(document.getElementById(this.id));
    fitAddon.fit();
    this.$terminal = term;
  },
  beforeDestroy() {
    this.$terminal.dispose();
  },
  methods: {
    write(val = '') {
      if (typeof val !== 'string') return;
      this.$terminal.write(val.replace(/\r\n/g, '\n').replace(/\n/g, '\r\n'));
    },
    clear() {
      this.$terminal.write('\r\n');
      this.$terminal.clear();
    },
    focus() {
      this.$terminal.focus();
    },
    blur() {
      this.$terminal.blur();
    },
    fit() {
      this.$terminal.fit();
    },
    cols() {
      return this.$terminal.cols;
    },
  },
};
</script>
