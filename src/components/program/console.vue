<template>
  <div>
    <v-progress-linear
      :value="percentage*100"
      height="25"
    >
      <strong>{{ Math.ceil(percentage*100) }}% - {{message}}</strong>
    </v-progress-linear>
  </div>
</template>

<script>
export default {
  data() {
    return {
      percentage: 1,
      message: 'Ready',
    };
  },
  mounted() {
    this.$compiler.on('console.progress', (data) => {
      this.percentage = data.percent;
      this.message = data.message;
    });
  },
};
</script>
