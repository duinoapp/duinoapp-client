<template>
  <div>
    <v-navigation-drawer app clipped permanent>
      <files-tree />
    </v-navigation-drawer>
    <v-content>
    </v-content>
  </div>
</template>


<script>
import FilesTree from '../components/files/tree.vue';

export default {
  components: {
    FilesTree,
  },
};
</script>
