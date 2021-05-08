<template>
  <v-card outlined>
    <v-card-title>
      Code Editor
    </v-card-title>
    <v-card-text>
      <v-row>
        <v-col cols="12" sm="6" md="4" class="py-0">
          <v-select
            v-model="settings.value.theme"
            :items="themes"
            label="Theme"
            outlined
          />
        </v-col>
        <v-col cols="12" sm="6" md="4" class="py-0">
          <v-combobox
            v-model.number="settings.value.fontSize"
            :items="[8, 9, 10, 11, 12, 14, 18, 24, 30, 36, 48]"
            label="Font Size"
            type="number"
            min="0"
            outlined
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" sm="6" md="4" class="py-0">
          <v-checkbox
            :input-value="settings.value.wordWrap !== 'off'"
            label="Word Wrapping"
            hint="Auto-wrap long lines around instead of scrolling"
            persistent-hint
            @change="$set(settings.value, 'wordWrap', $event ? 'bounded' : 'off')"
          />
        </v-col>
        <v-col cols="12" sm="6" md="4" class="py-0">
          <v-checkbox
            :input-value="!!settings.value.scrollBeyondLastLine"
            label="Scroll Beyond Last Line"
            hint="Allow scrolling past the very last line of text"
            persistent-hint
            @change="$set(settings.value, 'scrollBeyondLastLine', $event)"
          />
        </v-col>
      </v-row>
      <div class="mt-4">
        <a href="https://github.com/duinoapp/duinoapp-client/issues/5" target="_blank">
          Request more editor options.
        </a>
      </div>
    </v-card-text>
    <ide
      :value="demoCode"
      :options="{ readOnly: true }"
      language="cpp"
      class="settings-demo-editor"
    />
  </v-card>
</template>

<script>
import Ide from '../ide.vue';

const demoCode = `
// This is a preview of how your code will look :)
// the loop function runs over and over again forever
void loop() {
  digitalWrite(LED_BUILTIN, HIGH);   // turn the LED on (HIGH is the voltage level)
  Serial.println("High");
  delay(1000);                       // wait for a second
  digitalWrite(LED_BUILTIN, LOW);    // turn the LED off by making the voltage LOW
  Serial.println("Low");
  delay(1000);                       // wait for a second
}
`.trim();

export default {
  components: {
    Ide,
  },
  data() {
    return {
      themes: [
        { text: 'VS Code Light (default)', value: 'vs' },
        { text: 'VS Code Dark', value: 'vs-dark' },
        { text: 'High Contrast', value: 'hc-black' },
      ],
      demoCode,
      settings: { value: {} },
    };
  },
  methods: {
    loadSettings() {
      const { Setting } = this.$FeathersVuex.api;
      const { data } = Setting.findInStore({ query: { key: 'editor' } });
      if (data[0]) {
        [this.settings] = data;
        return;
      }
      const settings = new Setting({ key: 'editor' });
      settings.save();
      this.settings = settings;
    },
    handleSave(to, from) {
      if (JSON.stringify(to) === JSON.stringify(from)) return false;
      this.settings.save();
      return true;
    },
  },
  mounted() {
    this.loadSettings();
  },
  watch: {
    'settings.value.theme': {
      handler(to, from) {
        if (!this.handleSave(to, from)) return;
        this.$vuetify.theme.dark = /(dark)|(black)/.test(to ?? '');
      },
    },
    'settings.value.autoSaveInterval': {
      handler(to, from) { this.handleSave(to, from); },
    },
    'settings.value.fontSize': {
      handler(to, from) { this.handleSave(to, from); },
    },
    'settings.value.wordWrap': {
      handler(to, from) { this.handleSave(to, from); },
    },
    'settings.value.scrollBeyondLastLine': {
      handler(to, from) { this.handleSave(to, from); },
    },
  },
};
</script>

<style>
.settings-demo-editor {
  width: 100%;
  height: 200px;
}
</style>
