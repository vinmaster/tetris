import { Utility } from './utility';
import { Board } from './board';

/*
Rotation docs:
http://tech.migge.io/2017/02/07/tetris-rotations/
https://tetris.fandom.com/wiki/SRS
https://strategywiki.org/wiki/Tetris/Rotation_systems
https://www.youtube.com/watch?v=yIpk5TJ_uaI
https://www.youtube.com/watch?v=Atlr5vvdchY
*/

// Kick data y is inverse because row 0 is at top
const KICK_DATA = [
  [
    [0, 0],
    [-1, 0],
    [-1, -1],
    [0, 2],
    [-1, 2],
  ],
  [
    [0, 0],
    [1, 0],
    [1, 1],
    [0, -2],
    [1, -2],
  ],
  [
    [0, 0],
    [1, 0],
    [1, -1],
    [0, 2],
    [1, 2],
  ],
  [
    [0, 0],
    [-1, 0],
    [-1, 1],
    [0, -2],
    [-1, -2],
  ],
];
const KICK_DATA_I = [
  [
    [0, 0],
    [-2, 0],
    [1, 0],
    [-2, 1],
    [1, -2],
  ],
  [
    [-1, 0],
    [0, 0],
    [0, 0],
    [0, -1],
    [0, 2],
  ],
  [
    [-1, -1],
    [1, -1],
    [-2, -1],
    [1, 0],
    [-2, 0],
  ],
  [
    [0, -1],
    [0, -1],
    [0, -1],
    [0, 1],
    [0, -2],
  ],
];
const KICK_DATA_O = [[[0, 0]], [[0, 0]], [[0, 0]], [[0, 0]]];

export class Piece {
  type: string;
  data: string[][];
  pos: number;
  row: number;
  col: number;
  kickData: number[][][];

  constructor(type: string) {
    this.type = type;
    this.data = [];
    this.pos = 0;
    this.col = 0;
    this.row = 0;
    this.kickData = [];
    this.setProperties(type);
  }

  setProperties(type) {
    switch (type) {
      case 'I':
        this.data = [
          ['', '', '', ''],
          ['0', '0', '0', '0'],
          ['', '', '', ''],
          ['', '', '', ''],
        ];
        this.kickData = KICK_DATA_I;
        [this.col, this.row] = [2, -1];
        break;
      case 'J':
        this.data = [
          ['0', '', ''],
          ['0', '0', '0'],
          ['', '', ''],
        ];
        this.kickData = KICK_DATA;
        [this.col, this.row] = [3, 0];
        break;
      case 'L':
        this.data = [
          ['', '', '0'],
          ['0', '0', '0'],
          ['', '', ''],
        ];
        this.kickData = KICK_DATA;
        [this.col, this.row] = [3, 0];
        break;
      case 'O':
        this.data = [
          ['0', '0'],
          ['0', '0'],
          ['', ''],
        ];
        this.kickData = KICK_DATA_O;
        [this.col, this.row] = [4, 0];
        break;
      case 'S':
        this.data = [
          ['', '0', '0'],
          ['0', '0', ''],
          ['', '', ''],
        ];
        this.kickData = KICK_DATA;
        [this.col, this.row] = [3, 0];
        break;
      case 'T':
        this.data = [
          ['', '0', ''],
          ['0', '0', '0'],
          ['', '', ''],
        ];
        this.kickData = KICK_DATA;
        [this.col, this.row] = [3, 0];
        break;
      case 'Z':
        this.data = [
          ['0', '0', ''],
          ['', '0', '0'],
          ['', '', ''],
        ];
        this.kickData = KICK_DATA;
        [this.col, this.row] = [3, 0];
        break;
      default:
        throw new Error('Invalid type: ' + type);
    }
  }

  setPos(newPos: number) {
    if (this.pos === newPos) return;
    else {
      do {
        this.data = this.getRotatedData(90);
        this.pos += 1;
      } while (this.pos !== newPos);
    }
  }

  getRotatedData(direction: 90 | -90) {
    let rotated: string[][] = [];
    if (direction === 90) {
      for (let i = this.data.length - 1; i >= 0; i--) {
        rotated[i] = [];
        for (let row = 0; row < this.data.length; row++) {
          rotated[i][this.data.length - 1 - row] = this.data[row][i];
        }
      }
    } else {
      for (let i = 0; i < this.data.length; i++) {
        rotated[i] = [];
        for (let row = this.data.length - 1; row >= 0; row--) {
          rotated[i][row] = this.data[row][this.data.length - 1 - i];
        }
      }
    }
    return rotated;
  }

