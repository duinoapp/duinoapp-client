<template>
  <v-btn icon text @click="$compiler.compile()" :disabled="!valid">
    <v-icon>mdi-code-tags-check</v-icon>
  </v-btn>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  computed: {
    ...mapGetters(['currentBoard', 'currentProject', 'currentServer']),
    valid() {
      return !!(this.currentServer
        && this.currentBoard
        && this.currentProject);
    },
  },
  mounted() {
    this.$compiler.on('console.log', console.log);
    this.$compiler.on('console.error', console.error);
  },
};
</script>
