<template>
  <MonacoEditor
    ref="editor"
    v-bind="$attrs"
    :options="editorOptions"
    :theme="settings.theme"
    v-resize="resize"
    @change="$emit('input', $event)"
    @editorDidMount="editorMount"
    @editorWillMount="monacoMount"
  />
</template>

<script>
import MonacoEditor from 'vue-monaco';
import pick from 'lodash/pick';

export default {
  components: {
    MonacoEditor,
  },
  props: {
    options: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      monaco: null,
    };
  },
  computed: {
    settings() {
      const { Setting } = this.$FeathersVuex.api;
      const { data } = Setting.findInStore({ query: { key: 'editor' } });
      if (data[0]) return data[0].value;
      return {};
    },
    editorOptions() {
      return {
        ...pick(this.settings ?? {}, ['fontSize', 'wordWrap', 'scrollBeyondLastLine']),
        ...this.options,
      };
    },
  },
  methods: {
    resize() {
      this.$refs.editor.getEditor()?.layout();
    },
    monacoMount(monaco) { this.monaco = monaco; },
    editorMount(editor) {
      // eslint-disable-next-line no-bitwise
      editor.addCommand(this.monaco.KeyMod.CtrlCmd | this.monaco.KeyCode.KEY_S, () => this.save());
    },
  },
};
</script>
