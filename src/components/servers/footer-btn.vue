<template>
  <div>
    <v-btn text dense small v-if="currentServer" to="/tools/servers">
      Server:
      &nbsp;<ping-bubble :ping="currentServer.ping" />
      &nbsp;<flag :iso="currentServer.country" />
    </v-btn>
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
    ...mapGetters('servers', { currentServer: 'current' }),
  },
};
</script>
