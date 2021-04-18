<template>
  <v-row class="px-3">
    <v-col cols="auto">
      <v-tooltip top>
        <template #activator="{ on }">
          <v-btn v-show="!!project.uuid" icon :loading="exportLoading" v-on="on" @click="exportProject">
            <v-icon>mdi mdi-folder-download-outline</v-icon>
          </v-btn>
        </template>
        <span>Export Project (Save)</span>
      </v-tooltip>
    </v-col>
    <v-col cols="auto">
      <save-project import-project>
        <template #activator="{ on: onSave }">
          <v-tooltip top>
            <template #activator="{ on: onTooltip }">
              <v-btn icon v-on="{ ...onTooltip, ...onSave }">
                <v-icon>mdi mdi-folder-upload-outline</v-icon>
              </v-btn>
            </template>
            <span>Import Project (Open)</span>
          </v-tooltip>
        </template>
      </save-project>
    </v-col>
    <v-col cols="auto">
      <v-tooltip top>
        <template #activator="{ on }">
          <v-badge :value="!!libs" :content="libs" overlap>
            <v-btn icon to="/tools/libraries" v-on="on">
              <v-icon>mdi mdi-book-open-variant</v-icon>
            </v-btn>
          </v-badge>
        </template>
        <div v-if="libs" class="text-center">
          <strong>Libraries</strong>
          <div v-for="(lib, i) in project.libraries" :key="i">
            {{lib.name}} - {{lib.version}}
          </div>
        </div>
        <strong v-else>Libraries</strong>
      </v-tooltip>
    </v-col>
  </v-row>
</template>

<script>
import SaveProject from './save-project.vue';

export default {
  components: {
    SaveProject,
  },
  props: {
    project: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      exportLoading: false,
    };
  },
  computed: {
    libs() {
      return this.project?.libraries?.length;
    },
  },
  methods: {
    async exportProject() {
      this.exportLoading = true;
      await this.$bundler.exportProject(this.project);
      this.exportLoading = false;
    },
  },
};
</script>
