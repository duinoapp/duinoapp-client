<template>
  <v-row
    align-content="center"
    justify="center"
    :style="{ maxHeight: 'calc(100vh - 88px)' }"
  >
    <v-col cols="12" sm="8" md="6">
      &nbsp;
      <v-card outlined>
        <v-card-title>
          Projects
          <v-spacer/>
          <v-tooltip top>
            <template v-slot:activator="{ on }">
              <v-btn text icon v-on="on" @click="dialog = true">
                <v-icon>mdi-plus</v-icon>
              </v-btn>
            </template>
            <span>Create New Project</span>
          </v-tooltip>
        </v-card-title>
        <v-list v-if="projects.length">
          <v-divider/>
          <v-list-item
            v-for="proj in projects"
            :key="proj.uuid"
            @click="Math.random"
            :class="currentProject && proj.uuid === currentProject.uuid ? 'primary--text' : ''"
          >
            <v-list-item-content @click="setCurrentProject(proj)">
              <v-list-item-title>{{proj.name}}</v-list-item-title>
              <v-list-item-subtitle>{{proj.desc}}</v-list-item-subtitle>
            </v-list-item-content>
            <v-list-item-action v-if="currentProject && currentProject.uuid === proj.uuid">
              <v-chip small color="primary" dark>Current</v-chip>
            </v-list-item-action>
            <v-list-item-action
              v-if="projects.length > 1 && (!currentProject || currentProject.uuid !== proj.uuid)"
            >
              <v-menu offset-y>
                <template v-slot:activator="{ on }">
                  <v-btn icon text v-on="on"><v-icon>mdi-close</v-icon></v-btn>
                </template>
                <v-list>
                  <v-list-item @click="removeProject(proj)">
                    <v-list-item-title class="error--text">
                      <v-icon left color="error">mdi-trash-can-outline</v-icon>
                      Delete Project and Files
                    </v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </v-list-item-action>
            <v-list-item-action>
              <v-tooltip top>
                <template v-slot:activator="{ on }">
                  <v-btn text icon v-on="on" @click="editProject(proj)">
                    <v-icon>mdi-pencil</v-icon>
                  </v-btn>
                </template>
                <span>Edit Project</span>
              </v-tooltip>
            </v-list-item-action>
          </v-list-item>
        </v-list>
        <v-card-actions v-else>
          <v-spacer />
          <v-btn color="primary" depressed @click="dialog = true">
            <v-icon left>mdi-plus</v-icon>
            Create A New Project
          </v-btn>
          <v-spacer />
        </v-card-actions>
      </v-card>
      <save-project v-model="dialog" :id="id" @input="!$event && reset()" />
    </v-col>
  </v-row>
</template>

<script>
import { mapGetters } from 'vuex';
import SaveProject from './save-project.vue';

export default {
  components: {
    SaveProject,
  },
  data() {
    return {
      dialog: false,
      id: null,
    };
  },
  computed: {
    ...mapGetters('projects', { projectFind: 'find' }),
    currentProject() {
      const { Project } = this.$FeathersVuex.api;
      return Project.findInStore({ query: { uuid: this.$store.getters.currentProject } }).data[0] || {};
    },
    projects() { return this.projectFind({ query: { $limit: 9999 } }).data; },
  },
  methods: {
    setCurrentProject(item) {
      this.$store.commit('setCurrentProject', item.uuid);
    },
    async removeProject(project) {
      const { File } = this.$FeathersVuex.api;
      const files = await File.find({ query: { projectId: project.uuid } });
      await Promise.all(files.map((file) => file.remove()));
      project.remove();
    },
    editProject(pro) {
      this.id = pro._id;
      this.dialog = true;
    },
    reset() {
      this.id = null;
      this.dialog = false;
    },
  },
};
</script>
