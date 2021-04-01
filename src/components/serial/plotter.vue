<template>
  <div style="height: calc(50vh - 52px)">
    <div :id="id" :style="{ height }" />
    <div class="plot-tools">
      <v-row class="px-4">
        <v-col cols="2" class="py-0">
          <v-select v-model="timeWindow" :items="windows" dense hide-details />
        </v-col>
        <v-col cols="2" class="py-0">
          <rate />
        </v-col>
        <v-col cols="auto" class="py-0 mr-6">
          <v-tooltip top>
            <template #activator="{ on }">
              <v-btn icon @click="clearCB && clearCB()" v-on="on">
                <v-icon>mdi-cancel</v-icon>
              </v-btn>
            </template>
            <span>Clear Monitor</span>
          </v-tooltip>
          <v-tooltip top>
            <template #activator="{ on }">
              <v-btn icon @click="paused = !paused" v-on="on">
                <v-icon>mdi-{{ paused ? 'play' : 'pause'}}</v-icon>
              </v-btn>
            </template>
            <span>{{ paused ? 'Play' : 'Pause'}} Monitor</span>
          </v-tooltip>
          <v-tooltip top>
            <template #activator="{ on }">
              <v-btn icon @click="chartOpts.axisY.includeZero = !chartOpts.axisY.includeZero" v-on="on">
                <v-icon>mdi-{{ chartOpts.axisY.includeZero ? 'arrow-up-down' : 'arrow-vertical-lock'}}</v-icon>
              </v-btn>
            </template>
            <span>{{ chartOpts.axisY.includeZero ? 'Auto Scale Y' : 'Lock Y to Zero'}}</span>
          </v-tooltip>
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<script>
/* eslint-disable no-param-reassign */
import Rate from './rate.vue';

export default {
  components: {
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
      data: null,
      chart: null,
      paused: false,
      logCB: null,
      clearCB: null,
      lastRender: 0,
      timeWindow: 60,
      buff: '',
      id: '',
      dataOpts: {
        xValueType: 'dateTime',
        xValueFormatString: '',
      },
      chartOpts: {
        axisY: {
          includeZero: false,
        },
      },
      windows: [
        { text: '1 Second', value: 1 },
        { text: '10 Seconds', value: 10 },
        { text: '30 Seconds', value: 30 },
        { text: '1 Minute', value: 60 },
        { text: '2 Minutes', value: 120 },
        { text: '5 Minutes', value: 300 },
        { text: '10 Minutes', value: 600 },
      ],
    };
  },
  mounted() {
    this.initChart();
    this.logCB = (data) => {
      const now = Date.now();
      this.buff += data;
      const parts = this.buff.split(/\r?\n/g);
      if (parts.length < 2) return;
      this.buff = /\r?\n$/.test(this.buff) ? '' : parts.pop();
      parts.forEach((part) => {
        const nums = part.split(/[\s,]+/g)
          .map((num) => (num !== '' ? Number(num) : NaN))
          .map((num) => (Number.isNaN(num) ? null : num));
        if (!nums.some((num) => num !== null)) return;
        if (nums.length > this.data.length) {
          for (let i = 0; i < nums.length - this.data.length; i += 1) {
            this.data.push({
              type: 'line', dataPoints: [], pausedData: [], ...this.dataOpts,
            });
          }
        }
        this.data.forEach((datum, i) => {
          if (typeof nums[i] === 'number') datum.pausedData.push({ x: now, y: nums[i] });
          if (this.paused) {
            datum.pausedData = datum.pausedData.filter((point) => now - point.x <= this.timeWindow * 1000);
            return;
          }
          datum.dataPoints = [
            ...datum.dataPoints,
            ...datum.pausedData,
          ].filter((point) => now - point.x <= this.timeWindow * 1000);
          datum.pausedData = [];
        });
      });
      if (now - this.lastRender > 50 && this.chart) {
        this.lastRender = now;
        try {
          this.chart.render();
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error(err);
        }
      }
    };
    this.$serial.on('message', this.logCB);
    this.clearCB = () => {
      this.initChart();
    };
    this.$serial.on('clear', this.clearCB);
  },
  methods: {
    initChart() {
      this.id = `chart-container-${Math.random()}`.replace('0.', '');
      this.data = [];
      this.$nextTick(() => {
        this.chart = new window.CanvasJS.Chart(this.id, {
          data: this.data,
          ...this.chartOpts,
        });
      });
    },
  },
  beforeDestroy() {
    if (this.logCB) this.$serial.off('message', this.logCB);
    if (this.clearCB) this.$serial.off('clear', this.clearCB);
  },
};
</script>

<style lang="scss">
.plot-tools {
  position: absolute;
  width: 100%;
  bottom: 12px;
}
</style>
