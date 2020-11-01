<template>
  <v-row class="px-4" align="center">
    <v-col cols="12">
      <h1>Compile Servers</h1>
      <v-btn text small @click="info = !info">
        What is this?
        <v-icon rigth>mdi mdi-chevron-{{info ? 'down' : 'up'}}</v-icon>
      </v-btn>
      <p v-if="info">
        To make code readable by an Arduino/Device, we need to translate it from human-readable
        code into machine-readable code. We do this through a process called "compiling", using
        a program that is imaginatively called a "compiler".
      </p>
      <p v-if="info">
        Unfortunately, this application is not able to run a compiler, this means we need to ask
        another computer to run a compiler for us. This other computer is called a
        "Compile Server". You want to make sure that the compile server is as close to you as
        possile. A way we can tell how close a server is, is by using a ping, the lower the ping
        the better.
      </p>
      <p v-if="info">
        We aim to have as many compile servers available as possible around the world.
        If you don't have a server close enough to have a low ping, let us know or even consider
        hosting a server in our network.
        <a href="https://github.com/spaceneedle/chromeduino">More information can be found here.</a>
      </p>
      <br>&nbsp;
    </v-col>
    <v-col cols="auto">
      <span class="title">Click on a server to select it.</span>
    </v-col>
    <v-spacer />
    <v-col cols="auto">
      <custom-server />
    </v-col>
    <v-col cols="12">
      <v-data-iterator
        :items="find({ query: { ping: { $gte: 0 }, $sort: { isCustom: 1, ping: 1 } } }).data"
        content-class="v-layout"
        row wrap
        align-center justify-center fill-height
      >
        <template #default="props">
          <v-row><v-col
            v-for="item in props.items"
            :key="item.uuid"
            cols="12"
            sm="6"
            md="4"
            xl="3"
          >

            <v-card
              @click="setCurrent(item)"
              :ripple="!currentServer || currentServer.uuid !== item.uuid"
              :hover="!currentServer || currentServer.uuid !== item.uuid"
              :color="
                currentServer && currentServer.uuid === item.uuid
                ? '#CFC'
                : (hoverId === item.uuid ? '#EEE' : undefined)
              "
              outlined
              flat
              @mouseenter="hoverId = item.uuid"
              @mouseleave="hoverId = item.uuid === hoverId ? null : hoverId"
            >
              <v-list-item two-line>
                <v-list-item-content>
                  <v-list-item-title class="headline">
                    {{ item.name }}
                  </v-list-item-title>
                  <v-list-item-subtitle>
                    {{item.isCustom ? 'Custom Server' : 'Suggested Server'}}
                    {{
                      currentServer && currentServer.uuid === item.uuid
                      ? ' - Currently Selected'
                      : ''
                    }}
                  </v-list-item-subtitle>
                </v-list-item-content>
                <v-list-item-action v-if="item.isCustom">
                  <v-tooltip top>
                    <template v-slot:activator="{ on }">
                      <v-btn text icon @click="item.remove()" v-on="on">
                        <v-icon>mdi mdi-trash-can-outline</v-icon>
                      </v-btn>
                    </template>
                    <span>Remove Server</span>
                  </v-tooltip>
                </v-list-item-action>
              </v-list-item>
              <v-divider></v-divider>
              <v-list dense class="transparent">
                <v-list-item>
                  <v-list-item-content>Name:</v-list-item-content>
                  <v-list-item-content class="align-end">
                    {{ item.name }}
                  </v-list-item-content>
                  <v-list-item-icon/>
                </v-list-item>
                <v-list-item>
                  <v-list-item-content>Address:</v-list-item-content>
                  <v-list-item-content class="align-end">
                    {{ cleanLink(item.address) }}
                  </v-list-item-content>
                  <v-list-item-icon/>
                </v-list-item>
                <v-list-item>
                  <v-list-item-content>Ping:</v-list-item-content>
                  <v-list-item-content :class="`align-end ${pingClass(item.ping)}`">
                    {{ item.ping }} ms
                  </v-list-item-content>
                  <v-list-item-icon/>
                </v-list-item>
                <v-list-item>
                  <v-list-item-content>Location:</v-list-item-content>
                  <v-list-item-content class="align-end">
                    {{ item.location }}
                  </v-list-item-content>
                  <v-list-item-icon>
                    <flag :iso="item.country"/>
                  </v-list-item-icon>
                </v-list-item>
                <v-list-item>
                  <v-list-item-content>Owner:</v-list-item-content>
                  <v-list-item-content class="align-end">
                    {{ item.owner }}
                  </v-list-item-content>
                  <v-list-item-icon/>
                </v-list-item>
                <v-list-item :href="item.website">
                  <v-list-item-content>Website:</v-list-item-content>
                  <v-list-item-content class="align-end">
                    {{ cleanLink(item.website) }}
                  </v-list-item-content>
                  <v-list-item-icon/>
                </v-list-item>
                <v-list-item>
                  <v-list-item-content>Description:</v-list-item-content>
                  <v-list-item-content class="align-end">
                    {{ item.description }}
                  </v-list-item-content>
                  <v-list-item-icon/>
                </v-list-item>
              </v-list>
            </v-card>
          </v-col></v-row>
        </template>
      </v-data-iterator>
    </v-col>
  </v-row>
</template>
<script>
import { mapGetters } from 'vuex';
import CustomServer from '../../components/servers/custom-server.vue';

export default {
  components: {
    CustomServer,
  },
  data: () => ({
    info: false,
    hoverId: null,
  }),
  computed: {
    ...mapGetters('servers', { find: 'find' }),
    currentServer() {
      const { Server } = this.$FeathersVuex.api;
      return Server.findInStore({ query: { uuid: this.$store.getters.currentServer } }).data[0] || {};
    },
  },
  methods: {
    pingClass(ping) {
      if (ping <= 100) return 'success--text';
      if (ping <= 250) return 'warning--text';
      return 'error--text';
    },
    cleanLink(link) {
      return link.replace(/^https?:\/\//, '');
    },
    setCurrent(item) {
      this.$store.commit('setCurrentServer', item.uuid);
    },
  },
};
</script>
