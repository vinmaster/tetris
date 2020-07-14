<template>
  <section class="grid-container nes-container is-dark">
    <div class="opponents-container">
      <game-board v-for="board in opponentBoards" :skin="skin" :board="board"></game-board>
    </div>
    <div class="info">
      <section class="nes-container is-dark hold-container"></section>
      <section class="nes-container is-dark next-container next-container-small"></section>
      <section class="skin-radio">
        <label>
          <input
            type="radio"
            class="nes-radio is-dark"
            name="answer-dark"
            checked
            value="modern"
            v-model="skin"
            v-on:change="skinChanged"
          />
          <span>Modern</span>
        </label>

        <label>
          <input
            type="radio"
            class="nes-radio is-dark"
            name="answer-dark"
            value="flat"
            v-model="skin"
            v-on:change="skinChanged"
          />
          <span>Flat</span>
        </label>

        <label>
          <input
            type="radio"
            class="nes-radio is-dark"
            name="answer-dark"
            value="classic"
            v-model="skin"
            v-on:change="skinChanged"
          />
          <span>Classic</span>
        </label>
      </section>
      <button
        class="nes-btn"
        v-show="!gameClient.ready"
        :class="{ 'is-success': actionText == 'Ready' }"
        @click="actionClicked()"
      >
        {{ actionText }}
      </button>
      <div class="state">State: {{ userState }}</div>
      <div class="state">Game State: {{ gameState }}</div>
      <div>FPS: {{ fps }}</div>
    </div>
    <section class="board-container">
      <game-board :skin="skin" :board="myBoard"></game-board>
    </section>
    <section class="nes-container is-dark next-container next-container-big"></section>
  </section>
</template>

<script lang="ts">
import { Component, Prop, Vue, Emit } from 'vue-property-decorator';
import GameBoard from './GameBoard.vue';
import { GameClient } from '../lib/GameClient';
import { Board } from '../../common/board';
import { EventBus } from '../lib/EventBus';
import { Utility } from '../../common/utility';
import { CONSTANTS } from '../../common/constants';

@Component({
  components: {
    GameBoard,
  },
})
export default class GameView extends Vue {
  @Prop({ required: true })
  gameClient!: GameClient;

  boards: { [userId: string]: Board } = {};
  userState: string = 'WAITING';
  gameState: string = '';
  actionText = 'Ready?';
  skin: string = 'modern';
  fps = 0;

  mounted() {
    this.setup();
  }

  destroyed() {
    this.teardown();
  }

  setup() {
    if (Object.keys(this.boards).length === 0) {
      EventBus.$emit('GET_BOARD');
    }
    EventBus.$on('UPDATE_BOARDS', this.loadBoards.bind(this));
    EventBus.$on('FPS', (fps) => {
      this.fps = fps;
    });
    EventBus.$on('UPDATE_GAME_STATE', (state) => this.gameState = state);
    EventBus.$on('UPDATE_USER_STATE', (user) => {
      if (this.gameClient.currentUser && this.gameClient.currentUser.userId === user.userId) {
        this.userState = user.state;
      }
    })
  }

  teardown() {
    EventBus.$off();
  }

  skinChanged() {
    // console.log(this.skin);
  }

  get opponentBoards() {
    if (Object.keys(this.boards).length === 0 || !this.gameClient.currentUser) return {};

    const opponentIds = Object.keys(this.boards).filter(
      (userId) => userId !== this.gameClient.currentUser.userId
    );
    return opponentIds.reduce((acc, current) => {
      acc[current] = this.boards[current];
      return acc;
    }, {});
  }

  get myBoard() {
    if (Object.keys(this.boards).length === 0 || !this.gameClient.currentUser) return {};
    return this.boards[this.gameClient.currentUser.userId];
  }

  loadBoards(boards: { [userId: string]: Board }) {
    console.log('loading boards', boards);
    this.boards = boards;
  }

  actionClicked() {
    if (this.actionText === 'Ready?') {
      EventBus.$emit('STATE_CHANGE', CONSTANTS.STATES.READY);
      this.actionText = 'Ready';
    } else {
      EventBus.$emit('STATE_CHANGE', CONSTANTS.STATES.WAITING);
      this.actionText = 'Ready?';
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.opponents-container {
  width: 120px;
}

.grid-container {
  height: calc(100% - 8px);
  /* line-height: 1; */
  display: flex;
  flex-direction: row;
  padding: 10px;
}

.hold-container {
  height: 200px;
  padding: 0;
}

.board-container {
  flex: 1;
}

.info {
  display: flex;
  flex-direction: column;
}

.skin-radio {
  background-color: #212529;
  width: 148px;
}

.next-container-small {
  display: none;
}

.state {
  font-size: 14px;
}

@media only screen and (max-width: 500px) {
  .hold-container {
    height: 100px;
  }
  .next-container-big {
    display: none;
  }
  .next-container-small {
    display: block;
    flex: 1 1;
  }
}
</style>
