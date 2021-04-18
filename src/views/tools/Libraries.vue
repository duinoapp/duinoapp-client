<template>
  <v-row align="center" class="libraries px-3">
    <v-col>
      <h1>Libraries</h1>
      <p>
        You can currently select any third-party library available from the Arduino Library Manager.
        <br>
        <span v-show="currentProject.name">
          Just click "Add" on the right to add the library to your current project, {{currentProject.name}}.
        </span>
        <span v-show="!currentProject.name" class="warning--text">
          <v-icon left color="warning">mdi-alert-circle-outline</v-icon>
          You must select a project before you can add any libraries!
          <router-link to="/tools/projects">
          Click here to manage your projects.
          </router-link>
        </span>
      </p>
    </v-col>
    <v-col lg="4" md="6" cols="12">
      <v-text-field
        v-model.trim="search"
        append-icon="mdi-magnify"
        label="Search"
        outlined
        single-line
        hide-details
        clearable
      />
    </v-col>
    <v-col cols="12">
      <libs-table :search="search" />
    </v-col>
    <v-col v-show="currentProject.name" cols="12">
      <h2>Project Libraries</h2>
    </v-col>
    <v-col v-show="currentProject.name" cols="12">
      <project-libs :search.sync="search" />
    </v-col>
  </v-row>
</template>

<script>
import LibsTable from '@/components/libs/libs-table.vue';
import ProjectLibs from '@/components/libs/project-libs.vue';

export default {
  components: {
    LibsTable,
    ProjectLibs,
  },
  data() {
    return {
      search: '',
    };
  },
  computed: {
    currentProject() {
      const { Project } = this.$FeathersVuex.api;
      return Project.findInStore({ query: { uuid: this.$store.getters.currentProject } }).data[0] || {};
    },
  },
};
</script>
