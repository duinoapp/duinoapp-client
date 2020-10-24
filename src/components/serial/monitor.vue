<template>
  <div>
    <terminal ref="term" :cols="73" />
    <v-row>
      <v-col cols="2" class="py-0 mr-6">
        <rate />
      </v-col>
    </v-row>
  </div>
</template>

<script>
import Terminal from '../terminal/terminal.vue';
import Rate from './rate.vue';

export default {
  components: {
    Terminal,
    Rate,
  },
  data() {
    return {
      logCB: null,
      clearCB: null,
    };
  },
  mounted() {
    this.logCB = (data) => {
      this.$refs.term.write(data);
    };
    this.$serial.on('message', this.logCB);
    this.clearCB = () => {
      this.$refs.term.clear();
    };
    this.$serial.on('clear', this.clearCB);
  },

  beforeDestroy() {
    this.$serial.on('message', this.logCB);
    this.$serial.on('clear', this.clearCB);
  },
};
</script>
