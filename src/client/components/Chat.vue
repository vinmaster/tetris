<template>
  <section class="chat-container nes-container is-dark">
    <div class="chat-header">
      <h1 class="title">Chat</h1>
      <span>Connected Users: {{ connectedUsers }}</span>
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
        <input
          class="chat-input"
          type="text"
          v-model="userInput"
          v-on:keyup.up="navigateHistory(-1)"
        />
        <button class="nes-btn" type="submit">Send</button>
      </form>
    </section>
  </section>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

interface Message {
  text: string;
  timestamp: Date;
  username: string;
}

@Component
export default class Chat extends Vue {
  connectedUsers = 0;
  userInput = '';
  messages: Message[] = [
    {
      text: '/help - List commands',
      timestamp: new Date(),
      username: 'SYSTEM',
    },
  ];
  history: string[] = [];
  historyIndex = 1;

  constructor() {
    super();

    const that = this;

    this.$options.sockets = {
      connect() {
        this.$socket.client.emit('LIST_USERS');
      },
      disconnect() {},
      LIST_USERS(users) {
        that.onConnectedUsers(users);
      },
      CHAT_MESSAGE(data) {
        that.onNewMessage(data);
      },
    };
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
    this.connectedUsers = Object.keys(users).length;
  }

  navigateHistory(direction: number) {
    // TODO: go down
    if ((this.historyIndex <= 0 && direction < 0) || this.historyIndex > this.history.length)
      return;
    this.historyIndex += direction;
    this.userInput = this.history[this.historyIndex];
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
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

.chat-header > span {
  font-size: 10px;
  line-height: 46px;
  margin-right: 10px;
}

.title {
  margin: 12px 10px 10px 10px;
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
}

.message {
  font-size: 12px;
  line-height: 18px;
}

.text {
  white-space: pre-wrap;
}

.chat-input {
  width: 100%;
  height: 36px;
  font-size: 12px;
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
