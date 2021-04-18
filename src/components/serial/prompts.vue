<template>
  <div>
    <v-dialog
      v-model="nameDialog"
      persistent
      max-width="500px"
    >
      <v-card>
        <v-card-title class="text-h5">
          Please give a name to your device.
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col>
              <v-text-field
                label="Device Name"
                outline
                v-model="name"
              />
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="closeName">Cancel</v-btn>
          <v-btn @click="saveName" color="primary" :disabled="!name.trim()">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="noSerialDialog"
      persistent
      max-width="500px"
    >
      <v-card>
        <v-card-title class="text-h5">
          Oh No! Your Browser isn't Supported!
        </v-card-title>
        <v-card-text>
          <p>
            Unfortunately, your browser does not support the features we need to upload
            code to your device. <!-- Currently supported browsers include Google Chrome, Opera,
            and the new Microsoft Edge browser. --> Currently only Google Chrome is supported.
          </p>
          <p>
            We are always working to try to make this application available to everyone,
            but unfortunately, this may take some time, so we ask you to please use a supported
            browser in the meantime.
          </p>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <!-- <v-btn text href="https://caniuse.com/#feat=webusb" target="_blank">Which Browser Can I Use?</v-btn> -->
          <v-btn href="https://www.google.com/chrome/" color="primary" @click.ctrl.shift.prevent="noSerialDialog = false">Get Chrome</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="accessDeniedDialog"
      max-width="500px"
    >
      <v-card>
        <v-card-title class="text-h5">
          Oh No! We cannot access the device!
        </v-card-title>
        <v-card-text>
          <p>
            For one reason or another, your operating system is blocking access
            to the device. The reason for this can vary depending on your operating
            system, below is a list of known fixes:
          </p>
          <ul>
            <li><a href="https://playground.arduino.cc/Linux/All/#Permission" target="_blank">
              Linux Serial Permissions
            </a></li>
          </ul>
          <br>
          <p>
            If none of those apply/worked for you, please get in touch on our GitHub.
          </p>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      nameDialog: false,
      noSerialDialog: false,
      accessDeniedDialog: false,
      name: '',
      value: null,
    };
  },
  methods: {
    closeName() {
      this.nameDialog = false;
      this.name = '';
      this.value = null;
    },
    async saveName() {
      if (!this.name.trim()) return;
      await this.$serial.setDeviceName(this.value, this.name);
      this.closeName();
    },
    loadSerial() {
      if (!this.$serial || !this.$serial.implementation) {
        setTimeout(() => this.loadSerial(), 100);
        return;
      }
      this.$serial.on('deviceNamePrompt', (value) => {
        this.value = value;
        this.nameDialog = true;
      });
      this.$serial.on('errorPrompt', (reason) => {
        if (reason === 'access_denied') this.accessDeniedDialog = true;
      });
      if (this.$serial.implementation === 'basic') {
        this.noSerialDialog = true;
      }
    },
  },
  mounted() {
    this.loadSerial();
  },
};
</script>
