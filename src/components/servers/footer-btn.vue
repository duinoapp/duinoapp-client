<template>
  <div>
    <v-tooltip top v-if="currentServer">
      <template v-slot:activator="{ on }">
        <v-btn text dense small to="/tools/servers" v-on="on">
          Server:
          <ping-bubble :ping="currentServer.ping" class="mx-1" />
          <flag :iso="currentServer.country" />
        </v-btn>
      </template>
      <span>{{currentServer.name}}</span>
    </v-tooltip>
    <v-btn text dense small v-else to="/tools/servers">Select Server</v-btn>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import pingBubble from './ping-bubble.vue';

export default {
  components: {
    pingBubble,
  },
  data() {
    return {
      dialog: false,
    };
  },
  computed: {
    ...mapGetters({ currentServerId: 'currentServer' }),
    currentServer() {
      const { Server } = this.$FeathersVuex.api;
      return Server.findInStore({ query: { uuid: this.currentServerId } }).data[0] || {};
    },
  },
};
</script>
