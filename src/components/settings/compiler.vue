<template>
  <v-card outlined>
    <v-card-title>
      Code Compiler
    </v-card-title>
    <v-card-text>
      <v-row>
        <v-col cols="12" sm="6" md="4" class="pt-0">
          <v-checkbox
            :input-value="!!settings.value.verbose"
            label="Verbose Output"
            hint="Show almost too much detail on what's happening"
            persistent-hint
            @change="$set(settings.value, 'verbose', $event)"
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
    };
  },
  methods: {
    loadSettings() {
      const { Setting } = this.$FeathersVuex.api;
      const { data } = Setting.findInStore({ query: { key: 'compiler' } });
      if (data[0]) {
        [this.settings] = data;
        return;
      }
      const settings = new Setting({ key: 'compiler' });
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
    'settings.value.verbose': {
      handler(to, from) { this.handleSave(to, from); },
    },
  },
};
</script>
