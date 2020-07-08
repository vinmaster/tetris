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
}
