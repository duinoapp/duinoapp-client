<template>
  <v-dialog
    v-model="dialog"
    max-width="500px"
  >
    <template #activator="{ on }">
      <slot name="activator" :on="on" />
    </template>
    <v-card>
      <v-card-title class="text-h5">
        {{id === null ? 'Create New' : 'Edit'}} Project
      </v-card-title>
      <v-card-text>
        <v-text-field
          label="Project Name"
          v-model="name"
          :hint="ref"
          outlined
        />
        <v-textarea
          label="Project Description (optional)"
          v-model="desc"
          outlined
        />
        <v-file-input
          v-if="importProject"
          v-model="file"
          :rules="[
            (val) => !val || /^application\/(x-)?zip/.test(val.type) || 'File must be a .zip',
          ]"
          :error-messages="[unzipError, inoError].filter(v => v)"
          label="Upload Project Zip"
          accept=".zip,application/zip,application/x-zip,application/x-zip-compressed"
          outlined
          show-size
        />
        <v-select
          v-if="importProject"
          v-model="inoFile"
          :items="inoFiles"
          :disabled="inoFiles.length < 2"
          label="Project File"
          outlined
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn text @click="reset">Cancel</v-btn>
        <v-btn
          :disabled="!valid"
          :loading="loading"
          color="primary"
          depressed
          @click="newProject"
        >
          {{id === null ? 'Create' : 'Save'}}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapGetters } from 'vuex';
import snakeCase from 'lodash/snakeCase';
import startCase from 'lodash/startCase';
import defaultCode from '@/assets/default-code.txt';

export default {
  props: {
    value: {
      type: Boolean,
      default: false,
    },
    importProject: {
      type: Boolean,
      default: false,
    },
    id: {
      type: [Number, String, null],
      default: null,
    },
  },
  data() {
    return {
      dialog: this.value,
      loading: false,
      name: '',
      desc: '',
      file: null,
      unzipped: {},
      unzipError: '',
      inoFile: null,
    };
  },
  computed: {
    ...mapGetters('projects', { projectFind: 'find', projectGet: 'get' }),
    ref() {
      if (!this.name.trim()) return '';
      let ref = snakeCase(this.name);
      let count = 1;
      while (this.projectFind({ query: { ref, _id: { $ne: this.id } } }).total) {
        count += 1;
        ref = `${snakeCase(this.name)}_${count}`;
      }
      return ref;
    },
    inoFiles() {
      return Object.keys(this.unzipped).filter((i) => /\.ino$/.test(i));
    },
    inoError() {
      return Object.keys(this.unzipped).length && !this.inoFiles.length ? 'Invalid project file, no .ino files found.' : '';
    },
    valid() {
      return !!this.name.trim()
        && (!this.importProject || /^application\/(x-)?zip/.test(this.file.type))
        && !this.unzipError
        && !this.inoError;
    },
  },
  mounted() {
    this.editProject();
  },
  watch: {
    id(to, from) {
      if (to === from) return;
      this.editProject();
    },
    value(to, from) {
      if (to === from || to === this.dialog) return;
      this.dialog = to;
    },
    dialog(to, from) {
      if (to === from || to === this.value) return;
      this.$emit('input', to);
    },
    async file(to) {
      if (!to) return;
      if (!this.name) this.name = startCase(to.name.split('/').pop().replace(/\.[^.]+$/, ''));
      this.unzipError = '';
      try {
        this.unzipped = await this.$bundler.unzipFile(to);
        if (!Object.keys(this.unzipped).length) {
          this.unzipError = 'Invalid Zip File. Zip appears empty.';
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
        this.unzipError = 'Invalid Zip File. Unable to unzip the file.';
      }
    },
    inoFiles(to, from) {
      if (JSON.stringify(to) === JSON.stringify(from)) return;
      if (!this.inoFile || !to.includes(this.inoFile)) {
        [this.inoFile] = to;
      }
    },
  },
  methods: {
    setCurrentProject(item) {
      this.$store.commit('setCurrentProject', item.uuid);
    },
    editProject() {
      if (this.id === null);
      const pro = this.projectGet(this.id);
      if (!pro) return;
      this.name = pro.name;
      this.desc = pro.desc;
    },
    reset() {
      if (this.id === null) {
        this.name = '';
        this.desc = '';
      }
      this.file = null;
      this.unzipped = {};
      this.inoFile = null;
      this.dialog = false;
    },
    async newProject() {
      if (!this.valid) return;
      const { Project, File } = this.$FeathersVuex.api;
      this.loading = true;
      let project = new Project({
        name: this.name.trim(),
        desc: this.desc,
        ref: this.ref,
        ...(this.id ? { _id: this.id } : {}),
      });
      project = await project.save();
      if (this.importProject) {
        await this.$bundler.importProjectFiles(project, this.unzipped, this.inoFile);
        this.setCurrentProject(project);
      } else if (this.id === null) {
        const file = new File({
          name: `${project.ref}.ino`,
          ref: `${project.ref}/${project.ref}.ino`,
          body: defaultCode,
          contentType: 'text/x-arduino',
          main: true,
          projectId: project.uuid,
        });
        await file.save();
        this.setCurrentProject(project);
      } else {
        const files = await File.find({ query: { projectId: project.uuid } });
        await Promise.all(files.map(async (file) => {
          if (file.main) {
            // eslint-disable-next-line no-param-reassign
            file.name = `${project.ref}.ino`;
            // eslint-disable-next-line no-param-reassign
            file.ref = `${project.ref}/${project.ref}.ino`;
          } else {
            // eslint-disable-next-line no-param-reassign
            file.ref = `${project.ref}/${file.ref.replace(/^[^/]*\//, '')}`;
          }
          file.save();
        }));
      }
      this.loading = false;
      this.reset();
    },
  },
};
</script>
