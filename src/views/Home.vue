<template>
  <v-main>
    <v-row align="center" justify="center">
      <v-col cols="12">
        <v-img
          :src="require('../assets/logo.svg')"
          class="my-3"
          contain
          height="200"
        />
      </v-col>
      <v-col md="8" lg="6" class="text-center">
        <h1 class="text-h1">Welcome to Duino App</h1>
      </v-col>
      <v-col cols="12">&nbsp;</v-col>
      <v-col cols="auto" class="text-center">
        <p class="text-subtitle-1">
          For help and collaboration with others,
          <br>please join our online
          <a :href="discordLink" target="_blank">Discord Community</a>
        </p>
        <p class="text-subtitle-1">
          To upload your first code you must:
        </p>
        <ol class="text-left">
          <li>Create a project and write your code.</li>
          <li>Select a compile server.</li>
          <li>Select which board you're using.</li>
          <li>Select a serial port to upload to.</li>
          <li>Press the upload button in the top right.</li>
        </ol>
      </v-col>
      <v-col cols="12">&nbsp;</v-col>
      <v-col cols="auto" class="text-center">
        <p>
          Duino App is completely free, but unfortunately hosting is not.
          <br>
          If you like this project, please consider
          <a @click="toggleDonateMenu">buying the developers a coffee</a>.
        </p>
      </v-col>
    </v-row>
  </v-main>
</template>

<script>
import { mapMutations } from 'vuex';

export default {
  data() {
    return {
      discordLink: 'https://discord.gg/FKQp7N4',
    };
  },
  methods: {
    ...mapMutations(['toggleDonateMenu']),
  },
};
</script>
