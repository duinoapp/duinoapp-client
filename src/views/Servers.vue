<template>
  <v-container fluid grid-list-md>
    <v-data-iterator
      :items="find({ query: { ping: { $gte: 0 } } }).data"
      :rows-per-page-items="rowsPerPageItems"
      :pagination.sync="pagination"
      content-class="v-layout"
      row wrap
      align-center justify-center fill-height
    >
      <template v-slot:item="props">
        <v-flex
          xs12
          sm6
          md4
        >
          <v-card @click="setCurrent(props.item)" hover>
            <v-card-title><h4>{{ props.item.name }}</h4></v-card-title>
            <v-divider></v-divider>
            <v-list dense>
              <v-list-tile>
                <v-list-tile-content>Name:</v-list-tile-content>
                <v-list-tile-content class="align-end">
                  {{ props.item.name }}
                </v-list-tile-content>
              </v-list-tile>
              <v-list-tile>
                <v-list-tile-content>Address:</v-list-tile-content>
                <v-list-tile-content class="align-end">
                  {{ props.item.address }}
                </v-list-tile-content>
              </v-list-tile>
              <v-list-tile>
                <v-list-tile-content>Ping:</v-list-tile-content>
                <v-list-tile-content :class="`align-end ${pingClass(props.item.ping)}`">
                  {{ props.item.ping }} ms
                </v-list-tile-content>
              </v-list-tile>
              <v-list-tile>
                <v-list-tile-content>Location:</v-list-tile-content>
                <v-list-tile-content class="align-end">
                  {{ props.item.location }}
                </v-list-tile-content>
              </v-list-tile>
              <v-list-tile>
                <v-list-tile-content>Owner:</v-list-tile-content>
                <v-list-tile-content class="align-end">
                  {{ props.item.owner }}
                </v-list-tile-content>
              </v-list-tile>
              <v-list-tile>
                <v-list-tile-content>Website:</v-list-tile-content>
                <v-list-tile-content class="align-end">
                  {{ props.item.website }}
                </v-list-tile-content>
              </v-list-tile>
              <v-list-tile>
                <v-list-tile-content>Description:</v-list-tile-content>
                <v-list-tile-content class="align-end">
                  {{ props.item.description }}
                </v-list-tile-content>
              </v-list-tile>
            </v-list>
          </v-card>
        </v-flex>
      </template>
    </v-data-iterator>
  </v-container>
</template>
<script>
import { mapGetters, mapMutations } from 'vuex';

export default {
  data: () => ({
    rowsPerPageItems: [4, 8, 12],
    pagination: {
      rowsPerPage: 4,
    },
  }),
  computed: {
    ...mapGetters('servers', ['find']),
  },
  methods: {
    ...mapMutations('servers', ['setCurrent']),
    pingClass(ping) {
      if (ping <= 100) return 'success--text';
      if (ping <= 250) return 'warning--text';
      return 'error--text';
    },
  },
};
</script>
