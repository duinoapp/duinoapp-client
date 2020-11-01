<template>
  <v-card outlined>
    <v-card-title>
      Code Editor
    </v-card-title>
    <v-card-text>
      <v-row>
        <v-col cols="12" sm="6" md="4">
          <v-select
            v-model="settings.value.theme"
            :items="themes"
            label="Theme"
            outlined
          />
        </v-col>
        <v-col cols="12" sm="6" md="4">
          <v-text-field
            v-model.number="settings.value.autoSaveInterval"
            label="Auto-Save Interval"
            hint="Seconds between auto-saves. 0 disables auto-save."
            type="number"
            min="0"
            step="1"
            persistent-hint
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
      themes: [
        { text: 'VS Code Light (default)', value: 'vs' },
        { text: 'VS Code Dark', value: 'vs-dark' },
        { text: 'High Contrast', value: 'hc-black' },
      ],
    };
  },
  computed: {
    settings() {
      const { Setting } = this.$FeathersVuex.api;
      const { data } = Setting.findInStore({ query: { key: 'editor' } });
      if (data[0]) return data[0];
      const settings = new Setting({ key: 'editor' });
      settings.save();
      return settings;
    },
  },
  watch: {
    settings: {
      handler(to, from) {
        if (JSON.stringify(to) === JSON.stringify(from)) return;
        to.save();
      },
      deep: true,
    },
  },
};
</script>
