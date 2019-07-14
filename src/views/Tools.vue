<template>
  <div>
    <v-navigation-drawer app clipped permanent>
      <v-list dense class="pt-0">
        <v-list-tile flat to="/tools/projects"><v-icon left>mdi-wrench</v-icon>Projects</v-list-tile>
        <v-list-tile flat to="/tools/servers"><v-icon left>mdi-server</v-icon>Servers</v-list-tile>
        <v-list-tile flat to="/tools/libraries"><v-icon left>mdi-book-open-variant</v-icon>Libraries</v-list-tile>
        <v-list-tile flat to="/tools/boards"><v-icon left>mdi-chip</v-icon>Boards</v-list-tile>
        <v-list-tile flat to="/tools/settings"><v-icon left>mdi-settings</v-icon>Settings</v-list-tile>
        <v-list-tile flat to="/tools/about"><v-icon left>mdi-information</v-icon>About</v-list-tile>
      </v-list>
    </v-navigation-drawer>

    <v-content>
      <router-view/>
    </v-content>
  </div>
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
