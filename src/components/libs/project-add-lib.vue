<template>
  <v-tooltip top>
    <template #activator="{ on }">
      <v-hover v-slot="{ hover }">
        <v-btn
          v-show="currentProject"
          :color="hover ? (inProject ? 'error' : 'success') : undefined"
          depressed
          small
          @click="toggle"
          v-on="on"
        >
          <v-icon left small>mdi-folder-{{inProject ? 'remove' : 'plus'}}-outline</v-icon>
          <span>{{inProject ? 'Remove' : 'Add'}}</span>
        </v-btn>
      </v-hover>
    </template>
    <span>{{inProject ? 'Remove from Project' : 'Add to Project'}}</span>
  </v-tooltip>
</template>

<script>
export default {
  props: {
    lib: {
      type: Object,
      requred: true,
    },
  },
  computed: {
    currentProject() {
      const { Project } = this.$FeathersVuex.api;
      return Project.findInStore({ query: { uuid: this.$store.getters.currentProject } }).data[0] || null;
    },
    inProject() {
      return this.currentProject?.libraries?.some((lib) => lib.name === this.lib.name);
    },
  },
  methods: {
    toggle() {
      if (!this.currentProject) return;
      if (this.inProject) {
        this.$set(this.currentProject, 'libraries',
          this.currentProject.libraries.filter((lib) => lib.name !== this.lib.name));
      } else {
        this.currentProject.libraries ??= [];
        this.currentProject.libraries
          .push({ name: this.lib.name, version: 'latest', deps: this.lib.dependencies?.map(({ name }) => name) });
      }
      this.currentProject.save();
    },
  },
};
</script>
