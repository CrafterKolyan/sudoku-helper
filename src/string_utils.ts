export class StringUtils {
    static isNumeric(str) {
        return /^\d+$/.test(str)
    }
}