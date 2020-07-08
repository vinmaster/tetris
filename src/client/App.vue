<template>
  <div id="app">
    <div class="content">WORK IN PROGRESS</div>
    <transition name="slide-fade">
      <button class="toggle" type="button" @click="toggleChat()" v-if="!chatOpen">
        <svg viewBox="0 0 100 80" width="40" height="40">
          <rect width="100" height="15"></rect>
          <rect y="25" width="100" height="15"></rect>
          <rect y="50" width="100" height="15"></rect>
        </svg>
      </button>

      <div class="chat" v-if="chatOpen">
        <chat @toggle="toggleChat"></chat>
      </div>
    </transition>
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
      console.log('[connected]');
      const username = prompt('Please enter a username:');
      this.$socket.client.emit('REGISTER', username);
    },
    disconnect() {
      console.log('[disconnected]');
    },
    LOGS(data) {
      console.log('[LOGS]', data);
    },
    FORCE_REFRESH() {
      window.location.reload(true);
    },
  },
})
export default class App extends Vue {
  chatOpen = false;

  toggleChat(msg: any) {
    this.chatOpen = !this.chatOpen;
  }
}
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

@media only screen and (max-width: 500px) {
  .chat {
    display: none;
  }
}

[v-cloak] {
  display: none;
}

.slide-fade-enter-active {
  transition: all 0.3s ease;
}
.slide-fade-leave-active {
  transition: all 0.8s cubic-bezier(1, 0.5, 0.8, 1);
}
.slide-fade-enter, .slide-fade-leave-to
/* .slide-fade-leave-active below version 2.1.8 */ {
  transform: translateX(500px);
  opacity: 0;
}
</style>
