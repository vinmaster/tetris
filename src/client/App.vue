<template>
  <div id="app">
    <div class="content">
      <game-view :gameClient="gameClient"></game-view>
    </div>
    <button class="toggle-btn" type="button" @click="toggleChat()" v-show="!chatOpen">
      <svg viewBox="0 0 100 80" width="40" height="40">
        <rect width="100" height="15"></rect>
        <rect y="25" width="100" height="15"></rect>
        <rect y="50" width="100" height="15"></rect>
      </svg>
    </button>
    <transition name="slide">
      <div class="chat" v-show="chatOpen">
        <chat @toggle="toggleChat" :gameClient="gameClient"></chat>
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import 'nes.css/css/nes.min.css';
import { Component, Vue } from 'vue-property-decorator';
import Chat from './components/Chat.vue';
import GameView from './components/GameView.vue';
import { GameClient } from './lib/GameClient';
import { EventBus } from './lib/EventBus';

@Component({
  components: {
    Chat,
    GameView,
  },
})
export default class App extends Vue {
  gameClient: GameClient = new GameClient();
  chatOpen = window.innerWidth > 1200;

  constructor() {
    super();
    this.gameClient.socket = this.$socket;
    this.$options.sockets = this.gameClient.socketListeners;
  }

  toggleChat(msg: any) {
    this.chatOpen = !this.chatOpen;
    setTimeout(() => {
      EventBus.$emit('CHAT_TOGGLE', this.chatOpen);
    }, 500);
  }

  mounted() {
    this.gameClient.setup();
  }

  destroyed() {
    console.log('App destroyed');
    this.gameClient.teardown();
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
  background-color: black;
}

.content {
  flex: 1;
  background-color: black;
  font-size: 30px;
}

.chat {
  width: 400px;
}

@media only screen and (max-width: 500px) {
  .chat {
    display: none;
  }
}

[v-cloak] {
  display: none;
}

.toggle-btn {
  position: absolute;
  right: 0;
}

.slide-enter-active {
  transition: transform 0.3s ease;
}
.slide-leave-active {
  transition: transform 0.3s ease;
  /* transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1); */
}
.slide-enter,
.slide-leave-to {
  transform: translateX(500px);
}
</style>
