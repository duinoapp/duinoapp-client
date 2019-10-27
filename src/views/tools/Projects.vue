<template>
  <v-layout align-center justify-center fill-height>
    <v-flex xs12 sm8 md6>
      <v-card>
        <v-card-title primary-title class="display-2">
          Projects
          <v-spacer/>
          <v-tooltip top>
            <v-btn flat icon large slot="activator">
              <v-icon large>mdi-plus</v-icon>
            </v-btn>
            <span>Create New Project</span>
          </v-tooltip>
        </v-card-title>
        <v-list>
          <v-divider/>
          <v-list-item
            v-for="proj in projects"
            :key="proj._id"
            @click="setCurrent(proj._id)"
            :class="currentProject && proj._id === currentProject._id ? 'primary--text' : ''"
          >
            <v-list-item-content>
              <v-list-item-title>{{proj.name}}</v-list-item-title>
              <v-list-item-sub-title>{{proj.desc}}</v-list-item-sub-title>
            </v-list-item-content>
            <v-list-item-action v-if="currentProject && currentProject._id === proj._id">
              <v-chip color="primary" text-color="white">Current</v-chip>
            </v-list-item-action>
            <v-list-item-action v-if="projects.length > 1">
              <v-menu offset-y>
                <v-btn icon flat slot="activator"><v-icon>mdi-close</v-icon></v-btn>
                <v-list>
                  <v-list-item @click="removeProject(proj._id)">
                    <v-list-item-title><v-icon left>mpi-trash</v-icon>Delete</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </v-list-item-action>
          </v-list-item>
        </v-list>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex';

export default {
  computed: {
    ...mapGetters('projects', {projectFind: 'find', currentProject: 'current'}),
    projects() { return this.projectFind({ query: { $limit: 9999 } }).data }
  },
  methods: {
    ...mapMutations('projects', { setCurrentProject: 'setCurrent'}),
  },
};
</script>
