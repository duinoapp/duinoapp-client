<template>
  <div>
    <v-navigation-drawer app clipped permanent>
      <v-menu offset-y bottom>
        <template #activator="{ on: onMenu }">
          <v-list-item v-on="onMenu">
            <v-tooltip top>
              <template #activator="{ on: onTooltip }">
                <v-list-item-title v-on="onTooltip">
                  <v-icon left>mdi-folder-multiple-outline</v-icon>
                  {{currentProject ? currentProject.name : 'Select a Project'}}
                  <v-icon right>mdi-chevron-down</v-icon>
                </v-list-item-title>
              </template>
              <span>
                {{currentProject ? currentProject.name : 'Select a Project'}}
              </span>
            </v-tooltip>

            <v-list-item-action v-if="currentProject">
              <files-add-folder :project="currentProject">
                <template #activator="{ on }">
                  <v-btn icon @click.stop="" v-on="on">
                    <v-icon>mdi-folder-plus-outline</v-icon>
                  </v-btn>
                </template>
              </files-add-folder>
            </v-list-item-action>
            <v-list-item-action v-if="currentProject">
              <files-add-file :project="currentProject">
                <template #activator="{ on }">
                  <v-btn icon @click.stop="" v-on="on">
                    <v-icon>mdi-file-plus-outline</v-icon>
                  </v-btn>
                </template>
              </files-add-file>
            </v-list-item-action>
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
      <template #append>
        <project-sync-tools :project="currentProject" />
      </template>
    </v-navigation-drawer>
    <v-main style="padding-left:256px">
      <files-editor v-if="currentProject" />
      <project-manager v-else />
    </v-main>

  </div>
</template>

<script>
import FilesTree from '../components/files/tree.vue';
import FilesEditor from '../components/files/editor.vue';
import FilesAddFile from '../components/files/add-file.vue';
import FilesAddFolder from '../components/files/add-folder.vue';
import RecentList from '../components/recent-list.vue';
import ProjectManager from '../components/projects/manager.vue';
import ProjectSyncTools from '../components/projects/sync-tools.vue';

export default {
  components: {
    FilesTree,
    FilesEditor,
    FilesAddFile,
    FilesAddFolder,
    RecentList,
    ProjectManager,
    ProjectSyncTools,
  },
  computed: {
    currentProject() {
      return this.$store.getters['projects/find']({ query: { uuid: this.$store.getters.currentProject } }).data[0];
    },
  },
};
</script>
