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
          <v-list-tile
            v-for="proj in Object.values(projects)"
            :key="proj.id"
            @click="setCurrentProject(proj.id)"
            :class="proj.id === currentProjectId ? 'primary--text' : ''"
          >
            <v-list-tile-content>
              <v-list-tile-title>{{proj.name}}</v-list-tile-title>
              <v-list-tile-sub-title>{{proj.desc}}</v-list-tile-sub-title>
            </v-list-tile-content>
            <v-list-tile-action v-if="currentProjectId === proj.id">
              <v-chip color="primary" text-color="white">Current</v-chip>
            </v-list-tile-action>
            <v-list-tile-action v-if="projects.length > 1">
              <v-menu offset-y>
                <v-btn icon flat slot="activator"><v-icon>mdi-close</v-icon></v-btn>
                <v-list>
                  <v-list-tile @click="removeProject(proj.id)">
                    <v-list-tile-title><v-icon left>mpi-trash</v-icon>Delete</v-list-tile-title>
                  </v-list-tile>
                </v-list>
              </v-menu>
            </v-list-tile-action>
          </v-list-tile>
        </v-list>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
import {mapState, mapMutations} from 'vuex';

export default {
  computed: {
    ...mapState('files', ['projects', 'currentProjectId']),
  },
  methods: {
    ...mapMutations('files', ['setCurrentProject', 'removeProject'])
  },
}
</script>