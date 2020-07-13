<template>
  <section class="grid-container nes-container is-dark">
    <div class="opponents-container">
      <game-board :skin="skin" :board="myBoard"></game-board>
      <game-board :skin="skin" :board="myBoard"></game-board>
      <game-board :skin="skin" :board="myBoard"></game-board>
      <game-board :skin="skin" :board="myBoard"></game-board>
      <game-board :skin="skin" :board="myBoard"></game-board>
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

@Component({
  components: {
    GameBoard,
  },
})
export default class GameView extends Vue {
  @Prop({ required: true })
  gameClient!: GameClient;

  myBoard: Board | null = null;
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
    if (!this.myBoard) {
      EventBus.$emit('GET_BOARD');
    }
    EventBus.$on('LOAD_BOARD', this.loadBoard.bind(this));
    EventBus.$on('FPS', (fps) => {
      this.fps = fps;
    });
  }

  teardown() {
    EventBus.$off();
  }

  skinChanged() {
    // console.log(this.skin);
  }

  loadBoard(board) {
    this.myBoard = board;
  }

  actionClicked() {
    if (this.actionText === 'Ready?') {
      EventBus.$emit('READY');
      this.actionText = 'Ready';
    } else {
      EventBus.$emit('NOT_READY');
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
