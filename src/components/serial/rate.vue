<template>
  <v-select
    :value="$serial.baud"
    :items="rates"
    dense
    hide-details
    @input="$serial.setBaud($event)"
  />
</template>

<script>
export default {
  data() {
    return {
      rates: [
        115200,
        57600,
        38400,
        19200,
        9600,
        4800,
        2400,
        1800,
        1200,
        600,
        300,
      ].map((value) => ({ text: `${value} baud`, value })),
    };
  },
};
</script>
