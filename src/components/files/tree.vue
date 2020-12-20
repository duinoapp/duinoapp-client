<template>
  <v-treeview
    v-model="tree"
    :open="open"
    :items="items"
    item-key="name"
    item-text="text"
    activatable
    open-on-click
    dense
    return-object
    :active.sync="active"
    @update:active="updateActive($event[0])"
  >
    <template v-slot:prepend="{ item, open }">
      <v-icon v-if="item.children">
        {{ open ? 'mdi-folder-open' : 'mdi-folder' }}
      </v-icon>
      <v-icon v-else>
        {{ files[item.name.split('.').pop()] || files.txt }}
      </v-icon>
    </template>
    <template v-slot:append="{ item }">
      <v-icon v-if="get(item, 'editor.body')">mdi-circle-medium</v-icon>
    </template>
  </v-treeview>
</template>

<script>
import { mapGetters } from 'vuex';
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
      h: 'mdi-file-code-outline',
      c: 'mdi-file-code-outline',
      cpp: 'mdi-file-code-outline',
      xls: 'mdi-file-excel',
    },
    tree: [],
    active: [],
    get,
  }),
  computed: {
    ...mapGetters('files', { findFiles: 'find' }),
    currentFile() {
      const { File } = this.$FeathersVuex.api;
      return File.findInStore({ query: { uuid: this.$store.getters.currentFile } }).data[0] || {};
    },
    currentProject() {
      const { Project } = this.$FeathersVuex.api;
      return Project.findInStore({ query: { uuid: this.$store.getters.currentProject } }).data[0] || {};
    },
    items() {
      if (!this.currentProject) return [];
      const files = this.findFiles({
        query: { projectId: this.currentProject.uuid },
      }).data;
      const filesObject = files.reduce((a, file) => set(a, file.name.replace(/\./g, '').replace(/\//g, '.'), file), {});
      const processObject = (obj) => Object.keys(obj).reduce((a, i) => {
        if (!obj[i]._id) return [...a, { name: i, text: i, children: processObject(obj[i]) }];
        // eslint-disable-next-line no-param-reassign
        obj[i].text = obj[i].name.split('/').pop();
        return obj[i].text === '.gitkeep' ? a : [...a, obj[i]];
      }, []);
      const filesArray = processObject(filesObject);
      return filesArray;
    },
  },
  methods: {
    updateActive(item) {
      if (!item || !item.uuid || item.uuid === this.currentFile?.uuid) return;
      this.setCurrent(item);
    },
    setActive() {
      if (!this.currentFile?.uuid) return;
      this.active = [this.currentFile];
    },
    setCurrent(item) {
      this.$store.commit('setCurrentFile', item.uuid);
    },
  },
  watch: {
    active(to, from) {
      if (to && !to.length && (!from || from.length)) {
        this.setActive();
      }
    },
    currentFile(to, from) {
      if (to && to.uuid && to.uuid !== from.uuid) this.setActive();
    },
  },
  mounted() {
    this.setActive();
  },
};
</script>
