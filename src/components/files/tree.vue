<template>
  <div :style="{ height: 'calc( 100% - 61px )' }" id="tree-wrap" @click.right="showMenu">
    <v-treeview
      v-model="tree"
      :open.sync="open"
      :items="items"
      :key="currentFile.ref"
      item-key="name"
      activatable
      open-on-click
      dense
      return-object
      :active="active"
      @update:active="updateActive($event[0])"
    >
      <template #prepend="{ item, open }">
        <v-icon v-if="item.children">
          {{ open ? 'mdi-folder-open' : 'mdi-folder' }}
        </v-icon>
        <v-icon v-else>
          {{ files[item.name.split('.').pop()] || files.txt }}
        </v-icon>
      </template>
      <template #append="{ item }">
        <v-icon v-if="get(item, 'editor.body')">mdi-circle-medium</v-icon>
      </template>
      <template #label="{ item }">
        <v-tooltip right>
          <template #activator="{ on }">
            <div
              :class="{ 'text-decoration-underline': item.main && items.length > 1 }"
              v-on="on"
              @click.right.stop="(e) => showMenu(e, item)"
            >
              {{ item.name.split('/').pop() }}
            </div>
          </template>
          <span>{{ item.name.split('/').pop() }}</span>
          &nbsp;
          <span v-show="item.main">(Entry .ino file)</span>
        </v-tooltip>
      </template>
    </v-treeview>
    <v-menu
      v-model="isMenu"
      :position-x="menuX"
      :position-y="menuY"
      absolute
      offset-y
      close-on-click
    >
      <v-list class="py-0" dense>
        <files-add-file
          :project="currentProject"
          :path="menuItem.ref && menuItem.ref.replace(/[^/]+$/, '')"
          @open="isMenu = false"
        >
          <template #activator="{ on }">
            <v-list-item v-on="on">
                <v-list-item-title>
                  <v-icon left>mdi-file-plus-outline</v-icon>
                  New File
                </v-list-item-title>
            </v-list-item>
          </template>
        </files-add-file>
        <files-add-folder
          :project="currentProject"
          :path="menuItem.ref && menuItem.ref.replace(/[^/]+$/, '')"
          @open="isMenu = false"
        >
          <template #activator="{ on }">
            <v-list-item v-on="on">
                <v-list-item-title>
                  <v-icon left>mdi-folder-plus-outline</v-icon>
                  New Folder
                </v-list-item-title>
            </v-list-item>
          </template>
        </files-add-folder>
        <files-add-file
          v-if="!menuItem.main && menuItem._id"
          :key="menuItem.ref"
          :project="currentProject"
          :path="menuItem.ref && menuItem.ref.replace(/[^/]+$/, '')"
          :file="menuItem"
          @open="isMenu = false"
        >
          <template #activator="{ on }">
            <v-list-item v-on="on">
                <v-list-item-title>
                  <v-icon left>mdi-cursor-text</v-icon>
                  Rename/Move
                </v-list-item-title>
            </v-list-item>
          </template>
        </files-add-file>
        <v-dialog v-model="removeDialog" max-width="300">
          <template #activator="{ on }">
            <v-list-item v-show="!menuItem.main && !menuItem.root" v-on="on">
                <v-list-item-title>
                  <v-icon left>mdi-trash-can-outline</v-icon>
                  Delete
                </v-list-item-title>
            </v-list-item>
          </template>
          <v-card>
            <v-card-title>
              Delete {{menuItem._id ? 'File' : 'Folder'}}?
            </v-card-title>
            <v-card-text>
              Delete the following
              {{menuItem._id ? 'file?' : 'folder and all the sub-files/folders within it?'}}
              <br>
              <code>
                {{menuItem.ref && menuItem.ref.split(`${currentProject.ref}/`).pop()}}
              </code>
            </v-card-text>
            <v-card-actions>
              <v-spacer />
              <v-btn text @click="removeDialog = false">
                Cancel
              </v-btn>
              <v-btn color="primary" @click="removeFile">
                Confirm
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-list>
    </v-menu>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import set from 'lodash/set';
import get from 'lodash/get';
import sortBy from 'lodash/sortBy';
import FilesAddFile from './add-file.vue';
import FilesAddFolder from './add-folder.vue';

export default {
  components: {
    FilesAddFile,
    FilesAddFolder,
  },
  data: () => ({
    open: ['public'],
    files: {
      html: 'mdi-language-html5',
      js: 'mdi-nodejs',
      json: 'mdi-json',
      md: 'mdi-language-markdown-outline',
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
    menuItem: {},
    isMenu: false,
    removeDialog: false,
    menuX: 0,
    menuY: 0,
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
      const processObject = (obj, ref) => sortBy(Object.keys(obj).reduce((a, i) => {
        if (!obj[i]._id) return [...a, { name: i, ref: `${ref}${i}/`, children: processObject(obj[i], `${ref}${i}/`) }];
        const text = obj[i].name.split('/').pop();
        return text === '.gitkeep' ? a : [...a, obj[i]];
      }, []), [(v) => !!v.children, (v) => v.name.split('/').pop().toLowerCase()]);
      const filesArray = processObject(filesObject, `${this.currentProject.ref}/`);
      return filesArray;
    },
  },
  methods: {
    updateActive(item) {
      if (item?.uuid && item.uuid !== this.currentFile?.uuid) {
        this.setCurrent(item);
      }
      setTimeout(() => {
        this.setActive();
      }, 100);
    },
    setActive() {
      if (!this.currentFile?.uuid) return;
      this.active = [this.currentFile];
    },
    setCurrent(item) {
      this.$store.commit('setCurrentFile', item.uuid);
    },
    showMenu(e, item) {
      e.preventDefault();
      if (!item && e.target.id !== 'tree-wrap') return;
      if (!this.currentProject.uuid) return;
      this.menuItem = item || { ref: `${this.currentProject.ref}/`, root: true };
      this.isMenu = false;
      this.menuX = e.clientX;
      this.menuY = e.clientY;
      this.$nextTick(() => {
        this.isMenu = true;
      });
    },
    removeFile() {
      if (!this.menuItem) return;
      this.removeDialog = false;
      if (this.menuItem._id) {
        this.menuItem.remove();
        return;
      }
      const { data: files } = this.findFiles({
        query: { projectId: this.currentProject.uuid },
      });
      files
        .filter((file) => file.ref.indexOf(this.menuItem.ref) === 0)
        .forEach((file) => file.remove());
    },
  },
  watch: {
    currentFile(to, from) {
      if (to && to.uuid && to.uuid !== from.uuid) this.setActive();
    },
    removeDialog(to, from) {
      if (!to || to === from) return;
      this.isMenu = false;
    },
  },
  mounted() {
    this.setActive();
  },
};
</script>
