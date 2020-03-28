<template>
  <v-btn icon text @click="$compiler.upload()" :disabled="!valid">
    <v-icon>mdi-play-network-outline</v-icon>
  </v-btn>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  computed: {
    ...mapGetters('boards', { currentBoard: 'current' }),
    ...mapGetters('projects', { currentProject: 'current' }),
    ...mapGetters('servers', { currentServer: 'current' }),
    valid() {
      return !!(
        this.currentServer
        && this.currentBoard
        && this.currentProject
        && this.$serial && this.$serial.currentDevice
      );
    },
  },
  mounted() {
    // this.$compiler.on('console.log', console.log);
    // this.$compiler.on('console.error', console.error);
  },
};
</script>
