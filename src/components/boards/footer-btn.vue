<template>
  <div>
    <v-tooltip top v-if="currentBoard">
      <template v-slot:activator="{ on }">
        <v-btn text dense small v-on="on" to="/tools/boards">
          Board: {{currentBoard.fqbn.split(':').shift()}} {{currentBoard.fqbn.split(':').pop()}}
        </v-btn>
      </template>
      <span>{{currentBoard.name}}</span>
    </v-tooltip>
    <v-btn text dense small v-else to="/tools/boards">Select Board</v-btn>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  data() {
    return {
      dialog: false,
    };
  },
  computed: {
    ...mapGetters('boards', { currentBoard: 'current' }),
  },
};
</script>
