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
      />
    </v-col>
    <v-col cols="12">
      <libs-table :search="search" />
    </v-col>
  </v-row>
</template>

<script>
import LibsTable from '@/components/libs/libs-table.vue';

export default {
  components: {
    LibsTable,
  },
  data() {
    return {
      search: '',
    };
  },
};
</script>
