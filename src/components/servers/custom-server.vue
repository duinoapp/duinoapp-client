<template>
  <div>
    <v-text-field
      v-model="url"
      label="Server Address"
      :error-messages="err ? [err] : []"
      @change="checkUrl"
      hint="https://example.com"
      :color="serverData ? 'success' : undefined"
    >
      <template v-slot:label>
        Server Address
        <v-chip v-show="serverData" color="success" small class="py-0">
          Valid
        </v-chip>
      </template>
    </v-text-field>
    <v-btn @click="addServer" class="ml-2">
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

export default {
  data() {
    return {
      url: '',
      serverData: null,
      err: '',
      success: false,
    };
  },
  computed: {
    address() {
      const protocol = this.url.includes('http://') ? 'http://' : 'https://';
      return `${protocol}${this.url.trim().replace(/\/$/, '').replace(/^https?:\/\//, '')}`;
    },
  },
  methods: {
    async checkUrl() {
      if (!this.url) return;
      const { Server } = this.$FeathersVuex.api;
      this.serverData = null;
      this.err = '';
      const serv = { address: this.address };
      if ((await Server.find({ query: serv })).length) {
        this.err = 'Server already exists.';
        return;
      }
      try {
        this.serverData = await this.$compiler.serverReq('info/server', null, serv);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
        this.err = 'Invalid server address.';
      }
      if (!this.serverData) {
        this.err = 'Unable to connect to the server.';
      }
    },
    async addServer() {
      await this.checkUrl();
      if (!this.serverData) return;
      const { Server } = this.$FeathersVuex.api;
      const server = new Server({
        ...this.serverData,
        isCustom: true,
        address: this.address,
        valid: true,
      });
      await server.save();
      this.url = '';
      this.serverData = null;
      this.success = true;
      this.$store.commit('setCurrentServer', server.uuid);
    },
  },
};
</script>

<style lang="scss" scoped>
div {
  display: flex;
  align-items: baseline;
}
</style>
