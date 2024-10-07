import { ArrayUtils } from "./array_utils"
import { Matrix } from "./matrix"
import { Ids } from "./ids"
import { IncorrectSudokuSize } from "./errors"
import { ElementUtils } from "./element_utils"

export class Sudoku {
    static sudokuN = 3
    static sudokuSize = this.sudokuN * this.sudokuN
    static sudokuInput = new Matrix(this.sudokuSize, this.sudokuSize, 0)

    static load(sudoku: number[][]) {
        for (let i = 0; i < this.sudokuSize; ++i) {
            for (let j = 0; j < this.sudokuSize; ++j) {
                this.setCellNoRecompute(i, j, sudoku[i][j])
            }
        }
        this.validateSudoku()
        this.solveSudokuAndFillCells()
    }

    static column(sudoku: Matrix<number>, col: number) {
        let column = []
        for (let i = 0; i < this.sudokuSize; ++i) {
            column.push(sudoku.matrix[i][col])
        }
        return column
    }

    static blockNumber(row: number, col: number) {
        return this.sudokuN * Math.floor(row / this.sudokuN) + Math.floor(col / this.sudokuN)
    }

    static block(sudoku: Matrix<number>, blockNumber: number) {
        let block = []
        let startI = Math.floor(blockNumber / this.sudokuN) * this.sudokuN
        let startJ = (blockNumber % this.sudokuN) * this.sudokuN
        for (let i = startI; i < startI + this.sudokuN; ++i) {
            for (let j = startJ; j < startJ + this.sudokuN; ++j) {
                block.push(sudoku.matrix[i][j])
            }
        }
        return block
    }

    static blockIndices(blockNumber: number) {
        let indices = []
        let startI = Math.floor(blockNumber / this.sudokuN) * this.sudokuN
        let startJ = (blockNumber % this.sudokuN) * this.sudokuN
        for (let i = startI; i < startI + this.sudokuN; ++i) {
            for (let j = startJ; j < startJ + this.sudokuN; ++j) {
                indices.push([i, j])
            }
        }
        return indices
    }

    static setCellNoRecompute(row: number, col: number, value: number) {
        const div = ElementUtils.getExistingElementById(Ids.cell(row, col))
        const valueDiv = ElementUtils.getExistingElementById(Ids.cellValue(row, col))
        if (value !== 0) {
            valueDiv.innerText = value.toString()
            div.classList.add("sudoku-cell-input")
            div.classList.remove("sudoku-cell-computed")
            this.hideCellCandidates(row, col)
            this.setCellCandidates(row, col, [])
        } else {
            valueDiv.innerText = ""
            div.classList.add("sudoku-cell-computed")
            div.classList.remove("sudoku-cell-input")
            this.showCellCandidates(row, col)
        }
        this.sudokuInput.matrix[row][col] = value
    }

    static setCell(row: number, col: number, value: number) {
        this.setCellNoRecompute(row, col, value)
        this.validateSudoku()
        this.solveSudokuAndFillCells()
    }

    static setCellComputed(row: number, col: number, value: number) {
        let valueDiv = ElementUtils.getExistingElementById(Ids.cellValue(row, col))
        if (value !== 0) {
            valueDiv.innerText = value.toString()
            this.setCellCandidates(row, col, [])
            this.hideCellCandidates(row, col)
        } else {
            valueDiv.innerText = ""
            this.showCellCandidates(row, col)
        }
    }

    static showCellCandidates(row: number, col: number) {
        for (let i = 0; i < this.sudokuN; ++i) {
            for (let j = 0; j < this.sudokuN; ++j) {
                let candidateDiv = ElementUtils.getExistingElementById(Ids.cellCandidate(row, col, i, j))
                candidateDiv.classList.remove("display-none")
            }
        }
    }

    static hideCellCandidates(row: number, col: number) {
        for (let i = 0; i < this.sudokuN; ++i) {
            for (let j = 0; j < this.sudokuN; ++j) {
                let candidateDiv = ElementUtils.getExistingElementById(Ids.cellCandidate(row, col, i, j))
                candidateDiv.classList.add("display-none")
            }
        }
    }

    static setCellCandidates(row: number, col: number, candidates: number[]) {
        for (let i = 0; i < this.sudokuN; ++i) {
            for (let j = 0; j < this.sudokuN; ++j) {
                let candidateDiv = ElementUtils.getExistingElementById(Ids.cellCandidate(row, col, i, j))
                if (candidates.includes(i * this.sudokuN + j + 1)) {
                    candidateDiv.classList.remove("hidden")
                } else {
                    candidateDiv.classList.add("hidden")
                }
            }
        }
    }

