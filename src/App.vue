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
      <v-spacer/>
      <div>&copy; {{ new Date().getFullYear() }}</div>
      <v-spacer/>
      <server-footer />
    </v-footer>
  </v-app>
</template>

<script>
import ServerFooter from './components/servers/footer-btn.vue';

export default {
  name: 'App',
  components: {
    ServerFooter,
  },
  data() {
    return {
      //
    };
  },
};
</script>
