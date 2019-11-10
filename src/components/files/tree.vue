<template>
  <v-treeview
    v-model="tree"
    :open="open"
    :items="items"
    activatable
    item-key="name"
    open-on-click
    dense
  >
    <template v-slot:prepend="{ item, open }">
      <v-icon v-if="item.children">
        {{ open ? 'mdi-folder-open' : 'mdi-folder' }}
      </v-icon>
      <v-icon v-else>
        {{ files[item.name.split('.').pop()] }}
      </v-icon>
    </template>
  </v-treeview>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex';
import set from 'lodash/set';

export default {
  data: () => ({
    open: ['public'],
    files: {
      html: 'mdi-language-html5',
      js: 'mdi-nodejs',
      json: 'mdi-json',
      md: 'mdi-markdown',
      pdf: 'mdi-file-pdf',
      png: 'mdi-file-image',
      txt: 'mdi-file-document-outline',
      ino: 'mdi-file-code-outline',
      xls: 'mdi-file-excel',
    },
    tree: [],
  }),
  computed: {
    ...mapGetters('files', { currentFile: 'current', findFiles: 'find' }),
    ...mapGetters('projects', { currentProject: 'current' }),
    items() {
      if (!this.currentProject) return [];
      const files = this.findFiles({ projectId: this.currentProject.id, $limit: 9999 }).data;
      const filesObject = files.reduce((a, file) => set(a, file.ref.replace(/\./g, '').replace(/\//g, '.'), file), {});
      console.log(filesObject);
      const processObject = obj => Object.keys(obj).reduce((a, i) => {
        if (!obj[i]._id) return [...a, { name: i, children: processObject(obj[i]) }];
        return [...a, obj[i]];
      }, []);
      const filesArray = processObject(filesObject);
      console.log(filesArray);
      return filesArray;
    },
  },
  methods: {
    ...mapMutations('files', ['setCurrent']),
  },
  mounted() {
    this.$FeathersVuex.File.find();
  },
};
</script>
