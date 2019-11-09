<template>
  <v-app>
    <div>
      <v-app-bar app dense clipped-left>
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
        <v-spacer/>
        <v-btn text dense to="/tools/about"><v-icon left>mdi-information</v-icon>About</v-btn>
      </v-app-bar>
    </div>

    <router-view/>

    <v-footer dense app>
      <div>&copy; {{ new Date().getFullYear() }}</div>
      <v-spacer/>
      <board-footer />
      <server-footer />
    </v-footer>
    <serial-prompts />
  </v-app>
</template>

<script>
import BoardFooter from './components/boards/footer-btn.vue';
import ServerFooter from './components/servers/footer-btn.vue';
import SerialPrompts from './components/serial/prompts.vue';

export default {
  name: 'App',
  components: {
    ServerFooter,
    BoardFooter,
    SerialPrompts,
  },
  data() {
    return {
      //
    };
  },
};
</script>
