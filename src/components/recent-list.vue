<template>
  <v-list dense :style="{ padding: '0' }">
    <v-list-item v-if="currentItem" color="primary">
      <v-list-item-title>{{get(currentItem, itemText)}}</v-list-item-title>
    </v-list-item>
    <v-list-item
      v-for="item in items"
      :key="item.uuid"
      @click="setCurrent(item)"
    >
      <v-list-item-title>{{get(item, itemText)}}</v-list-item-title>
    </v-list-item>
    <v-divider v-if="currentItem || items.length"/>
    <v-list-item :to="manageLink">
      <v-list-item-title>{{manageLabel}}</v-list-item-title>
    </v-list-item>
  </v-list>
</template>

<script>
import get from 'lodash/get';

const query = { $sort: { 'meta.currentAt': -1 }, $limit: 5 };

export default {
  props: {
    service: {
      type: String,
      default: 'boards',
    },
    manageLabel: {
      type: String,
      default: 'Boards Manager...',
    },
    manageLink: {
      type: String,
      default: '/tools/boards',
    },
    itemText: {
      type: String,
      default: 'name',
    },
  },
  data() {
    return {
      get,
    };
  },
  computed: {
    modelName() {
      return this.$FeathersVuex.api.byServicePath[this.service].modelName;
    },
    findItems() {
      if (!this.service) return () => ({ data: [] });
      return this.$store.getters[`${this.service}/find`];
    },
    currentItem() {
      let current;
      if (this.service) {
        [current] = this.$store.getters[`${this.service}/find`]({
          query: { uuid: this.$store.getters[`current${this.modelName}`] },
        }).data;
      }
      return current;
    },
    items() {
      return this.findItems({ query }).data
        .filter((item) => !this.currentItem || item.uuid !== this.currentItem.uuid);
    },
  },
  methods: {
    setCurrent(item) {
      return this.$store.commit(`setCurrent${this.modelName}`, item.uuid);
    },
  },
  mounted() {
    if (this.service) {
      this.$store.dispatch(`${this.service}/find`, { query });
    }
  },
};
</script>
