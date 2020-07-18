<template>
  <div class="board nes-container is-dark" :style="boardStyle" v-if="board" ref="element">
    <div class="row" v-for="(row, rowIndex) in computedBoard" :key="rowIndex">
      <div
        class="tile"
        v-for="(tile, colIndex) in row"
        :key="rowIndex + colIndex"
        :style="tileStyle"
        :class="{
          modern: skin === 'modern',
          flat: skin === 'flat',
          classic: skin === 'classic',
          ['type-' + tile]: tile,
        }"
      ></div>
    </div>
    <div id="currentPiece" v-if="board.currentPiece" :style="currentPieceStyle()">
      <div class="row" v-for="(row, rowIndex) in board.currentPiece.data" :key="rowIndex">
        <div
          v-for="(tile, colIndex) in row"
          :key="rowIndex + colIndex"
          :style="tileStyle"
          :class="{
            modern: skin === 'modern',
            flat: skin === 'flat',
            classic: skin === 'classic',
            ['tile type-' + board.currentPiece.type]: tile != '',
          }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Emit } from 'vue-property-decorator';
import { Board } from '../../common/board';
import { Piece } from '../../common/piece';
import { EventBus } from '../lib/EventBus';

@Component
export default class GameBoard extends Vue {
  @Prop({ default: 'modern' })
  skin!: 'modern' | 'flat' | 'classic';

  @Prop({ required: true })
  board!: Board;

  current!: Piece;

  boardStyle: {
    width: string;
    height: string;
    visibility: string;
  } = {
    height: '100%',
    width: '100%',
    visibility: 'hidden',
  };
  tileStyle: {
    width: string;
    height: string;
  } = {
    width: '',
    height: '',
  };

  $refs!: {
    element: HTMLDivElement;
  };

  created() {
    const that = this;

    EventBus.$on('CHAT_TOGGLE', this.setBoardSize.bind(this));
  }

  mounted() {
    setTimeout(() => {
      this.setup();
    }, 300);
  }

  get computedBoard() {
    if (!this.board.grid) return [];
    return this.board.grid.slice(Math.max(this.board.grid.length - 20, 0));
  }

  // beforeDestroy() {
  // }

  destroyed() {
    this.teardown();
    EventBus.$off();
  }

  setup() {
    this.setBoardSize();
  }

  teardown() {}

  setBoardSize() {
    // 8px border size
    // const parent = document.getElementsByClassName('board-container')[0];
    const parent = this.$refs.element;
    if (!parent) return;
    const boardWidth = 10; //this.board.width;
    const boardHeight = 20; //this.board.width;
    const width = parent.clientWidth / boardWidth - 2;
    const height = parent.clientHeight / boardHeight - 2;
    const size = Math.min(width, height);
    this.tileStyle = {
      width: `${size}px`,
      height: `${size}px`,
    };
    this.boardStyle = {
      width: `${size * 10 + 8}px`,
      height: `${size * 20 + 8}px`,
      visibility: 'visible',
    };
  }

  currentPieceStyle() {
    const size = parseFloat(this.tileStyle.width.slice(0, -2));

    if (!this.board.currentPiece) return {};
    return {
      top: size * this.board.currentPiece.row + 'px',
      left: size * this.board.currentPiece.col + 'px',
    };
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
.board {
  height: calc(100% - 8px);
  /* line-height: 1; */
  display: flex;
  flex-direction: column;
  padding: 0;
  position: relative;
}

#currentPiece {
  position: absolute;
}

.row {
  display: flex;
  width: 100%;
  height: 100%;
}

// Modern
@mixin modernBlock($color) {
  background-image: linear-gradient(to bottom left, lighten($color, 25%), darken($color, 10%));

  border-top-color: lighten($color, 20%);
  border-left-color: darken($color, 10%);
  border-bottom-color: darken($color, 20%);
  border-right-color: darken($color, 10%);

  border-width: 4px;
  border-style: solid;
}

.tile.modern {
  @include modernBlock(#7d7d7d45);
}

.tile.modern.type-I {
  @include modernBlock(#31c7ef);
}

.tile.modern.type-O {
  @include modernBlock(#f7d308);
}

.tile.modern.type-T {
  @include modernBlock(#ad4d9c);
}

.tile.modern.type-S {
  @include modernBlock(#42b642);
}

.tile.modern.type-Z {
  @include modernBlock(#ef2029);
}

.tile.modern.type-L {
  @include modernBlock(#5a65ad);
}

.tile.modern.type-J {
  @include modernBlock(#ef7921);
}

// Flat
@mixin flatBlock($color) {
  background-color: $color;
  box-shadow: inset 0 0 1px 1px lighten($color, 20);
  border: 1px solid darken($color, 20);
}
.tile.flat {
  @include flatBlock(#7d7d7d45);
}

.tile.flat.type-I {
  @include flatBlock(#31c7ef);
}

.tile.flat.type-O {
  @include flatBlock(#f7d308);
}

.tile.flat.type-T {
  @include flatBlock(#ad4d9c);
}

.tile.flat.type-S {
  @include flatBlock(#42b642);
}

.tile.flat.type-Z {
  @include flatBlock(#ef2029);
}

.tile.flat.type-L {
  @include flatBlock(#5a65ad);
}

.tile.flat.type-J {
  @include flatBlock(#ef7921);
}

// Classic
.tile.classic {
  background-color: #cad2a9;
}

.tile.classic.type-I {
  background-image: url('/I.png');
  background-size: cover;
}

.tile.classic.type-O {
  background-image: url('/O.png');
  background-size: cover;
}

.tile.classic.type-T {
  background-image: url('/T.png');
  background-size: cover;
}

.tile.classic.type-S {
  background-image: url('/S.png');
  background-size: cover;
}

.tile.classic.type-Z {
  background-image: url('/Z.png');
  background-size: cover;
}

.tile.classic.type-L {
  background-image: url('/L.png');
  background-size: cover;
}

.tile.classic.type-J {
  background-image: url('/J.png');
  background-size: cover;
}
</style>
