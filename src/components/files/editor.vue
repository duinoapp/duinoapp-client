<template>
  <MonacoEditor
    ref="editor"
    class="editor"
    :value="code"
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
    };
  },
  computed: {
    currentFile() {
      const { File } = this.$FeathersVuex.api;
      return File.findInStore({ query: { id: this.$store.getters.currentFile } }).data[0] || {};
    },
    code() { return get(this.currentFile, 'editor.body') || get(this.currentFile, 'body') || ''; },
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
      set(this.currentFile, 'body', get(this.currentFile, 'editor.body'));
      set(this.currentFile, 'editor.body', null);
      this.currentFile.save();
    },
    monacoMount(monaco) { this.monaco = monaco; },
    editorMount(editor) {
      // eslint-disable-next-line no-bitwise
      editor.addCommand(this.monaco.KeyMod.CtrlCmd | this.monaco.KeyCode.KEY_S, () => this.save());
    },
  },
};
</script>

<style>
.editor {
  width: 100%;
  height: calc(100vh - 88px);
}
</style>
