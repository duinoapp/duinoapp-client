<template>
  <v-row class="pa-4" align="center">
    <v-col cols="12">
      <h1>Duino App</h1>
      <h4>Version: {{version}}</h4>
      <p>
        Duino App is a web-based programing interface for programming microcontrollers,
        like an Arduino or ESP, and proxies process of compiling/uploading code from a remote server to the client.
      </p>
      <h3>This is cool, how can I help support it?</h3>
      <p>
        There are three main ways you can help support this project:
      </p>
      <ol>
        <li>Joing and engage with our <a :href="discordLink" target="_blank">Discord Community</a>.</li>
        <li>Host a community compile server.</li>
        <li>Buy the developer a coffee. (Compile servers aren't cheap)</li>
      </ol>
      <br>
      <v-btn color="#5F7FFF" depressed @click="toggleDonateMenu">
        <v-img
          src="https://cdn.buymeacoffee.com/widget/assets/coffee%20cup.svg"
          height="20px"
          width="20px"
          class="mr-2"
          contain
        />
        Tip a coffee
      </v-btn>
      <br>
      <br>
      <h3>Why does this exist?</h3>
      <p>
        Duino App is the next iteration of the popular Chromeduino project.
        Chromeduino was a chrome-app created as a way for people to program Arduinos on ChromeBooks for free.
        The project, intitially just being a proof-of-concept was limitted in functionality,
        notably missing third-party library and broad Arduino/ESP support, which to fix required a lot of work.
        Additionally, Google announced that it will be completely ceasing support for chrome-apps in the near future,
        this all forced the project into a complete re-code for version 3.
      </p>
      <h3>What does it do?</h3>
      <p>
        Compiled code is often referred to as "machine readable code", instruction-sets for your
        computing hardware to follow in 1's and 0's. This is complicated and very hard for humans to read,
        let alone write. To solve this problem, we code in a more human-friendly coding language,
        and then use a compiler to convert it into compiled code.
      </p>
      <p>
        Compiling code can be very complicated, especially compiling for light environments like that of an Arduino,
        and most compilers are written in what's called a low-level language, like C or C++.
        Browsers run on a high-level language called JavaScript, which is very different than C.
        Re-writing a compiler for JavaScript would be like trying to convert a VW Beetle into a Tesla.
      </p>
      <p>
        Uploading compiled code to a microcontroller is like transfering the compiled code file over USB to the microcontroller,
        like transfering files onto a USB thumbdrive.
        The process sounds simple but there is no universally agreed way on how to do it,
        every microcontroller has their own way of uploading, with each controller having their own uploader.
        This means in order to support a wide veriety of microcontrollers, each and every uploader needs
        to be converted to JavaScript.
      </p>
      <p>
        Duino App gets around these issues by using remote compile servers,
        which run a light-weight version of the Arduino Programmer
        that already supports compiling for many different controllers.
        Duino App takes the compiled code and uses custom uploaders written in JavaScript, like
        <a href="https://github.com/noopkat/avrgirl-arduino" target="_blank">avrgirl</a>,
        to upload your code onto your device.
      </p>
    </v-col>
  </v-row>
</template>

<script>
import { mapMutations } from 'vuex';
import { version } from '../../package.json';

export default {
  data() {
    return {
      version,
      discordLink: 'https://discord.gg/FKQp7N4',
    };
  },
  methods: {
    ...mapMutations(['toggleDonateMenu']),
  },
};
</script>