  rotateOnBoard(direction: 90 | -90, board: Board) {
    let isRotated = false;
    const rotated = this.getRotatedData(direction);
    const posDir = direction === 90 ? 1 : -1;
    const curPos = Utility.modulo(this.pos, 4);
    const newPos = Utility.modulo(this.pos + posDir, 4);

    for (let i = 0, len = this.kickData[0].length; i < len; i++) {
      const [cx, cy] = this.kickData[curPos][i];
      if (this.isValidMoveOnBoard(this.col + cx, Math.floor(this.row + cy), rotated, board)) {
        this.col += cx;
        this.row += cy;
        this.data = rotated;
        this.pos = newPos;
        isRotated = true;
        break;
      }
    }

    return isRotated;
  }

  isValidMoveOnBoard(cx, cy, data, board: Board): boolean {
    for (let row = 0; row < data.length; row++) {
      for (let col = 0; col < data[row].length; col++) {
        if (
          data[row][col] &&
          (cy + row < 0 ||
            cx + col < 0 ||
            cy + row >= board.height ||
            cx + col >= board.width ||
            board.grid[cy + row] === undefined ||
            board.grid[cy + row][cx + col].length > 0)
        ) {
          return false;
        }
      }
    }
    // this.lockDelay = 0;
    return true;
  }

  toString() {
    return (
      this.data.map((line) => line.map((c) => (c.length ? c : ' ')).join('')).join('|\n') + '|'
    );
  }

  static getPieceTypes() {
    return ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
    //   new Piece('I'),
    //   new Piece('J'),
    //   new Piece('L'),
    //   new Piece('O'),
    //   new Piece('S'),
    //   new Piece('T'),
    //   new Piece('Z'),
    // ];
  }

  static get TYPES() {
    return {
      blank: {
        name: 'blank',
        primaryColor: 0x323232,
        lighterColor: 0x373737,
        darkerColor: 0x2d2d2d,
        data: [],
        pos: [],
        center: { row: 0, col: 0 },
        size: 0,
      },
      j: {
        name: 'j',
        primaryColor: 0x06a5df,
        lighterColor: 0x05defd,
        darkerColor: 0x1e75ba,
        data: [
          ['j', ' ', ' '],
          ['j', 'j', 'j'],
          [' ', ' ', ' '],
        ],
        pos: [],
        center: { row: 0, col: 0 },
        size: 3,
      },
      l: {
        name: 'l',
        primaryColor: 0xff2536,
        lighterColor: 0xff9295,
        darkerColor: 0xbc1e2c,
        data: [
          [' ', ' ', 'l'],
          ['l', 'l', 'l'],
          [' ', ' ', ' '],
        ],
        pos: [],
        center: {},
        size: 3,
      },
      z: {
        name: 'z',
        primaryColor: 0x52d517,
        lighterColor: 0x9cfe1f,
        darkerColor: 0x37a04b,
        data: [
          [' ', ' ', ' '],
          ['z', 'z', ' '],
          [' ', 'z', 'z'],
        ],
        pos: [],
        center: { row: 0, col: 0 },
        size: 3,
      },
      s: {
        name: 's',
        primaryColor: 0x05defd,
        lighterColor: 0x37ffff,
        darkerColor: 0x09c8fe,
        data: [
          [' ', ' ', ' '],
          [' ', 's', 's'],
          ['s', 's', ' '],
        ],
        pos: [],
        center: { row: 0, col: 0 },
        size: 3,
      },
      t: {
        name: 't',
        primaryColor: 0xfee25a,
        lighterColor: 0xfefe3c,
        darkerColor: 0xfcbc12,
        data: [
          [' ', ' ', ' '],
          ['t', 't', 't'],
          [' ', 't', ' '],
        ],
        pos: [],
        center: { row: 0, col: 0 },
        size: 3,
      },
      o: {
        name: 'o',
        primaryColor: 0xc874fd,
        lighterColor: 0xebb8fd,
        darkerColor: 0x7f3f95,
        data: [
          ['o', 'o'],
          ['o', 'o'],
        ],
        pos: [],
        center: { row: 0, col: 0 },
        size: 2,
      },
      i: {
        name: 'i',
        primaryColor: 0xf79323,
        lighterColor: 0xf9af42,
        darkerColor: 0xf1592a,
        data: [
          [' ', ' ', 'i', ' '],
          [' ', ' ', 'i', ' '],
          [' ', ' ', 'i', ' '],
          [' ', ' ', 'i', ' '],
        ],
        pos: [],
        center: { row: 0, col: 0 },
        size: 4,
      },
    };
  }

  // static spawnPiece() {
  //   const min = 1;
  //   const max = 7;
  //   const rnd = Math.floor(Math.random() * (max - min)) + min;
  //   const key = Object.keys(Pieces.TYPES)[rnd];
  //   return Pieces.TYPES[key];
  // }
}
