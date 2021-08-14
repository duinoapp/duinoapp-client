<template>
  <v-card outlined>
    <v-card-title>
      Serial Monitor
    </v-card-title>
    <v-card-text>
      <v-row>
        <v-col cols="12" sm="6" md="4" class="pt-0">
          <v-select
            v-model="settings.value.encoding"
            :items="encodings"
            label="Encoding"
            outlined
          />
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>

export default {
  data() {
    return {
      settings: { value: {} },
      encodings: [
        { value: 'ascii', text: 'ASCII' },
        { value: 'utf8', text: 'UTF-8 (unicode + emojis)' },
        { value: 'utf16le', text: 'UTF-16 LE' },
        { value: 'ucs2', text: 'UCS-2' },
        { value: 'base64', text: 'Base64' },
        { value: 'hex', text: 'Hex' },
        { value: 'latin1', text: 'Latin1' },
      ],
    };
  },
  methods: {
    loadSettings() {
      const { Setting } = this.$FeathersVuex.api;
      const { data } = Setting.findInStore({ query: { key: 'monitor' } });
      if (data[0]) {
        [this.settings] = data;
        return;
      }
      const settings = new Setting({ key: 'monitor' });
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
    'settings.value.encoding': {
      handler(to, from) { this.handleSave(to, from); },
    },
  },
};
</script>
