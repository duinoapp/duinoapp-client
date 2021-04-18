<template>
  <div>
    <v-navigation-drawer app clipped permanent>
      <v-list class="pt-0">
        <v-list-item flat to="/tools/projects">
          <v-list-item-icon><v-icon left>mdi-folder-star-outline</v-icon></v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>Projects</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item flat to="/tools/servers">
          <v-list-item-icon><v-icon left>mdi-server</v-icon></v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>Servers</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item flat to="/tools/libraries">
          <v-list-item-icon><v-icon left>mdi-book-open-variant</v-icon></v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>Libraries</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item flat to="/tools/boards">
          <v-list-item-icon><v-icon left>mdi-chip</v-icon></v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>Boards</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item flat to="/tools/settings">
          <v-list-item-icon><v-icon left>mdi-cogs</v-icon></v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>Settings</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item flat to="/tools/about">
          <v-list-item-icon><v-icon left>mdi-information</v-icon></v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>About</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-main style="padding-left:256px;">
      <router-view/>
    </v-main>
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
