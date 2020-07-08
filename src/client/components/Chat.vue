<template>
  <section class="chat-container nes-container is-dark">
    <dialog class="nes-dialog" id="dialog-default">
      <form method="dialog">
        <pre class="dialog-content">{{ Object.values(connectedUsers) }}</pre>
        <menu class="dialog-menu">
          <button class="nes-btn">Close</button>
          <!-- <button class="nes-btn is-primary">Confirm</button> -->
        </menu>
      </form>
    </dialog>

    <button
      type="button"
      class="nes-btn is-primary"
      onclick="document.getElementById('dialog-default').showModal();"
    >
      Connected Users: {{ Object.keys(connectedUsers).length }}
    </button>

    <div class="chat-header">
      <h1 class="title">Chat</h1>
      <div>
        <span class="status" :class="[isOnline ? 'green' : 'red']">{{
          isOnline ? 'Online' : 'Offline'
        }}</span>
      </div>
    </div>
    <hr />
    <section class="message-list">
      <div class="message" v-for="(message, index) in messages" :key="index">
        <span>[</span>
        <span class="timestamp">{{ message.timestamp | dateFormat('hh:mmA') }}</span>
        <span>] </span>
        <span class="username">{{ message.username }}</span>
        <span>: </span>
        <span class="text">{{ message.text }}</span>
      </div>
    </section>
    <section class="input-container">
      <form v-on:submit.prevent="sendMessage">
        <input class="chat-input" type="text" v-model="userInput" />
        <button class="nes-btn" type="submit">Send</button>
      </form>
    </section>
  </section>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
// @ts-ignore
import dialogPolyfill from 'dialog-polyfill';

interface Message {
  text: string;
  timestamp: Date;
  username: string;
}

@Component
export default class Chat extends Vue {
  isOnline = false;
  connectedUsers = {};
  userInput = '';
  messages: Message[] = [
    {
      text: '/help - List commands',
      timestamp: new Date(),
      username: 'SYSTEM',
    },
  ];
  history: string[] = [];
  historyIndex = 0;

  constructor() {
    super();
    const that = this;

    this.$options.sockets = {
      connect() {
        // that.setup();
      },
      disconnect() {
        // that.teardown();
      },
      LIST_USERS(users) {
        that.onConnectedUsers(users);
      },
      CHAT_MESSAGE(data) {
        that.onNewMessage(data);
      },
    };
  }

  mounted() {
    this.setup();
  }

  destroyed() {
    this.teardown();
  }

  setup() {
    var dialog = document.querySelector('dialog');
    dialogPolyfill.registerDialog(dialog);

    this.$socket.client.emit('LIST_USERS');
    this.isOnline = true;

    const element = document.querySelector('.chat-input');
    if (element) {
      element.addEventListener('keyup', this.inputEvent.bind(this));
    }
  }

  teardown() {
    this.isOnline = false;

    const element = document.querySelector('.chat-input');
    if (element) {
      element.removeEventListener('keyup', this.inputEvent.bind(this));
    }
  }

  sendMessage() {
    this.$socket.client.emit('CHAT_MESSAGE', this.userInput);

    if (this.history[this.history.length - 1] !== this.userInput) {
      this.history.push(this.userInput);
    }
    this.historyIndex = this.history.length;
    this.userInput = '';
  }

  onNewMessage(data: any) {
    console.log('CHAT_MESSAGE', data);
    data.timestamp = new Date(data.timestamp);
    this.messages.push(data);
  }

  onConnectedUsers(users: any) {
    this.connectedUsers = users;
  }

  inputEvent(event: any) {
    switch (event.keyCode) {
      case 38:
        this.navigateHistory(-1);
        break;
      case 40:
        this.navigateHistory(1);
        break;
      default:
        break;
    }
  }

  navigateHistory(direction: number) {
    // TODO: go down
    if (
      (this.historyIndex <= 0 && direction === -1) ||
      (this.historyIndex >= this.history.length && direction === 1)
    )
      return;
    this.historyIndex += direction;
    this.userInput = this.history[this.historyIndex] || '';
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
dialog {
  position: fixed;
  top: 50%;
  transform: translate(0, -50%);
}

.chat-container {
  height: calc(100% - 8px);
  line-height: 1;
  display: flex;
  flex-direction: column;
}

.nes-container {
  padding: 0;
}

.chat-header {
  display: flex;
  justify-content: space-between;
}

.chat-header > div {
  font-size: 14px;
  line-height: 46px;
  margin-right: 10px;
}

.status {
  margin-left: 5px;
}

.status.green {
  background-color: #92cc41;
}

.status.red {
  background-color: #e76e55;
}

.title {
  margin: 12px 10px 10px 10px;
}

dialog > form {
  display: flex;
  flex-direction: column;
}

.dialog-content {
  max-height: 500px;
  overflow: scroll;
}

.dialog-menu {
  align-self: center;
  padding: 0;
}

hr {
  width: 100%;
  color: white;
  border-bottom: 3px solid white;
  margin-top: 0;
  margin-bottom: 0;
}

.input-container {
  margin: 10px;
}

.message-list {
  flex: 1 1;
  margin: 10px;
  overflow-y: scroll;
}

.message {
  font-size: 16px;
  line-height: 18px;
}

.text {
  white-space: pre-wrap;
}

.chat-input {
  width: 100%;
  height: 36px;
  font-size: 16px;
  overflow: scroll;
  line-height: 30px;
  padding-top: 0;
  padding-left: 5px;
  padding-right: 5px;
  margin-top: 4px;
}

form {
  display: flex;
}
</style>
