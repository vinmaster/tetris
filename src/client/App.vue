<template>
  <div id="app">
    <div class="content">WORK IN PROGRESS</div>
    <div class="chat">
      <chat></chat>
    </div>
  </div>
</template>

<script lang="ts">
import 'nes.css/css/nes.min.css';
import { Component, Vue } from 'vue-property-decorator';
import Chat from './components/Chat.vue';

@Component({
  components: {
    Chat,
  },
  sockets: {
    connect() {
      console.log('connected');
      const username = prompt('Please enter a username:');
      this.$socket.client.emit('REGISTER', username);
    },
    disconnect() {
      console.log('disconnected');
    },
    LOGS(data) {
      console.log('LOGS', data);
    },
  },
})
export default class App extends Vue {}
</script>

<style>
@import url('https://fonts.googleapis.com/css?family=Press+Start+2P');

html,
body {
  height: 100%;
  padding: 0;
  margin: 0;
}

html,
body,
pre,
code,
kbd,
samp {
  font-family: 'Press Start 2P';
}

#app {
  height: 100%;
  display: flex;
}

.content {
  flex: 1;
  background-color: black;
  font-size: 30px;
}

.content:after {
  overflow: hidden;
  display: inline-block;
  vertical-align: bottom;
  -webkit-animation: ellipsis steps(4, end) 900ms infinite;
  animation: ellipsis steps(4, end) 900ms infinite;
  content: '\2026'; /* ascii code for the ellipsis character */
  width: 0px;
}

@keyframes ellipsis {
  to {
    width: 1.25em;
  }
}

@-webkit-keyframes ellipsis {
  to {
    width: 1.25em;
  }
}

.chat {
  max-width: 500px;
}

[v-cloak] {
  display: none;
}
</style>
