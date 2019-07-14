<template>
  <v-dialog v-model="dialog" max-width="500">
    <v-btn flat dense small slot="activator">Server: <flag :iso="currentServer.location" /> <ping-bubble :ping="currentServer.ping" /></v-btn>
    <v-card>
      <v-card-title class="headline">
        Servers
        <v-spacer/>
        <v-btn>Custom Server</v-btn>
      </v-card-title>
      <server-picker/>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapGetters } from 'vuex';
import pingBubble from './ping-bubble.vue';
import serverPicker from './picker.vue';

export default {
  components: {
    pingBubble,
    serverPicker,
  },
  data() {
    return {
      dialog: false,
    };
  },
  computed: {
    ...mapGetters('servers', { currentServer: 'current' }),
  },
}
</script>
