<template>
  <v-card outlined>
    <v-card-title>
      Code Compiler
    </v-card-title>
    <v-card-text>
      <v-row>
        <v-col cols="12" sm="6" md="4" class="py-0">
          <v-checkbox
            :input-value="!!settings.value.verbose"
            label="Verbose Output"
            hint="Show almost too much detail on what's happening"
            persistent-hint
            @change="$set(settings.value, 'verbose', $event)"
          />
        </v-col>
        <v-col cols="12" sm="6" md="4" class="py-0">
          <v-checkbox
            :input-value="!!settings.value.preferLocal"
            label="Prefer Local Upload"
            hint="If possible, will use a locally ported upload protocol over using the remote server"
            persistent-hint
            @change="$set(settings.value, 'preferLocal', $event)"
          />
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>

export default {
  computed: {
    settings() {
      const { Setting } = this.$FeathersVuex.api;
      const { data } = Setting.findInStore({ query: { key: 'compiler' } });
      if (data[0]) return data[0];
      const settings = new Setting({ key: 'compiler' });
      settings.save();
      return settings;
    },
  },
  methods: {
    handleSave(to, from) {
      if (JSON.stringify(to) === JSON.stringify(from)) return false;
      this.settings.save();
      return true;
    },
  },
  watch: {
    'settings.value.verbose': {
      handler(to, from) { this.handleSave(to, from); },
    },
    'settings.value.preferLocal': {
      handler(to, from) { this.handleSave(to, from); },
    },
  },
};
</script>
