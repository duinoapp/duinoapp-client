<template>
  <v-app>
    <div>
      <v-app-bar app dense clipped-left elevation="2" class="main-toolbar">
        <v-btn text to="/" active-class="foobar">
          <v-img
            :src="require('./assets/logo.svg')"
            alt="Home"
            contain
            height="100%"
            width="2em"
          />
        </v-btn>
        <v-btn text dense to="/code" class="mx-1">
          <v-icon left>mdi-code-braces</v-icon>
          Code
        </v-btn>
        <v-btn text dense to="/tools/libraries" class="mx-1">
          <v-icon left>mdi-book-open-variant</v-icon>
          Libraries
        </v-btn>
        <v-btn text dense to="/tools" class="mx-1">
          <v-icon left>mdi-wrench</v-icon>
          Tools
        </v-btn>
        <v-btn text dense to="/tools/about" class="mx-1">
          <v-icon left>mdi-information</v-icon>
          About
        </v-btn>
        <v-spacer/>
        <compile-btn bottom />
        <upload-btn bottom />
        <v-btn text dense @click="toggleSerialShelf">
          <v-icon left>mdi-console</v-icon>Serial
        </v-btn>
      </v-app-bar>
    </div>

    <router-view />

    <v-navigation-drawer
      :value="$store.getters.serialShelf"
      mobile-breakpoint="9999999"
      style="bottom: 40px"
      class="elevation-0"
      app
      absolue
      bottom
      @input="toggleSerialShelf($event)"
    >
      <div>
        <div>
          <v-tabs class="shelf-tabs" :value="$store.getters.serialTab" @change="setSerialTab">
            <v-tab href="#program">Program</v-tab>
            <v-tab href="#monitor">Monitor</v-tab>
            <v-tab href="#plotter">Plot</v-tab>
          </v-tabs>
        </div>
        <div class="right-actions">
          <compile-btn top />
          <upload-btn top />
          <v-btn class="ml-2" icon @click="toggleSerialShelf">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
      </div>
      <v-tabs-items :value="$store.getters.serialTab" @change="setSerialTab">
        <v-tab-item value="program" eager>
          <compile-console height="calc(50vh - 73px)"/>
        </v-tab-item>
        <v-tab-item value="monitor">
          <serial-monitor height="calc(50vh - 96px)"/>
        </v-tab-item>
        <v-tab-item value="plotter">
          <serial-plotter height="calc(50vh - 96px)"/>
        </v-tab-item>
      </v-tabs-items>
    </v-navigation-drawer>

    <v-footer dense app style="z-index: 10">
      <v-row style="display: contents;">
        <div style="line-height: 28px;">
          <small>
            Duino App
            &copy;
            {{ (new Date()).getFullYear() }}
            &dash;
            v{{version}}
          </small>
        </div>
        <div :class="{ 'ml-2': true, 'mr-auto': $vuetify.breakpoint.mdAndDown }">
          <v-tooltip top>
            <template #activator="{ on }">
              <v-btn
                href="https://github.com/duinoapp/duinoapp-client/issues"
                target="_blank"
                rel="noopener noreferrer"
                :text="!$vuetify.breakpoint.mdAndDown"
                :icon="$vuetify.breakpoint.mdAndDown"
                small
                v-on="on"
              >
                <v-icon small left>mdi-bug-outline</v-icon>
                {{ !$vuetify.breakpoint.mdAndDown ? 'Issues' : '' }}
              </v-btn>
            </template>
            <span>Report an Issue/Bug</span>
          </v-tooltip>
          <v-tooltip top>
            <template #activator="{ on }">
              <v-btn
                href="https://github.com/duinoapp/duinoapp-client/wiki/Privacy-Policy"
                target="_blank"
                rel="noopener noreferrer"
                :text="!$vuetify.breakpoint.mdAndDown"
                :icon="$vuetify.breakpoint.mdAndDown"
                small
                v-on="on"
              >
                <v-icon small left>mdi-incognito</v-icon>
                {{ !$vuetify.breakpoint.mdAndDown ? 'Privacy' : '' }}
              </v-btn>
            </template>
            <span>Privacy Policy</span>
          </v-tooltip>
          <v-tooltip top>
            <template #activator="{ on }">
              <v-btn
                href="https://github.com/duinoapp/duinoapp-client/wiki/Terms-of-Service"
                target="_blank"
                rel="noopener noreferrer"
                :text="!$vuetify.breakpoint.mdAndDown"
                :icon="$vuetify.breakpoint.mdAndDown"
                small
                v-on="on"
              >
                <v-icon small left>mdi-scale-balance</v-icon>
                {{ !$vuetify.breakpoint.mdAndDown ? 'Terms' : '' }}
              </v-btn>
            </template>
            <span>Terms of Service</span>
          </v-tooltip>
        </div>
        <v-spacer/>
        <serial-footer v-if="serialReady" />
        <board-footer />
        <server-footer />
        <coffee top />
      </v-row>
    </v-footer>
    <serial-prompts />
    <important-update />
  </v-app>
</template>

<script>
import { mapMutations } from 'vuex';
import BoardFooter from './components/boards/footer-btn.vue';
import ServerFooter from './components/servers/footer-btn.vue';
import SerialFooter from './components/serial/footer-btn.vue';
import SerialPrompts from './components/serial/prompts.vue';
import SerialMonitor from './components/serial/monitor.vue';
import SerialPlotter from './components/serial/plotter.vue';
import CompileBtn from './components/program/compile.vue';
import UploadBtn from './components/program/upload.vue';
import CompileConsole from './components/program/console.vue';
import Coffee from './components/coffee.vue';
import ImportantUpdate from './components/general/important-update.vue';
import { version } from '../package.json';

export default {
  name: 'App',
  components: {
    ServerFooter,
    BoardFooter,
    SerialPrompts,
    SerialFooter,
    SerialMonitor,
    SerialPlotter,
    CompileBtn,
    CompileConsole,
    UploadBtn,
    Coffee,
    ImportantUpdate,
  },
  data() {
    return {
      serialReady: false,
      tab: 'program',
      version,
    };
  },
  methods: {
    ...mapMutations(['toggleSerialShelf', 'setSerialTab']),
    checkSerialReady() {
      if (this.$serial) this.serialReady = true;
      else setTimeout(() => this.checkSerialReady(), 100);
    },
  },
  async mounted() {
    this.checkSerialReady();
    this.$FeathersVuex.api.File.find({ query: { $limit: 9999999 } });
    this.$FeathersVuex.api.Project.find({ query: { $limit: 9999999 } });
    await this.$FeathersVuex.api.Setting.find({ query: { $limit: 9999999 } });
    const { Setting } = this.$FeathersVuex.api;
    const { data } = Setting.findInStore({ query: { key: 'editor' } });
    this.$vuetify.theme.dark = /(dark)|(black)/.test(data[0]?.value?.theme ?? '');
  },
};
</script>

<style lang="scss">
@import '../node_modules/xterm/css/xterm.css';

.shelf-tabs > .v-tabs-bar {
  background-color: transparent !important;
}

.right-actions {
  position: absolute;
  right: 24px;
  top: 4px;
}
</style>
