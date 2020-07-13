<template>
  <div class="board nes-container is-dark" :style="boardStyle" ref="boardElement" v-if="board">
    <div
      class="row"
      v-for="(row, rowIndex) in board.grid.slice(Math.max(board.grid.length - 20, 0))"
      :key="rowIndex"
    >
      <div
        class="tile"
        v-for="(tile, colIndex) in row"
        :key="colIndex + tile"
        :style="tileStyle"
        :class="{
          modern: skin === 'modern',
          flat: skin === 'flat',
          classic: skin === 'classic',
          ['type-' + tile]: tile,
        }"
      ></div>
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
  tileStyle = {};

  $refs!: {
    boardElement: HTMLDivElement;
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
    const parent = this.$refs.boardElement;
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
  background-image: url('/I-background.png');
  background-repeat: repeat;
}

.tile.classic.type-O {
  background-color: #272727;
  position: relative;
  border: 1px solid #272727;
}
.tile.classic.type-O:before {
  content: ' ';
  position: absolute;
  z-index: 1;
  top: 3px;
  left: 3px;
  right: 3px;
  bottom: 3px;
  border: 5px solid #cad2a9;
}

.tile.classic.type-T {
  // position: relative;
  // border: 4px solid #272727;
  background-image: url('/T-background.png');
  background-size: cover;
}
// .tile.classic.type-T:before {
//   content: ' ';
//   position: absolute;
//   z-index: 1;
//   top: 5px;
//   left: 5px;
//   right: 5px;
//   bottom: 5px;
//   border-width: 5px;
//   border-style: inset;
//   border-top-color: #d4f4ce;
//   border-left-color: #d4f4ce;
//   border-right-color: #272727;
//   border-bottom-color: #272727;
// }

.tile.classic.type-S {
  background-color: #272727;
  position: relative;
  border: 1px solid #272727;
}
.tile.classic.type-S:before {
  content: ' ';
  position: absolute;
  z-index: 1;
  top: 3px;
  left: 3px;
  right: 3px;
  bottom: 3px;
  border: 8px solid #6b7353;
}

.tile.classic.type-Z {
  background-color: #272727;
  position: relative;
  border: 2px solid #272727;
}
.tile.classic.type-Z:before {
  content: ' ';
  position: absolute;
  z-index: 1;
  top: 3px;
  left: 3px;
  right: 3px;
  bottom: 3px;
  border: 10px solid #cad2a9;
}

.tile.classic.type-L {
  background-color: #6b7353;
  border: 3px solid #272727;
}

.tile.classic.type-J {
  background-color: #cad2a9;
  position: relative;
  border: 4px solid #272727;
}
.tile.classic.type-J:before {
  content: ' ';
  position: absolute;
  z-index: 1;
  top: 0px;
  left: 0px;
  right: 0px;
  bottom: 0px;
  border: 4px solid #6b7353;
}
.tile.classic.type-J:after {
  content: ' ';
  position: absolute;
  z-index: 2;
  top: 4px;
  left: 4px;
  right: 4px;
  bottom: 4px;
  border: 4px solid #272727;
}
</style>
