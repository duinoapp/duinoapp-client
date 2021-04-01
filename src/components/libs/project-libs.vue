<template>
  <div>
    <v-chip
      v-for="lib in libs"
      :key="lib.name"
      class="ma-2"
      close
      @click:close="remove(lib)"
      @click="$emit('update:search', lib.name.replaceAll(' ', '.'))"
    >
      {{lib.name}}
    </v-chip>
    <p v-show="!libs.length" class="text-caption">No libraries currently added</p>
    <br>
    <v-card v-if="missing.length" outlined class="mt-4 d-inline-block">
      <v-card-title class="warning--text">
        <v-icon color="warning" left>mdi-alert</v-icon>
        Missing Dependancies
      </v-card-title>
      <v-card-text>
        The following libraries are required by one or more of the libraries above.
        <br>
        Click on the missing dependancies to search for it.
      </v-card-text>
      <v-chip
        v-for="name in missing"
        :key="name"
        class="ma-2"
        @click="$emit('update:search', name.replaceAll(' ', '.'))"
      >
        {{name}}
      </v-chip>
    </v-card>
  </div>
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
    libs() {
      return this.currentProject?.libraries ?? [];
    },
    missing() {
      const deps = this.libs.reduce((a, lib) => [...a, ...(lib.deps ?? [])], []);
      return deps.filter((name) => !this.libs.some((lib) => lib.name === name));
    },
  },
  methods: {
    remove(lib) {
      if (!this.currentProject) return;
      this.$set(this.currentProject, 'libraries',
        this.currentProject.libraries.filter((l) => l.name !== lib.name));
      this.currentProject.save();
    },
  },
};
</script>
