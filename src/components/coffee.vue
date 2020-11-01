<template>
  <v-menu
    v-bind="{ top, bottom, left, right }"
    :value="donateMenu"
    max-height="620px"
    content-class="bmc-wrap"
    offset-y
    @input="toggleDonateMenu"
  >
    <template #activator="{ on: menuOn }">
      <v-tooltip v-bind="{ top, bottom, left, right }">
        <template #activator="{ on: tooltipOn }">
          <slot name="activator" :on="{...menuOn, ...tooltipOn}">
            <v-btn :color="color" class="mt-n1" x-small fab v-on="{...menuOn, ...tooltipOn}">
              <v-icon v-show="donateMenu">mdi-close</v-icon>
              <v-img
                v-show="!donateMenu"
                src="https://cdn.buymeacoffee.com/widget/assets/coffee%20cup.svg"
                height="20px"
                contain
              />
            </v-btn>
          </slot>
        </template>
        <span>
          {{message}}
        </span>
      </v-tooltip>
    </template>
    <iframe
      :src="bmcLink"
      class="bmc-iframe"
    />
  </v-menu>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex';

export default {
  props: {
    id: {
      type: String,
      default: 'mrfrase3',
    },
    description: {
      type: String,
      default: 'Support me on Buy me a coffee!',
    },
    message: {
      type: String,
      default: 'Enjoy this project? Buy the developer a coffee!',
    },
    color: {
      type: String,
      default: '#5F7FFF',
    },
    top: {
      type: Boolean,
      default: false,
    },
    bottom: {
      type: Boolean,
      default: false,
    },
    left: {
      type: Boolean,
      default: false,
    },
    right: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    ...mapGetters(['donateMenu']),
    bmcLink() {
      return `https://www.buymeacoffee.com/widget/page/${this.id}?description=${encodeURIComponent(this.description)}&color=${encodeURIComponent(this.color)}`;
    },
  },
  methods: {
    ...mapMutations(['toggleDonateMenu']),
  },
};
</script>

<style scoped>
.bmc-iframe {
  margin: 0px;
  border: 0px;
  height: calc(100vh - 140px);
  opacity: 1;
  width: calc(100vw - 38px);
  max-width: 350px;
  border-radius: 10px;
  box-shadow: rgba(0, 0, 0, 0.4) 0px 8px 16px;
  background: url(https://cdn.buymeacoffee.com/assets/img/widget/loader.svg) center center / 64px no-repeat rgb(255, 255, 255);
  z-index: 999999;
  transition: all 0.4s ease 0s;
  max-height: 620px;
}
</style>
<style>
.bmc-wrap {
  overflow-y: hidden;
}
</style>
