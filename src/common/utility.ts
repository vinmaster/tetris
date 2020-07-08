export class Utility {
  static getObjectSlice(obj, keys: string[]) {
    return keys.reduce((acc, current) => {
      acc[current] = obj[current];
      return acc;
    }, {});
  }
}
