<template>
  <v-app>
    <v-toolbar app dense class="elevation-0" clipped-left>
      <v-toolbar-items>
        <v-btn flat to="/" active-class="foobar">
          <v-img
            :src="require('./assets/logo.svg')"
            alt="Home"
            contain
            height="100%"
            width="2em"
          />
        </v-btn>
        <v-btn flat to="/code"><v-icon left>mdi-code-braces</v-icon>Code</v-btn>
        <v-btn flat to="/tools"><v-icon left>mdi-wrench</v-icon>Tools</v-btn>
      </v-toolbar-items>
      <v-spacer/>
      <v-toolbar-items>
        <v-btn flat to="/tools/about"><v-icon left>mdi-information</v-icon>About</v-btn>
      </v-toolbar-items>
    </v-toolbar>

    <v-content>
      <router-view/>
    </v-content>

    <v-footer class="pa-3" dense app clipped-left>
      <v-spacer/>
      <div>&copy; {{ new Date().getFullYear() }}</div>
      <v-spacer/>
      <v-btn flat small dense>Server</v-btn>
    </v-footer>
  </v-app>
</template>

<script>

export default {
  name: 'App',
  data() {
    return {
      //
    };
  },
};
</script>
