<template>
  <v-row class="pa-4" align="center">
    <v-col cols="auto">
      <v-icon large left>mdi-cogs</v-icon>
    </v-col>
    <v-col cols="auto">
      <h1>Settings</h1>
    </v-col>
    <v-col cols="12">
      <editor />
    </v-col>
    <v-col cols="12">
      <compiler />
    </v-col>
    <v-col cols="12">
      <monitor />
    </v-col>
  </v-row>
</template>

<script>
import Editor from '../../components/settings/editor.vue';
import Compiler from '../../components/settings/compiler.vue';
import Monitor from '../../components/settings/monitor.vue';

export default {
  components: {
    Editor,
    Compiler,
    Monitor,
  },
};
</script>
