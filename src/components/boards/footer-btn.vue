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

export default {
  data() {
    return {
      dialog: false,
    };
  },
  computed: {
    currentBoard() {
      const { Board } = this.$FeathersVuex.api;
      return Board.findInStore({ query: { id: this.$store.getters.currentBoard } }).data[0];
    },
  },
};
</script>
