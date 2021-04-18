<template>
  <v-tooltip v-bind="{ top, bottom }">
    <template #activator="{ on }">
      <span v-on="on">
        <v-btn icon text @click="run" :disabled="!valid">
          <v-icon>mdi-play-network-outline</v-icon>
        </v-btn>
      </span>
    </template>
    <div class="text-center">
      <strong>Compile &amp; Upload</strong>
      <br>
      <span :class="{ 'error--text': !this.currentServer, 'success--text': !!this.currentServer }">
        <v-icon :color="this.currentServer ? 'success' : 'error'" small>
          mdi-{{this.currentServer ? 'check' : 'close'}}-circle-outline
        </v-icon>
        Server Selected
      </span>
      <br>
      <span :class="{ 'error--text': !this.currentBoard, 'success--text': !!this.currentBoard }">
        <v-icon :color="this.currentBoard ? 'success' : 'error'" small>
          mdi-{{this.currentBoard ? 'check' : 'close'}}-circle-outline
        </v-icon>
        Board Selected
      </span>
      <br>
      <span :class="{ 'error--text': !this.currentProject, 'success--text': !!this.currentProject }">
        <v-icon :color="this.currentProject ? 'success' : 'error'" small>
          mdi-{{this.currentProject ? 'check' : 'close'}}-circle-outline
        </v-icon>
        Project Selected
      </span>
      <br>
      <span :class="{ 'error--text': !this.currentDevice, 'success--text': !!this.currentDevice }">
        <v-icon :color="this.currentDevice ? 'success' : 'error'" small>
          mdi-{{this.currentDevice ? 'check' : 'close'}}-circle-outline
        </v-icon>
        Serial Device Selected
      </span>
    </div>
  </v-tooltip>
</template>

<script>
import { mapMutations } from 'vuex';

export default {
  props: {
    top: {
      type: Boolean,
      default: false,
    },
    bottom: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      deviceCB: null,
      currentDevice: null,
    };
  },
  computed: {
    currentServer() {
      const { Server } = this.$FeathersVuex.api;
      return Server.findInStore({ query: { uuid: this.$store.getters.currentServer } }).data[0];
    },
    currentBoard() {
      const { Board } = this.$FeathersVuex.api;
      return Board.findInStore({ query: { uuid: this.$store.getters.currentBoard } }).data[0];
    },
    currentProject() {
      const { Project } = this.$FeathersVuex.api;
      return Project.findInStore({ query: { uuid: this.$store.getters.currentProject } }).data[0];
    },
    valid() {
      return !!(
        this.currentServer
        && this.currentBoard
        && this.currentProject
        && this.currentDevice
      );
    },
  },
  methods: {
    ...mapMutations(['toggleSerialShelf', 'setSerialTab']),
    run() {
      this.toggleSerialShelf(false);
      this.setSerialTab('monitor');
      setTimeout(() => {
        this.toggleSerialShelf(true);
        this.setSerialTab('program');
        this.$compiler.upload();
      }, 100);
    },
  },
  mounted() {
    setTimeout(() => {
      this.currentDevice = this.$serial.currentDevice || null;
      this.deviceCB = (value) => { this.currentDevice = value; };
      this.$serial.on('currentDevice', this.deviceCB);
    }, this.$serial ? 100 : 1000);
  },
  beforeDestroy() {
    if (this.deviceCB) this.$serial.off('currentDevice', this.deviceCB);
  },
};
</script>
