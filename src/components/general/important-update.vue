<template>
  <v-dialog v-model="dialog" max-width="500" persistent>
    <v-card>
      <v-card-title>
        <v-icon left color="error">mdi-alert-circle-outline</v-icon>
        Important! Things Have Changed!
        <v-spacer />
        <v-chip color="primary">
          v{{version}}
        </v-chip>
      </v-card-title>
      <v-card-text class="black--text">
        <p>
          This is a large update to how compiling and uploading works in the background.
        </p>
        <p>
          You no longer need a server close to your location,
          the existing regional servers will no longer be compatible/available
          and have been replaced with one main compile server.
        </p>
        <p>
          Gobal library support has been removed in this update.
          Instead, you'll need to specify which libraries you want for a project in the
          Library Manager, which you can find under Tools.
        </p>
        <p>
          The auto save interval has been removed, and will now instantly always save.
          This change is not likely to affect you,
          but it was causing issues where old code was being sent to the compiler.
        </p>
      </v-card-text>
      <v-card-actions>
        <v-checkbox
          v-model="dontShow"
          label="Don't show this again"
          class="mt-0"
          hide-details
        />
        <v-spacer />
        <v-btn color="primary" depressed @click="close">
          Ok, got it.
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>

const versionToNum = (v) => v.split('.').map((n) => n.padStart(5, '0')).join('');
const lesserVersion = (version) => {
  const existing = window.localStorage.dismissUpdateVersion || '0.0.0';
  return versionToNum(existing) < versionToNum(version);
};

export default {
  data() {
    const version = '3.2.0';
    return {
      dialog: lesserVersion(version),
      dontShow: false,
      version,
    };
  },
  methods: {
    close() {
      if (this.dontShow) window.localStorage.dismissUpdateVersion = this.version;
      this.dialog = false;
    },
  },
};
</script>
