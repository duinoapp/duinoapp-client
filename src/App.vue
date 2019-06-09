<template>
  <v-app>
    <v-toolbar app dense>
      <v-toolbar-title class="headline">
        <router-link to="/">Chromeduino</router-link>
      </v-toolbar-title>
      <v-toolbar-items>
        <v-btn flat to="/code"><v-icon left>mdi-code-braces</v-icon>Code</v-btn>
        <v-btn flat to="/projects"><v-icon left>mdi-wrench</v-icon>Projects</v-btn>
        <v-btn flat to="/libraries"><v-icon left>mdi-book-open-variant</v-icon>Libraries</v-btn>
        <v-btn flat to="/boards"><v-icon left>mdi-chip</v-icon>Boards</v-btn>
      </v-toolbar-items>
      <v-spacer/>
      <v-toolbar-items>
        <v-btn flat to="/settings"><v-icon left>mdi-settings</v-icon>Settings</v-btn>
        <v-btn flat to="/servers"><v-icon left>mdi-server</v-icon>Servers</v-btn>
        <v-btn flat to="/about"><v-icon left>mdi-information</v-icon>About</v-btn>
      </v-toolbar-items>
    </v-toolbar>

    <v-content>
      <router-view/>
    </v-content>
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