    static validateRow(row: number) {
        const argDuplicates = ArrayUtils.argDuplicates(this.sudokuInput.matrix[row])
        for (let i = 0; i < argDuplicates.length; ++i) {
            const cellDiv = ElementUtils.getExistingElementById(Ids.cell(row, argDuplicates[i]))
            cellDiv.classList.add("sudoku-cell-invalid")
        }
    }

    static validateColumn(col: number) {
        const column = this.column(this.sudokuInput, col)
        const argDuplicates = ArrayUtils.argDuplicates(column)
        for (let i = 0; i < argDuplicates.length; ++i) {
            const cellDiv = ElementUtils.getExistingElementById(Ids.cell(argDuplicates[i], col))
            cellDiv.classList.add("sudoku-cell-invalid")
        }
    }

    static validateBlock(blockNumber: number) {
        const block = this.block(this.sudokuInput, blockNumber)
        const blockIndices = this.blockIndices(blockNumber)
        const argDuplicates = ArrayUtils.argDuplicates(block)
        for (let i = 0; i < argDuplicates.length; ++i) {
            let row = blockIndices[argDuplicates[i]][0]
            let col = blockIndices[argDuplicates[i]][1]
            const cellDiv = ElementUtils.getExistingElementById(Ids.cell(row, col))
            cellDiv.classList.add("sudoku-cell-invalid")
        }
    }

    static clearInvalid() {
        for (let i = 0; i < this.sudokuSize; ++i) {
            for (let j = 0; j < this.sudokuSize; ++j) {
                const cellDiv = ElementUtils.getExistingElementById(Ids.cell(i, j))
                cellDiv.classList.remove("sudoku-cell-invalid")
            }
        }
    }

    static validateRows() {
        for (let i = 0; i < this.sudokuSize; ++i) {
            this.validateRow(i)
        }
    }

    static validateColumns() {
        for (let i = 0; i < this.sudokuSize; ++i) {
            this.validateColumn(i)
        }
    }

    static validateBlocks() {
        for (let i = 0; i < this.sudokuSize; ++i) {
            this.validateBlock(i)
        }
    }

    static validateSudoku() {
        this.clearInvalid()
        this.validateRows()
        this.validateColumns()
        this.validateBlocks()
    }

