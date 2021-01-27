<template>
  <div>
    <terminal ref="term" :height="height" />
    <v-row class="px-4">
      <v-col cols="2" class="py-0">
        <rate />
      </v-col>
      <v-col cols="auto" class="py-0 mr-6">
        <v-tooltip top>
          <template #activator="{ on }">
            <v-btn icon @click="$refs.term.clear()" v-on="on">
              <v-icon>mdi-cancel</v-icon>
            </v-btn>
          </template>
          <span>Clear Monitor</span>
        </v-tooltip>
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
  props: {
    height: {
      type: String,
      default: '',
    },
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
    if (this.logCB) this.$serial.off('message', this.logCB);
    if (this.clearCB) this.$serial.off('clear', this.clearCB);
  },
};
</script>
