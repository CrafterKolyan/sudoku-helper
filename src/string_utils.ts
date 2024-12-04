export class StringUtils {
  static isNumeric(str: string) {
    return /^\d+$/.test(str)
  }
}
