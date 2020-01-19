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
        <v-list v-if="projects.length">
          <v-divider/>
          <v-list-item
            v-for="proj in projects"
            :key="proj._id"
            @click="Math.random"
            :class="currentProject && proj._id === currentProject._id ? 'primary--text' : ''"
          >
            <v-list-item-content @click="setCurrentProject(proj)">
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
          <v-btn color="primary" @click="dialog = true">
            <v-icon left>mdi-plus</v-icon>
            Create A New Project
          </v-btn>
          <v-spacer />
        </v-card-actions>
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
              :hint="ref"
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
import defaultCode from '@/assets/default-code.txt';

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
    ref() {
      if (!this.name.trim()) return '';
      let ref = snakeCase(this.name);
      let count = 1;
      while (this.projectFind({ query: { ref, _id: { $ne: this.id } } }).total) {
        count += 1;
        ref = `${snakeCase(this.name)}_${count}`;
      }
      return ref;
    },
  },
  methods: {
    ...mapMutations('projects', { setCurrentProject: 'setCurrent' }),
    async removeProject(project) {
      const { File } = this.$FeathersVuex;
      const files = await File.find({ query: { projectId: project.id } });
      await Promise.all(files.map(file => file.remove()));
      project.remove();
    },
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
      if (!this.name.trim()) return;
      const { Project, File } = this.$FeathersVuex;
      const project = new Project({
        name: this.name.trim(),
        desc: this.desc,
        ref: this.ref,
        ...(this.id ? { _id: this.id } : {}),
      });
      await project.save();
      if (!this.id) {
        const file = new File({
          name: `${project.ref}.ino`,
          ref: `${project.ref}/${project.ref}.ino`,
          body: defaultCode,
          contentType: 'text/x-arduino',
          main: true,
          projectId: project.id,
        });
        await file.save();
        this.setCurrentProject(project);
      } else {
        const files = await File.find({ query: { projectId: project.id } });
        await Promise.all(files.map(async (file) => {
          if (file.main) {
            // eslint-disable-next-line no-param-reassign
            file.name = `${project.ref}.ino`;
            // eslint-disable-next-line no-param-reassign
            file.ref = `${project.ref}/${project.ref}.ino`;
          } else {
            // eslint-disable-next-line no-param-reassign
            file.ref = `${project.ref}/${file.ref.replace(/^[^/]*\//, '')}`;
          }
          file.save();
        }));
      }
      this.reset();
    },
  },
  mounted() {
    const { Project } = this.$FeathersVuex;
    Project.find({ query: { $limit: 9999 } });
  },
};
</script>
