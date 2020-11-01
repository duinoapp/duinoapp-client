<template>
  <MonacoEditor
    ref="editor"
    class="editor"
    :value="code"
    :theme="settings.theme"
    language="c"
    v-resize="resize"
    @change="updateCode($event)"
    @editorDidMount="editorMount"
    @editorWillMount="monacoMount"
  />
</template>

<script>
import MonacoEditor from 'vue-monaco';
import get from 'lodash/get';
import set from 'lodash/set';

export default {
  components: {
    MonacoEditor,
  },
  data() {
    return {
      monaco: null,
      autoSaveTimeout: null,
    };
  },
  computed: {
    currentFile() {
      const { File } = this.$FeathersVuex.api;
      return File.findInStore({ query: { uuid: this.$store.getters.currentFile } }).data[0] || {};
    },
    code() { return get(this.currentFile, 'editor.body') || get(this.currentFile, 'body') || ''; },
    settings() {
      const { Setting } = this.$FeathersVuex.api;
      const { data } = Setting.findInStore({ query: { key: 'editor' } });
      if (data[0]) return data[0].value;
      const settings = new Setting({ key: 'editor' });
      settings.save();
      return settings.value;
    },
  },
  methods: {
    updateCode(code) {
      set(this.currentFile, 'editor.body', code);
      this.currentFile.save();
    },
    resize() {
      this.$refs.editor.getEditor().layout();
    },
    save() {
      if (!this.currentFile?.editor?.body) return;
      set(this.currentFile, 'body', get(this.currentFile, 'editor.body'));
      set(this.currentFile, 'editor.body', null);
      this.currentFile.save();
    },
    monacoMount(monaco) { this.monaco = monaco; },
    editorMount(editor) {
      // eslint-disable-next-line no-bitwise
      editor.addCommand(this.monaco.KeyMod.CtrlCmd | this.monaco.KeyCode.KEY_S, () => this.save());
    },
    autoSave() {
      if (this.settings.autoSaveInterval) this.save();
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
.editor {
  width: 100%;
  height: calc(100vh - 88px);
}
</style>
