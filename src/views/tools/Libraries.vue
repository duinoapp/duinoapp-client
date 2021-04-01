<template>
  <v-row align="center" class="libraries px-3">
    <v-col>
      <h1>Libraries</h1>
      <p>
        You can currently use any third-party library available on the Arduino Library Manager,
        just import the library into your code like you normally would.
      </p>
    </v-col>
    <v-col lg="4" md="6" cols="12">
      <v-text-field
        v-model.trim="search"
        append-icon="mdi-magnify"
        label="Search"
        outlined
        single-line
        hide-details
        clearable
      />
    </v-col>
    <v-col cols="12">
      <libs-table :search="search" />
    </v-col>
    <v-col cols="12">
      <h2>Project Libraries</h2>
    </v-col>
    <v-col cols="12">
      <project-libs :search.sync="search" />
    </v-col>
  </v-row>
</template>

<script>
import LibsTable from '@/components/libs/libs-table.vue';
import ProjectLibs from '@/components/libs/project-libs.vue';

export default {
  components: {
    LibsTable,
    ProjectLibs,
  },
  data() {
    return {
      search: '',
    };
  },
};
</script>
