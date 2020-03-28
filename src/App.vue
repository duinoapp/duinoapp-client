<template>
  <v-app>
    <div>
      <v-app-bar app dense clipped-left :clipped-right="serialShelf.value" elevation="2">
        <v-btn text to="/" active-class="foobar">
          <v-img
            :src="require('./assets/logo.svg')"
            alt="Home"
            contain
            height="100%"
            width="2em"
          />
        </v-btn>
        <v-btn text dense to="/code"><v-icon left>mdi-code-braces</v-icon>Code</v-btn>
        <v-btn text dense to="/tools"><v-icon left>mdi-wrench</v-icon>Tools</v-btn>
        <v-btn text dense to="/tools/about"><v-icon left>mdi-information</v-icon>About</v-btn>
        <v-spacer/>
        <compile-btn />
        <upload-btn />
        <v-btn text dense @click="toggleSerialShelf"><v-icon left>mdi-console</v-icon>Serial</v-btn>
      </v-app-bar>
    </div>

    <router-view />

    <v-navigation-drawer
      app clipped
      absolue
      :permanent="serialShelf.value"
      hide-overlay
      right
      :value="serialShelf.value"
      width="400px"
    >
      <compile-console />
    </v-navigation-drawer>

    <v-footer dense app>
      <div>&copy; {{ new Date().getFullYear() }}</div>
      <v-spacer/>
      <serial-footer v-if="serialReady" />
      <board-footer />
      <server-footer />
    </v-footer>
    <serial-prompts />
  </v-app>
</template>

<script>
import BoardFooter from './components/boards/footer-btn.vue';
import ServerFooter from './components/servers/footer-btn.vue';
import SerialFooter from './components/serial/footer-btn.vue';
import SerialPrompts from './components/serial/prompts.vue';
import CompileBtn from './components/program/compile.vue';
import UploadBtn from './components/program/upload.vue';
import CompileConsole from './components/program/console.vue';

export default {
  name: 'App',
  components: {
    ServerFooter,
    BoardFooter,
    SerialPrompts,
    SerialFooter,
    CompileBtn,
    CompileConsole,
    UploadBtn,
  },
  data() {
    return {
      serialReady: false,
      serialShelf: {},
    };
  },
  methods: {
    checkSerialReady() {
      if (this.$serial) this.serialReady = true;
      else setTimeout(() => this.checkSerialReady(), 100);
    },
    async loadSerialShelfSetting() {
      const { Setting } = this.$FeathersVuex;
      const settings = await Setting.find({ query: { key: 'serial.shelf' } });
      let setting;
      if (!settings.length) {
        setting = new Setting({
          key: 'serial.shelf',
          value: false,
        });
        await setting.save();
      } else {
        setting = settings.shift();
        settings.forEach(set => set.remove()); // remove any duplicates
      }
      this.serialShelf = setting;
    },
    async toggleSerialShelf() {
      this.serialShelf.value = !this.serialShelf.value;
      // this.$set(this.serialShelf, 'value', !this.serialShelf.value);
      this.serialShelf.save();
    },
  },
  mounted() {
    this.$currentStore.load('boards');
    this.$currentStore.load('projects');
    this.$currentStore.load('files');
    this.loadSerialShelfSetting();
    this.checkSerialReady();
  },
};
</script>

<style lang="scss">
@import '../node_modules/xterm/css/xterm.css';
</style>
