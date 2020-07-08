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
    FORCE_REFRESH() {
      window.location.reload(true);
    },
  },
})
export default class App extends Vue {}
</script>

<style>
@font-face {
  font-family: '04b03';
  src: url('/04B_03__.TTF') format('truetype');
}

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
  font-family: '04b03';
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
  width: 500px;
}

@media only screen and (max-width: 500px)  {
  .chat {
    display: none;
  }
}

[v-cloak] {
  display: none;
}
</style>
