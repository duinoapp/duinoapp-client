<template>
  <div>
    <v-data-table
      :headers="headers"
      :items="items"
      :options.sync="options"
      :server-items-length="total"
      :loading="loading"
      :footer-props="{
        itemsPerPageOptions: pageOpts,
      }"
    >
      <template #item.author="{ item }">
        {{item.author.replace(/\s\S+@\S+.\S+/g, '')}}
      </template>
      <template #item.actions="{ item }">
        <v-tooltip top>
          <template #activator="{ on }">
            <v-btn icon v-on="on" @click="currentLib = item">
              <v-icon>mdi mdi-information-outline</v-icon>
            </v-btn>
          </template>
          <span>More Info</span>
        </v-tooltip>
      </template>
    </v-data-table>
    <v-dialog :value="!!currentLib" max-width="500" @input="currentLib = null">
      <v-card v-if="currentLib">
        <v-card-title>
          {{currentLib.name}}
          <v-spacer />
          <v-chip color="info">
            {{currentLib.version}}
          </v-chip>
        </v-card-title>
        <v-card-text>
          <pre>{{ getDesc(currentLib) }}</pre>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            :href="currentLib.website"
            target="_blank"
            color="info"
            text
          >
            <v-icon left>mdi-open-in-new</v-icon>
            Website
          </v-btn>
          <v-btn text @click="currentLib = null">
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import debouncePromise from 'debounce-promise';

export default {
  props: {
    search: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      currentLib: null,
      total: 0,
      items: [],
      loading: true,
      options: {},
      headers: [
        {
          text: 'Name',
          value: 'name',
        },
        {
          text: 'Version',
          sortable: false,
          value: 'version',
        },
        {
          text: 'Author',
          sortable: false,
          value: 'author',
        },
        {
          text: 'Category',
          sortable: false,
          value: 'category',
        },
        {
          text: 'Actions',
          sortable: false,
          value: 'actions',
        },
      ],
      pageOpts: [5, 10, 25, 50, 100],
    };
  },
  watch: {
    options: {
      handler() {
        this.loadLibs();
      },
      deep: true,
    },
    search() {
      this.loadLibs();
    },
  },
  mounted() {
    this.loadLibs();
  },
  methods: {
    // eslint-disable-next-line func-names
    loadLibs: debouncePromise(async function () {
      this.loading = true;
      const { // eslint-disable-next-line no-unused-vars
        sortBy, sortDesc, page, itemsPerPage,
      } = this.options;
      try {
        const res = await this.$compiler.librariesSearch(
          this.search,
          itemsPerPage,
          page - 1,
          sortBy[0],
          sortDesc[0],
        );
        this.items = res.data;
        this.total = res.total;
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
      }
      this.loading = false;
    }, 500),
    getDesc(lib) {
      if (lib.paragraph.indexOf(lib.sentence) === 0) {
        return lib.paragraph;
      }
      return `${lib.sentence} ${lib.paragraph}`;
    },
  },
};
</script>

<style lang="scss" scoped>

pre {
  white-space: inherit;
  font-family: inherit;
}

</style>
