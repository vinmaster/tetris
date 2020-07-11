let createUUIDLut: string[] = [];
for (let i = 0; i < 256; i++) {
  createUUIDLut[i] = (i < 16 ? '0' : '') + i.toString(16);
}

export class Utility {
  static getObjectSlice(obj, keys: string[]) {
    return keys.reduce((acc, current) => {
      acc[current] = obj[current];
      return acc;
    }, {});
  }

  static getRandomColor(): string {
    return (
      '#' +
      Math.floor(Math.random() * 2 ** 24)
        .toString(16)
        .padStart(6, '0')
    );
  }

  // Allows modulo of positive and negative numbers
  static modulo(i, n) {
    return ((i % n) + n) % n;
  }

  static createUUID() {
    let d0 = (Math.random() * 0x100000000) | 0;
    let d1 = (Math.random() * 0x100000000) | 0;
    let d2 = (Math.random() * 0x100000000) | 0;
    let d3 = (Math.random() * 0x100000000) | 0;
    return (
      createUUIDLut[d0 & 0xff] +
      createUUIDLut[(d0 >> 8) & 0xff] +
      createUUIDLut[(d0 >> 16) & 0xff] +
      createUUIDLut[(d0 >> 24) & 0xff] +
      '-' +
      createUUIDLut[d1 & 0xff] +
      createUUIDLut[(d1 >> 8) & 0xff] +
      '-' +
      createUUIDLut[((d1 >> 16) & 0x0f) | 0x40] +
      createUUIDLut[(d1 >> 24) & 0xff] +
      '-' +
      createUUIDLut[(d2 & 0x3f) | 0x80] +
      createUUIDLut[(d2 >> 8) & 0xff] +
      '-' +
      createUUIDLut[(d2 >> 16) & 0xff] +
      createUUIDLut[(d2 >> 24) & 0xff] +
      createUUIDLut[d3 & 0xff] +
      createUUIDLut[(d3 >> 8) & 0xff] +
      createUUIDLut[(d3 >> 16) & 0xff] +
      createUUIDLut[(d3 >> 24) & 0xff]
    );
  }

  static guid = () => {
    let s4 = () => {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    };
    //return id of format 'aaaaaaaa'-'aaaa'-'aaaa'-'aaaa'-'aaaaaaaaaaaa'
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
  };
}
