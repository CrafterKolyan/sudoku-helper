export class Matrix {
    #matrix: number[][]

    constructor(rows: number, cols: number, value: any) {
        this.#matrix = Array(rows)
            .fill(undefined)
            .map(() => Array(cols).fill(value))
    }

    get matrix() {
        return this.#matrix
    }

    get length() {
        return this.#matrix.length
    }

    clone() {
        if (this.#matrix.length === 0) {
            return new Matrix(0, 0, 0)
        }
        const clone = new Matrix(this.#matrix.length, this.#matrix[0].length, 0)
        for (let i = 0; i < this.#matrix.length; ++i) {
            for (let j = 0; j < this.#matrix[0].length; ++j) {
                clone.matrix[i][j] = this.#matrix[i][j]
            }
        }
        return clone
    }

    toString() {
        return JSON.stringify(this.#matrix)
    }

    static fromString(str: string) {
        const matrix = new Matrix(0, 0, 0)
        matrix.#matrix = JSON.parse(str)
        return matrix
    }
}
