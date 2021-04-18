<template>
  <div style="height: calc(50vh - 52px)">
    <terminal ref="term" :height="height" />
    <div class="monitor-tools">
      <v-row class="px-4" align="center">
        <v-col class="py-0">
          <v-text-field
            v-model="text"
            dense
            hide-details
            append-outer-icon="mdi-send"
            autocomplete="off"
            @click:append-outer="send"
            @keydown.enter="send"
          />
        </v-col>
        <v-col cols="auto" class="py-0">
          <v-checkbox
            v-model="newline"
            hide-details
            class="mt-0"
          >
            <template #label>
              <div>
                NL
                <v-tooltip top>
                  <template #activator="{ on }">
                    <v-icon small class="ml-1 mb-1" v-on="on">mdi-information-outline</v-icon>
                  </template>
                  <span>Append a new line character (\n) to the end before sending</span>
                </v-tooltip>
              </div>
            </template>
          </v-checkbox>
        </v-col>
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
      newline: `${window.localStorage.newline}` === 'true',
      text: '',
      logCB: null,
      clearCB: null,
    };
  },
  methods: {
    send() {
      if (!this.text || !this.$serial.connected) return;
      this.$serial.write(`${this.text}${this.newline ? '\n' : ''}`);
      this.text = '';
    },
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
  watch: {
    newline(to) {
      window.localStorage.newline = to;
    },
  },
};
</script>

<style lang="scss">
.monitor-tools {
  position: absolute;
  width: 100%;
  bottom: 12px;
}
</style>
