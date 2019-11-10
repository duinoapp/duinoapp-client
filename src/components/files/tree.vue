<template>
  <v-treeview
    v-model="tree"
    :open="open"
    :items="items"
    activatable
    item-key="name"
    open-on-click
    dense
    return-object
    :active="active"
    @update:active="updateActive($event[0])"
  >
    <template v-slot:prepend="{ item, open }">
      <v-icon v-if="item.children">
        {{ open ? 'mdi-folder-open' : 'mdi-folder' }}
      </v-icon>
      <v-icon v-else>
        {{ files[item.name.split('.').pop()] }}
      </v-icon>
    </template>
    <template v-slot:append="{ item }">
      <v-icon v-if="get(item, 'editor.body')">mdi-circle-medium</v-icon>
    </template>
  </v-treeview>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex';
import set from 'lodash/set';
import get from 'lodash/get';

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
    rnd: 1,
    get,
  }),
  computed: {
    ...mapGetters('files', { currentFile: 'current', findFiles: 'find' }),
    ...mapGetters('projects', { currentProject: 'current' }),
    items() {
      if (!this.currentProject) return [];
      const files = this.findFiles({
        query: { projectId: this.currentProject.id, $limit: 9999 },
      }).data;
      const filesObject = files.reduce((a, file) => set(a, file.name.replace(/\./g, '').replace(/\//g, '.'), file), {});
      const processObject = obj => Object.keys(obj).reduce((a, i) => {
        if (!obj[i]._id) return [...a, { name: i, children: processObject(obj[i]) }];
        return [...a, obj[i]];
      }, []);
      const filesArray = processObject(filesObject);
      return filesArray;
    },
    active() { return this.rnd && [this.currentFile]; },
  },
  methods: {
    ...mapMutations('files', ['setCurrent']),
    updateActive(item) {
      if (!item || !item.id) this.rnd = Math.random();
      else this.setCurrent(item);
    },
  },
  mounted() {
    this.$FeathersVuex.File.find();
  },
};
</script>
