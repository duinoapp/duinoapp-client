<template>
  <v-menu top v-model="menu" offset-y>
    <!-- eslint-disable-next-line vue/no-unused-vars -->
    <template #activator="{ on }">
      <v-btn text dense small @click="activate(on)" v-if="currentDevice">
        <v-icon v-show="$vuetify.breakpoint.mdAndDown" small left>mdi-usb-port</v-icon>
        <span v-show="!$vuetify.breakpoint.mdAndDown">Serial:</span>
        {{deviceName}}
      </v-btn>
      <v-btn text dense small @click="activate" v-else>Select Device</v-btn>
    </template>
    <v-list dense :style="{ padding: '0' }">
      <v-list-item
        v-for="device in devices"
        :key="device.value"
        @click="$serial.setCurrentDevice(device.value)"
      >
        <v-list-item-title>{{device.name}}</v-list-item-title>
      </v-list-item>
      <v-divider v-if="devices.length" />
      <v-list-item
        v-if="$serial.requestRequired"
        @click="$serial.requestDevice()"
      >
        <v-list-item-title>
          <v-icon left>mdi-plus</v-icon>
          Add New Device
        </v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script>

export default {
  data() {
    return {
      menu: false,
      devices: [],
      currentDevice: (this.$serial && this.$serial.currentDevice) || null,
      deviceCB: null,
    };
  },
  computed: {
    deviceName() {
      if (!this.currentDevice) return '';
      return (this.devices.find((d) => d.value === this.currentDevice) || {
        name: this.$serial.handlesSelect ? 'Selected' : 'Unknown',
      }).name;
    },
  },
  watch: {
    async menu(v) {
      if (v) this.devices = await this.$serial.listDevices();
    },
  },
  mounted() {
    this.currentDevice = this.$serial.currentDevice || null;
    this.deviceCB = (value) => { this.currentDevice = value; };
    this.$serial.on('currentDevice', this.deviceCB);
  },
  beforeDestroy() {
    if (this.deviceCB) this.$serial.off('currentDevice', this.deviceCB);
  },
  methods: {
    activate() {
      if (this.$serial.handlesSelect) {
        this.$serial.requestDevice();
      } else {
        this.menu = true;
      }
    },
  },
};
</script>
