<template>
  <div>
    <v-tooltip top v-if="currentServer">
      <template v-slot:activator="{ on }">
        <v-btn text dense small to="/tools/servers" v-on="on">
        <v-icon v-show="$vuetify.breakpoint.mdAndDown" small left>mdi-server</v-icon>
        <span v-show="!$vuetify.breakpoint.mdAndDown">Server:</span>
          <v-chip
            :color="currentServer.valid ? 'success' : 'error'"
            class="mx-1"
            x-small
          >
            {{currentServer.valid ? 'Online' : 'Offline'}}
          </v-chip>
        </v-btn>
      </template>
      <span>{{flag}} {{currentServer.name}}</span>
    </v-tooltip>
    <v-btn v-else text dense small to="/tools/servers">Select Server</v-btn>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { countryCodeEmoji } from 'country-code-emoji';

export default {
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
    flag() {
      return this.currentServer.country && countryCodeEmoji(this.currentServer.country);
    },
  },
};
</script>
