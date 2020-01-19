<template>
  <div>
    <v-navigation-drawer app clipped permanent>
      <v-menu offset-y bottom>
        <template v-slot:activator="{ on }">
          <v-list-item v-on="on">
            <v-list-item-title>
              <v-icon left>mdi-folder-multiple-outline</v-icon>
              {{currentProject ? currentProject.name : 'Select a Project'}}
              <v-icon right>mdi-chevron-down</v-icon>
            </v-list-item-title>
          </v-list-item>
        </template>
        <recent-list
          manage-label="Project Manger..."
          manage-link="/tools/projects"
          service="projects"
        />
      </v-menu>
      <v-divider />
      <files-tree />
    </v-navigation-drawer>
    <v-content>
      <file-editor v-if="currentProject" />
      <project-manager v-else />
    </v-content>

  </div>
</template>


<script>
import { mapGetters } from 'vuex';
import FilesTree from '../components/files/tree.vue';
import FileEditor from '../components/files/editor.vue';
import RecentList from '../components/recent-list.vue';
import ProjectManager from '../components/projects/manager.vue';

export default {
  components: {
    FilesTree,
    FileEditor,
    RecentList,
    ProjectManager,
  },
  computed: {
    ...mapGetters('projects', { currentProject: 'current' }),
  },
};
</script>
