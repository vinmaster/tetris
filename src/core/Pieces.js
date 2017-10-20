
module.exports = class Pieces {
  static get TYPES() {
    return {
      'blank': {
        name: 'blank',
        primaryColor: 0x323232,
        lighterColor: 0x373737,
        darkerColor: 0x2d2d2d,
        data: [],
        pos: [],
        center: { row: 0, col: 0 },
        size: 0
      },
      'j': {
        name: 'j',
        primaryColor: 0x06a5df,
        lighterColor: 0x05defd,
        darkerColor: 0x1e75ba,
        data: [['j', ' ', ' '],
          ['j', 'j', 'j'],
          [' ', ' ', ' ']],
        pos: [],
        center: { row: 0, col: 0 },
        size: 3
      },
      'l': {
        name: 'l',
        primaryColor: 0xff2536,
        lighterColor: 0xff9295,
        darkerColor: 0xbc1e2c,
        data: [[' ', ' ', 'l'],
          ['l', 'l', 'l'],
          [' ', ' ', ' ']],
        pos: [],
        center: {},
        size: 3
      },
      'z': {
        name: 'z',
        primaryColor: 0x52d517,
        lighterColor: 0x9cfe1f,
        darkerColor: 0x37a04b,
        data: [[' ', ' ', ' '],
          ['z', 'z', ' '],
          [' ', 'z', 'z']],
        pos: [],
        center: { row: 0, col: 0 },
        size: 3
      },
      's': {
        name: 's',
        primaryColor: 0x05defd,
        lighterColor: 0x37ffff,
        darkerColor: 0x09c8fe,
        data: [[' ', ' ', ' '],
          [' ', 's', 's'],
          ['s', 's', ' ']],
        pos: [],
        center: { row: 0, col: 0 },
        size: 3
      },
      't': {
        name: 't',
        primaryColor: 0xfee25a,
        lighterColor: 0xfefe3c,
        darkerColor: 0xfcbc12,
        data: [[' ', ' ', ' '],
          ['t', 't', 't'],
          [' ', 't', ' ']],
        pos: [],
        center: { row: 0, col: 0 },
        size: 3
      },
      'o': {
        name: 'o',
        primaryColor: 0xc874fd,
        lighterColor: 0xebb8fd,
        darkerColor: 0x7f3f95,
        data: [['o', 'o'],
          ['o', 'o']],
        pos: [],
        center: { row: 0, col: 0 },
        size: 2
      },
      'i': {
        name: 'i',
        primaryColor: 0xf79323,
        lighterColor: 0xf9af42,
        darkerColor: 0xf1592a,
        data: [[' ', ' ', 'i', ' '],
          [' ', ' ', 'i', ' '],
          [' ', ' ', 'i', ' '],
          [' ', ' ', 'i', ' ']],
        pos: [],
        center: { row: 0, col: 0 },
        size: 4
      }
    }
  }

  static spawnPiece() {
    const min = 1
    const max = 7
    const rnd = Math.floor(Math.random() * (max - min)) + min
    const key = Object.keys(Pieces.TYPES)[rnd]
    return Pieces.TYPES[key]
  }
}
