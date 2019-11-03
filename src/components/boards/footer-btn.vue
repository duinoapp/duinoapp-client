<template>
  <div>
    <v-btn text dense small v-if="currentBoard" to="/tools/boards">
      Board: {{currentBoard.name}}
    </v-btn>
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
