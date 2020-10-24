<template>
  <div>
    <v-progress-linear
      :value="percentage*100"
      height="25"
    >
      <strong>{{ Math.ceil(percentage*100) }}% - {{message}}</strong>
    </v-progress-linear>
    <terminal ref="term" :cols="73" />
  </div>
</template>

<script>
import Terminal from '../terminal/terminal.vue';

export default {
  components: {
    Terminal,
  },
  data() {
    return {
      percentage: 1,
      message: 'Ready',
      progressCB: null,
      logCB: null,
      clearCB: null,
    };
  },
  mounted() {
    this.progressCB = (data) => {
      this.percentage = data.percent;
      this.message = data.message;
    };
    this.$compiler.on('console.progress', this.progressCB);
    this.logCB = (data) => {
      this.$refs.term.write(data);
    };
    this.$compiler.on('console.log', this.logCB);
    this.$compiler.on('console.error', this.logCB);
    this.clearCB = () => {
      this.$refs.term.clear();
    };
    this.$compiler.on('console.clear', this.clearCB);
    setTimeout(() => {
      this.$refs.term.write('Press the compile/program button above to begin.');
      console.log(this.$refs.term);
    }, 500);
  },

  beforeDestroy() {
    this.$compiler.off('console.progress', this.progressCB);
    this.$compiler.off('console.log', this.logCB);
    this.$compiler.off('console.error', this.logCB);
    this.$compiler.off('console.clear', this.clearCB);
  },
};
</script>
