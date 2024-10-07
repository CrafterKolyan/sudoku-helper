export class Matrix<T> {
    #matrix: T[][]

    constructor(rows: number, cols: number, value?: T) {
        this.#matrix = new Array(rows).fill(undefined).map(() => Array(cols).fill(value))
    }

    get matrix() {
        return this.#matrix
    }

    get length() {
        return this.#matrix.length
    }

    clone(): Matrix<T> {
        if (this.#matrix.length === 0) {
            return new Matrix(0, 0)
        }
        const clone: Matrix<T> = new Matrix(this.#matrix.length, this.#matrix[0].length)
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
        const matrix: Matrix<number> = new Matrix(0, 0)
        matrix.#matrix = JSON.parse(str)
        return matrix
    }
}
