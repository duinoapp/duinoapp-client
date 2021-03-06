<template>
  <v-dialog v-model="dialog" max-width="500px">
    <template #activator="{ on }">
      <slot name="activator" :on="on" />
    </template>
    <v-card>
      <v-card-title>
        {{file ? 'Update' : 'Add'}} File
      </v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12">
            <v-select
              v-model="location"
              :items="items"
              label="Location"
              outlined
            />
          </v-col>
          <v-col cols="12" sm="9">
            <v-text-field
              v-model.trim="name"
              :error-messages="nameError"
              label="Name"
              outlined
            />
          </v-col>
          <v-col cols="12" sm="3">
            <v-select
              v-model="ext"
              :items="['.c', '.cpp', '.h', '.ino', '.md', '.txt']"
              label="Type"
              outlined
            />
          </v-col>
          <v-col cols="12" class="text-caption" v-if="!!name">
            {{project.ref}}/{{location}}{{name}}{{ext}}
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn text @click="dialog = false">
          Cancel
        </v-btn>
        <v-btn :disabled="!name || !!nameError" depressed color="primary" @click="add">
          {{file ? 'Update' : 'Add'}} File
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapGetters } from 'vuex';
import set from 'lodash/set';

export default {
  props: {
    project: {
      type: Object,
      default: () => ({}),
    },
    file: {
      type: [Object, null],
      default: () => null,
    },
    path: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      dialog: false,
      name: '',
      location: '',
      ext: '.c',
    };
  },
  computed: {
    ...mapGetters('files', { findFiles: 'find' }),
    nameError() {
      if (/[^\w-.]/.test(this.name)) return 'File name can only contain a-z, A-Z, 0-9, ., - or _ characters.';
      return '';
    },
    items() {
      if (!this.project?.ref) return [];
      const files = this.findFiles({
        query: { projectId: this.project.uuid },
      }).data;
      const filesObject = files.reduce((a, file) => set(a, file.name.replace(/\./g, '').replace(/\//g, '.'), file), {});
      const processObject = (obj, parent) => Object.keys(obj).reduce((a, i) => {
        if (obj[i]._id) return a;
        const text = `${parent}${i}/`;
        return [...a, { text, value: text.replace(`${this.project.ref}/`, '') }, ...processObject(obj[i], text)];
      }, []);
      const foldersArray = [{ text: `${this.project.ref}/`, value: '' }, ...processObject(filesObject, `${this.project.ref}/`)];
      return foldersArray;
    },
    fileType() {
      switch (this.ext) {
        case '.ino':
          return 'text/x-arduino';
        case '.c':
        case '.cpp':
        case '.h':
          return 'text/x-c';
        case '.md':
          return 'text/markdown';
        default:
          return 'text/plain';
      }
    },
  },
  methods: {
    async add() {
      if (!this.name || this.nameError) return;
      const { File } = this.$FeathersVuex.api;
      let file;
      if (this.file) {
        this.$set(this.file, 'contentType', this.fileType);
        this.$set(this.file, 'name', `${this.location}${this.name}${this.ext}`);
        this.$set(this.file, 'ref', `${this.project.ref}/${this.location}${this.name}${this.ext}`);
        file = this.file;
      } else {
        file = new File({
          name: `${this.location}${this.name}${this.ext}`,
          ref: `${this.project.ref}/${this.location}${this.name}${this.ext}`,
          body: '',
          contentType: this.fileType,
          main: false,
          projectId: this.project.uuid,
        });
      }
      await file.save();
      this.$store.commit('setCurrentFile', file.uuid);
      this.name = '';
      this.dialog = false;
    },
    loadFile() {
      if (!this.file) return;
      const folders = this.file.name.split('/');
      const fileName = folders.pop();
      const fileParts = fileName.split('.');
      this.ext = `.${fileParts.pop()}`;
      this.name = fileParts.join('.');
      this.location = folders.length ? `${folders.join('/')}/` : '';
    },
  },
  mounted() {
    if (this.project.ref) this.location = this.path.replace(`${this.project.ref}/`, '');
    this.loadFile();
  },
  watch: {
    'file.ref': {
      handler() {
        this.loadFile();
      },
    },
    'project.ref': {
      handler(to, from) {
        if (!to || to === from) return;
        this.location = this.path.replace(`${this.project.ref}/`, '');
        if (!this.items.some((item) => item.value === this.location)) this.location = '';
      },
    },
    path(to, from) {
      if (!to || to === from) return;
      this.location = this.path.replace(`${this.project.ref}/`, '');
      if (!this.items.some((item) => item.value === this.location)) this.location = '';
    },
    dialog(to, from) {
      if (to === from) return;
      if (to) this.$emit('open');
      else this.$emit('close');
    },
  },
};
</script>

<style>

</style>
