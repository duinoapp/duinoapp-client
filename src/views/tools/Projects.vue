<template>
  <v-row
    align-content="center"
    justify="center"
    :style="{ maxHeight: 'calc(100vh - 88px)' }"
  >
    <v-col cols="12" sm="8" md="6">
      &nbsp;
      <v-card>
        <v-card-title primary-title class="display-2">
          Projects
          <v-spacer/>
          <v-tooltip top>
            <template v-slot:activator="{ on }">
              <v-btn text icon large v-on="on" @click="dialog = true">
                <v-icon large>mdi-plus</v-icon>
              </v-btn>
            </template>
            <span>Create New Project</span>
          </v-tooltip>
        </v-card-title>
        <v-list>
          <v-divider/>
          <v-list-item
            v-for="proj in projects"
            :key="proj._id"
            @click="Math.random"
            :class="currentProject && proj._id === currentProject._id ? 'primary--text' : ''"
          >
            <v-list-item-content @click="setCurrentProject(proj._id)">
              <v-list-item-title>{{proj.name}}</v-list-item-title>
              <v-list-item-subtitle>{{proj.desc}}</v-list-item-subtitle>
            </v-list-item-content>
            <v-list-item-action v-if="currentProject && currentProject._id === proj._id">
              <v-chip small color="primary" dark>Current</v-chip>
            </v-list-item-action>
            <v-list-item-action
              v-if="projects.length > 1 && (!currentProject || currentProject._id !== proj._id)"
            >
              <v-menu offset-y>
                <template v-slot:activator="{ on }">
                  <v-btn icon text v-on="on"><v-icon>mdi-close</v-icon></v-btn>
                </template>
                <v-list>
                  <v-list-item @click="proj.remove()">
                    <v-list-item-title class="error--text">
                      <v-icon left color="error">mdi-trash-can-outline</v-icon>
                      Delete Project
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
      </v-card>
      <v-dialog
        v-model="dialog"
        max-width="500px"
      >
        <v-card>
          <v-card-title class="headline">
            Create new project
          </v-card-title>
          <v-card-text>
            <v-text-field
              label="Project Name"
              v-model="name"
              :hint="snakeCase(name)"
            />
            <v-textarea
              label="Project Description (optional)"
              v-model="desc"
            />
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn text @click="reset">Cancel</v-btn>
            <v-btn @click="newProject" color="primary" :disabled="!name.trim()">
              {{this.id === null ? 'Create' : 'Save'}}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-col>
  </v-row>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex';
import snakeCase from 'lodash/snakeCase';

export default {
  data() {
    return {
      dialog: false,
      name: '',
      desc: '',
      id: null,
      snakeCase,
    };
  },
  computed: {
    ...mapGetters('projects', { projectFind: 'find', currentProject: 'current' }),
    projects() { return this.projectFind({ query: { $limit: 9999 } }).data; },
  },
  methods: {
    ...mapMutations('projects', { setCurrentProject: 'setCurrent' }),
    editProject(pro) {
      this.name = pro.name;
      this.desc = pro.desc;
      this.id = pro._id;
      this.dialog = true;
    },
    reset() {
      this.name = '';
      this.desc = '';
      this.id = null;
      this.dialog = false;
    },
    async newProject() {
      if (!this.name) return;
      const { Project } = this.$FeathersVuex;
      let ref = snakeCase(this.name);
      let count = 1;
      while (this.projectFind({ query: { ref } }).total) {
        count += 1;
        ref = `${snakeCase(this.name)}_${count}`;
      }
      const project = new Project({
        name: this.name,
        desc: this.desc,
        ref,
        ...(this.id !== null ? { _id: this.id } : {}),
      });
      await project.save();
      if (this.id === null) this.setCurrentProject(project);
      this.reset();
    },
  },
};
</script>
