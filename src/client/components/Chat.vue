<template>
  <section class="chat-container nes-container is-dark">
    <dialog class="nes-dialog" id="dialog-default">
      <form method="dialog">
        <pre class="dialog-content">{{ connectedUsers }}</pre>
        <menu class="dialog-menu">
          <button class="nes-btn">Close</button>
          <!-- <button class="nes-btn is-primary">Confirm</button> -->
        </menu>
      </form>
    </dialog>

    <div class="top">
      <button class="toggle" type="button" @click="toggle()">
        <svg viewBox="0 0 100 80" width="40" height="40">
          <rect width="100" height="15"></rect>
          <rect y="25" width="100" height="15"></rect>
          <rect y="50" width="100" height="15"></rect>
        </svg>
      </button>
      <button
        type="button"
        class="users-btn nes-btn is-primary"
        onclick="document.getElementById('dialog-default').showModal();"
      >
        Connected Users: {{ connectedUsers.length }}
      </button>
    </div>

    <div class="chat-header">
      <h1 class="title">Chat</h1>
      <div>
        <span class="status" :class="[isOnline ? 'green' : 'red']">{{
          isOnline ? 'Online' : 'Offline'
        }}</span>
      </div>
    </div>
    <hr />
    <section class="message-list" ref="messageList">
      <div class="message" v-for="(message, index) in messages" :key="index">
        <span>[</span>
        <span class="timestamp">{{ message.timestamp | dateFormat('hh:mm:ssA') }}</span>
        <span>] </span>
        <span class="username" :style="{ color: message.usernameColor }">{{
          message.username
        }}</span>
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
import { Component, Prop, Vue, Emit } from 'vue-property-decorator';
// @ts-ignore
import dialogPolyfill from 'dialog-polyfill';

interface User {
  username: string;
  usernameColor: string;
}

interface Message {
  text: string;
  timestamp: Date;
  username: string;
}

@Component
export default class Chat extends Vue {
  isOnline = false;
  connectedUsers: User[] = [];
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
        that.teardown();
      },
      connect_error() {
        that.teardown();
      },
      LIST_USERS(users) {
        that.onListUsers(users);
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
    let dialog = document.querySelector('dialog');
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
      element.removeEventListener('keydown', this.inputEvent.bind(this));
    }
  }

  @Emit()
  toggle() {}

  sendMessage() {
    this.$socket.client.emit('CHAT_MESSAGE', this.userInput);

    if (this.history[this.history.length - 1] !== this.userInput) {
      this.history.push(this.userInput);
    }
    this.historyIndex = this.history.length;
    this.userInput = '';
  }

  onNewMessage(data: any) {
    data.timestamp = new Date(data.timestamp);
    const color = this.connectedUsers.find((u) => u && u.username === data.username)?.usernameColor;
    data.usernameColor = color || 'white';
    this.messages.push(data);

    const messageList = this.$refs.messageList as Element;
    this.$nextTick(() => {
      messageList.scrollTop = messageList.scrollHeight;
    });
  }

  onListUsers(users: any) {
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

.top {
  display: flex;
}

.toggle {
  height: 38px;
}

.users-btn {
  flex: 1 1;
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
  padding: 5px;
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
  margin-bottom: 0;
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
  font-size: 18px;
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
