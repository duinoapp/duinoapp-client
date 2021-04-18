<template>
  <v-row
    no-gutters
    :style="{ maxHeight: 'calc(100vh - 88px)' }"
  >
    <v-col cols="6" lg="4" :style="{ maxHeight: 'inherit', overflowY: 'auto' }">
      <v-list>
        <v-list-item>
          <v-list-item-content>
            <v-list-item-title class="text-h5"><b>Select Your Board</b></v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item>
          <v-text-field
            label="Search"
            append-icon="mdi-magnify"
            v-model="search"
          />
        </v-list-item>
        <v-divider />
        <v-list-item v-if="this.search.trim() && !searchBoards.length">
          <v-list-item-content>
            <v-list-item-subtitle>No boards found that match that search</v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
        <v-list-item v-if="!cores.length">
          <v-list-item-content>
            <v-list-item-subtitle>
              No board data loaded, try
              <router-link to="/tools/servers">selecting a server</router-link>
              to load it in.
            </v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
        <v-list-item
            v-for="board in searchBoards"
            :key="board.uuid"
            @click="setCurrent(board)"
            :input-value="currentBoard && currentBoard.uuid === board.uuid"
            two-line
          >
            <v-list-item-content>
              <v-tooltip top>
                <template #activator="{ on }">
                  <v-list-item-title
                    v-on="on"
                    :class="currentBoard && currentBoard.uuid === board.uuid
                      ? 'primary--text' : undefined"
                  >
                    {{board.name}}
                  </v-list-item-title>
                </template>
                <span>{{board.name}}</span>
              </v-tooltip>
              <v-list-item-subtitle>
                {{
                  (cores.find(core => board.fqbn.includes(`${core.coreId}:`)) || { name: '' }).name
                }}
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        <v-list-group
          v-show="findBoards({
            query: { fqbn: new RegExp(`^${core.coreId}:`), supported: true },
          }).total"
          v-for="core in this.search.trim() ? [] : cores"
          :key="core.uuid"
          :value="currentBoard && currentBoard.fqbn.includes(`${core.coreId}:`)"
        >
          <template v-slot:activator>
            <v-list-item-title
              :class="
                currentBoard && currentBoard.fqbn.includes(`${core.coreId}:`)
                ? 'primary--text'
                : undefined
              "
            >
              {{core.name}}
            </v-list-item-title>
          </template>

          <v-list-item
            v-for="board in findBoards({
              query: { fqbn: new RegExp(`^${core.coreId}:`), supported: true },
            }).data"
            :key="board.uuid"
            @click="setCurrent(board)"
            :input-value="currentBoard && currentBoard.uuid === board.uuid"
          >
            <v-tooltip top>
              <template #activator="{ on }">
                <v-list-item-title v-on="on" class="pl-4">{{board.name}}</v-list-item-title>
              </template>
              <span>{{board.name}}</span>
            </v-tooltip>
          </v-list-item>
        </v-list-group>
      </v-list>
    </v-col>
    <v-col cols="6" lg="8" :style="{ maxHeight: 'inherit', overflowY: 'auto' }">
      <v-card
        v-if="currentBoard"
        elevation="0"
      >
        <v-card-title class="text-h4">
          {{currentBoard.name}} Settings
        </v-card-title>
        <v-card-text v-if="!currentBoard.config_options">
          This board has no configuration options.
        </v-card-text>
        <v-card-text v-else>
          <v-row>
            <v-col
              cols="12"
              lg="4"
              v-for="(config, i) in currentBoard.config_options"
              :key="i"
            >
              <v-select
                :items="config.values"
                :value="(config.values.find(val => val.selected) || {}).value || null"
                @input="updateValue(i, $event)"
                :label="config.option_label"
                item-text="value_label"
              />
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  data: () => ({
    featured: ['arduino:avr', 'esp8266:esp8266'],
    search: '',
  }),
  computed: {
    ...mapGetters('cores', { findCores: 'find' }),
    ...mapGetters('boards', { findBoards: 'find' }),
    cores() {
      const cores = this.findCores({ query: { $sort: { name: 1 } } }).data;
      return [
        ...cores.filter((core) => this.featured.includes(core.coreId)),
        ...cores.filter((core) => !this.featured.includes(core.coreId)),
      ];
    },
    searchBoards() {
      if (!this.search.trim()) return [];
      const reg = new RegExp(`(${this.search.trim().replace(/\s+/g, ')|(')})`, 'i');
      return this.findBoards({
        query: {
          supported: true,
          $or: [{ name: reg }, { fqbn: reg }],
          $sort: { name: 1 },
        },
      }).data;
    },
    currentBoard() {
      const { Board } = this.$FeathersVuex.api;
      return Board.findInStore({ query: { uuid: this.$store.getters.currentBoard } }).data[0];
    },
  },
  methods: {
    updateValue(configi, value) {
      // eslint-disable-next-line camelcase
      const config_options = this.currentBoard.config_options.map((con, i) => (configi !== i
        ? con
        : {
          ...con,
          values: con.values.map((val) => ({
            ...val,
            selected: val.value === value,
          }
          )),
        }));

      const config = config_options.reduce((a, con) => {
        // eslint-disable-next-line no-param-reassign
        a[con.option] = (con.values.find((val) => val.selected) || {}).value;
        return a;
      }, {});
      (new this.$FeathersVuex.api.Board({
        ...this.currentBoard,
        config_options,
        config,
      })).save();
    },
    setCurrent(item) {
      this.$store.commit('setCurrentBoard', item.uuid);
    },
  },
  mounted() {
    const { Board } = this.$FeathersVuex.api;
    Board.find({ query: { $limit: 9999 } });
  },
};
</script>