    static solveSudoku(): [Matrix<number>, Matrix<number[]>] {
        let sudoku = this.sudokuInput.clone()
        let possibleValuesForCells: Matrix<number[]> = new Matrix(this.sudokuSize, this.sudokuSize, [])
        let changed = true
        let recomputePossibleValuesCells = true
        while (changed) {
            changed = false
            if (recomputePossibleValuesCells) {
                for (let i = 0; i < this.sudokuSize; ++i) {
                    for (let j = 0; j < this.sudokuSize; ++j) {
                        if (sudoku.matrix[i][j] === 0) {
                            let possibleValuesForCell: number[] = []
                            for (let k = 1; k <= this.sudokuSize; ++k) {
                                if (
                                    !sudoku.matrix[i].includes(k) &&
                                    !this.column(sudoku, j).includes(k) &&
                                    !this.block(sudoku, this.blockNumber(i, j)).includes(k)
                                ) {
                                    possibleValuesForCell.push(k)
                                }
                            }
                            possibleValuesForCells.matrix[i][j] = possibleValuesForCell
                        } else {
                            possibleValuesForCells.matrix[i][j] = []
                        }
                    }
                }
                recomputePossibleValuesCells = false
            }
            for (let i = 0; i < this.sudokuSize; ++i) {
                for (let j = 0; j < this.sudokuSize; ++j) {
                    if (possibleValuesForCells.matrix[i][j].length === 1) {
                        sudoku.matrix[i][j] = possibleValuesForCells.matrix[i][j][0]
                        possibleValuesForCells.matrix[i][j] = []
                        changed = true
                    }
                }
            }
            if (changed) {
                recomputePossibleValuesCells = true
                continue
            }
            for (let blockNumber = 0; blockNumber < this.sudokuSize; ++blockNumber) {
                let blockIndices = this.blockIndices(blockNumber)
                for (let k = 1; k <= this.sudokuSize; ++k) {
                    let possibleIndices = []
                    for (let i = 0; i < blockIndices.length; ++i) {
                        let row = blockIndices[i][0]
                        let col = blockIndices[i][1]
                        if (possibleValuesForCells.matrix[row][col].includes(k)) {
                            possibleIndices.push([row, col])
                        }
                    }
                    if (possibleIndices.length === 1) {
                        let row = possibleIndices[0][0]
                        let col = possibleIndices[0][1]
                        sudoku.matrix[row][col] = k
                        possibleValuesForCells.matrix[row][col] = []
                        changed = true
                    }
                }
            }
            if (changed) {
                recomputePossibleValuesCells = true
                continue
            }
            for (let i = 0; i < this.sudokuSize; ++i) {
                for (let k = 1; k <= this.sudokuSize; ++k) {
                    let possibleIndices = []
                    for (let j = 0; j < this.sudokuSize; ++j) {
                        if (possibleValuesForCells.matrix[i][j].includes(k)) {
                            possibleIndices.push(j)
                        }
                    }
                    if (possibleIndices.length === 1) {
                        let col = possibleIndices[0]
                        sudoku.matrix[i][col] = k
                        possibleValuesForCells.matrix[i][col] = []
                        changed = true
                    }
                }
            }
            if (changed) {
                recomputePossibleValuesCells = true
                continue
            }
            for (let j = 0; j < this.sudokuSize; ++j) {
                for (let k = 1; k <= this.sudokuSize; ++k) {
                    let possibleIndices = []
                    for (let i = 0; i < this.sudokuSize; ++i) {
                        if (possibleValuesForCells.matrix[i][j].includes(k)) {
                            possibleIndices.push(i)
                        }
                    }
                    if (possibleIndices.length === 1) {
                        let row = possibleIndices[0]
                        sudoku.matrix[row][j] = k
                        possibleValuesForCells.matrix[row][j] = []
                        changed = true
                    }
                }
            }
            if (changed) {
                recomputePossibleValuesCells = true
                continue
            }
            for (let blockNumber = 0; blockNumber < this.sudokuSize; ++blockNumber) {
                const blockIndices = this.blockIndices(blockNumber)
                let emptyValues = []
                const hashIndices: [number, number][][] = new Array(this.sudokuSize + 1).fill(undefined).map(() => [])
                for (let i = 0; i < this.sudokuSize; ++i) {
                    emptyValues.push(i + 1)
                }
                for (let i = 0; i < blockIndices.length; ++i) {
                    const row = blockIndices[i][0]
                    const col = blockIndices[i][1]
                    if (sudoku.matrix[row][col] !== 0) {
                        emptyValues = emptyValues.filter((value) => value !== sudoku.matrix[row][col])
                    } else {
                        for (let k = 0; k < possibleValuesForCells.matrix[row][col].length; ++k) {
                            hashIndices[possibleValuesForCells.matrix[row][col][k]].push([row, col])
                        }
                    }
                }
                const allSubsets = ArrayUtils.allSubsets(emptyValues, 2, 3)
                for (let i = 0; i < allSubsets.length; ++i) {
                    const subset = allSubsets[i]
                    let subsetIndices = []
                    for (let j = 0; j < subset.length; ++j) {
                        subsetIndices.push(...hashIndices[subset[j]])
                    }
                    subsetIndices = ArrayUtils.uniqueTuples(subsetIndices)
                    if (subset.length === subsetIndices.length) {
                        for (let j = 0; j < subsetIndices.length; ++j) {
                            const row = subsetIndices[j][0]
                            const col = subsetIndices[j][1]
                            if (possibleValuesForCells.matrix[row][col].length > subset.length) {
                                possibleValuesForCells.matrix[row][col] = possibleValuesForCells.matrix[row][col].filter((value) =>
                                    subset.includes(value)
                                )
                                changed = true
                            }
                        }
                    }
                }
            }
        }
        return [sudoku, possibleValuesForCells]
    }

    static solveSudokuAndFillCells() {
        let [sudoku, possibleValuesForCells] = this.solveSudoku()
        for (let i = 0; i < this.sudokuSize; ++i) {
            for (let j = 0; j < this.sudokuSize; ++j) {
                if (this.sudokuInput.matrix[i][j] === 0) {
                    const candidates = possibleValuesForCells.matrix[i][j]
                    this.setCellCandidates(i, j, candidates)
                    if (candidates.length === 0) {
                        this.setCellComputed(i, j, sudoku.matrix[i][j])
                    } else {
                        this.setCellComputed(i, j, 0)
                    }
                }
            }
        }
    }

    static toString() {
        return this.sudokuInput.toString()
    }

    static fromString(str: string) {
        let matrix = Matrix.fromString(str)
        if (matrix.length != this.sudokuSize) {
            throw new IncorrectSudokuSize(
                "Got incorrect number of rows in sudoku. Expected: ".concat(this.sudokuSize.toString(), ". Actual: ", matrix.length.toString())
            )
        }
        this.load(matrix.matrix)
    }
}
