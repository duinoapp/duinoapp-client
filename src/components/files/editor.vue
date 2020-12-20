<template>
  <ide
    class="code-editor"
    :value="code"
    :language="language"
    @input="updateCode($event)"
  />
</template>

<script>
import get from 'lodash/get';
import set from 'lodash/set';
import Ide from '../ide.vue';

export default {
  components: {
    Ide,
  },
  data() {
    return {
      autoSaveTimeout: null,
    };
  },
  computed: {
    settings() {
      const { Setting } = this.$FeathersVuex.api;
      const { data } = Setting.findInStore({ query: { key: 'editor' } });
      if (data[0]) return data[0].value;
      const settings = new Setting({ key: 'editor' });
      settings.save();
      return settings.value;
    },
    currentFile() {
      const { File } = this.$FeathersVuex.api;
      return File.findInStore({ query: { uuid: this.$store.getters.currentFile } }).data[0] || {};
    },
    code() { return get(this.currentFile, 'editor.body') || get(this.currentFile, 'body') || ''; },
    language() {
      switch (get(this.currentFile, 'contentType', 'text/plain')) {
        case 'text/x-arduino':
        case 'text/x-c':
          return 'cpp';
        default:
          return '';
      }
    },
  },
  methods: {
    updateCode(code) {
      set(this.currentFile, 'editor.body', code);
      this.currentFile.save();
    },
    save(overrideFile) {
      const { File } = this.$FeathersVuex.api;
      const file = overrideFile || File.findInStore({ query: { uuid: this.$store.getters.currentFile } }).data[0] || {};
      if (typeof file?.editor?.body !== 'string') return;
      set(file, 'body', get(file, 'editor.body'));
      set(file, 'editor.body', null);
      file.save();
    },
    autoSave() {
      const { File } = this.$FeathersVuex.api;
      const files = File.findInStore({ query: { projectId: this.$store.getters.currentProject } }).data;
      if (this.settings.autoSaveInterval) files.forEach((file) => this.save(file));
      this.autoSaveTimeout = setTimeout(() => this.autoSave(), (this.settings.autoSaveInterval || 10) * 1000);
    },
  },
  mounted() {
    this.autoSave();
  },
  beforeDestroy() {
    if (this.autoSaveTimeout) clearTimeout(this.autoSaveTimeout);
  },
};
</script>

<style>
.code-editor {
  width: 100%;
  height: calc(100vh - 88px);
}
</style>
