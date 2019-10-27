<template>
  <v-row>
    <v-col cols="6">
      <v-list>
        <v-list-group
          v-for="core in cores"
          :key="core.id"
          :value="currentBoard && currentBoard.id.includes(core.id)"
        >
          <template v-slot:activator>
            <v-list-item-title>{{core.name}}</v-list-item-title>
          </template>

          <v-list-item
            v-for="board in findBoards({ query: { id: new RegExp(`^${core.id}`) } }).data"
            :key="board.id"
            @click="setCurrent(board)"
            :value="currentBoard && currentBoard.id === board.id"
          >
            <v-list-item-icon></v-list-item-icon>
            <v-list-item-title>{{board.name}}</v-list-item-title>
          </v-list-item>
        </v-list-group>
      </v-list>
    </v-col>
    <v-col cols="6"></v-col>
  </v-row>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex';

export default {
  data: () => ({
    featured: ['arduino:avr', 'esp8266:esp8266'],
  }),
  computed: {
    ...mapGetters('cores', { findCores: 'find' }),
    ...mapGetters('boards', { currentBoard: 'current', findBoards: 'find' }),
    cores() {
      const cores = this.findCores({ query: { $sort: { name: 1 } } }).data;
      return [
        ...cores.filter(core => this.featured.includes(core.id)),
        ...cores.filter(core => !this.featured.includes(core.id)),
      ];
    },
  },
  methods: {
    ...mapMutations('boards', ['setCurrent']),
  },
};
</script>
