<template>
  <ide
    class="code-editor"
    :value="code"
    :language="language"
    @input="updateCode($event)"
  />
</template>

<script>
import debouncePromise from 'debounce-promise';
import get from 'lodash/get';
import Ide from '../ide.vue';

export default {
  components: {
    Ide,
  },
  computed: {
    settings() {
      const { Setting } = this.$FeathersVuex.api;
      const { data } = Setting.findInStore({ query: { key: 'editor' } });
      if (data[0]) return data[0].value;
      return {};
    },
    currentFile() {
      const { File } = this.$FeathersVuex.api;
      return File.findInStore({ query: { uuid: this.$store.getters.currentFile } }).data[0] || {};
    },
    code() { return this.currentFile?.body ?? ''; },
    language() {
      switch (get(this.currentFile, 'contentType', 'text/plain')) {
        case 'text/x-arduino':
        case 'text/x-c':
          return 'cpp';
        case 'text/markdown':
          return 'markdown';
        default:
          return '';
      }
    },
  },
  methods: {
    updateCode(code) {
      this.$set(this.currentFile, 'body', code);
      this.save();
    },
    // eslint-disable-next-line func-names
    save: debouncePromise(async function () {
      await this.currentFile.save();
    }, 500),
  },
};
</script>

<style>
.code-editor {
  width: 100%;
  height: calc(100vh - 89px);
}
</style>
