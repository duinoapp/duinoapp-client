<template>
  <div>
    <v-text-field
      v-model="url"
      label="Server Address"
      :error-messages="err ? [err] : []"
      @change="checkUrl"
      hint="https://example.com"
      :color="serverData && serverData.ping > 0 ? 'success' : undefined"
    >
      <template v-slot:label>
        Server Address
        <ping-bubble v-if="serverData && serverData.ping > 0" :ping="serverData.ping"/>
      </template>
    </v-text-field>
    &nbsp;
    <v-btn @click="addServer" :disabled="!serverData || serverData.ping <= 0">
      <v-icon left>mdi mdi-plus</v-icon>
      Add Server
    </v-btn>
    <v-snackbar
      v-model="success"
      bottom
      color="success"
      multi-line
      :timeout="5000"
    >
      Successfully added new server
      <v-btn dark text icon @click="success = false">
        <v-icon dark>mdi mdi-close</v-icon>
      </v-btn>
    </v-snackbar>
  </div>
</template>

<script>
import { mapMutations } from 'vuex';
import PingBubble from './ping-bubble.vue';

export default {
  components: {
    PingBubble,
  },
  data() {
    return {
      url: '',
      serverData: null,
      err: '',
      success: false,
    };
  },
  methods: {
    ...mapMutations('servers', ['setCurrent']),
    async checkUrl() {
      if (!this.url) return;
      this.serverData = null;
      this.err = '';
      try {
        this.serverData = await this.$compiler.pingServer(this.url, 500);
      } catch (err) {
        console.error(err);
        this.err = 'Invalid server address.';
      }
      if (this.serverData && this.serverData.ping <= 0) {
        this.err = 'Unable to connect to the server.';
      }
    },
    async addServer() {
      await this.checkUrl();
      if (!this.serverData || this.serverData.ping <= 0) return;
      const { Server } = this.$FeathersVuex;
      const server = new Server({ ...this.serverData, isCustom: true, address: this.url });
      await server.save();
      this.url = '';
      this.serverData = {};
      this.success = true;
      this.setCurrent(server);
    },
  },
};
</script>

<style lang="stylus" scoped>
div {
  display flex
  align-items baseline
}
</style>
