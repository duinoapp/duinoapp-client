<template>
  <v-chip small :color="color">{{ping}} ms</v-chip>
</template>

<script>
export default {
  props: {
    ping: {
      type: Number,
      default: -1,
    },
  },
  computed: {
    color() {
      if (this.ping < 0) return 'default';
      if (this.ping < 100 ) return 'success';
      if (this.ping < 250 ) return 'warning';
      return 'error';
    },
  },
}
</script>