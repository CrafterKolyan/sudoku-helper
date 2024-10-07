import { ArrayUtils } from "./array_utils"
import { Matrix } from "./matrix"
import { Ids } from "./ids"
import { IncorrectSudokuSize } from "./errors"

export class Sudoku {
    static sudokuN = 3
    static sudokuSize = this.sudokuN * this.sudokuN
    static sudokuInput = new Matrix(this.sudokuSize, this.sudokuSize, 0)

    static load(sudoku) {
        for (let i = 0; i < this.sudokuSize; ++i) {
            for (let j = 0; j < this.sudokuSize; ++j) {
                this.setCellNoRecompute(i, j, sudoku[i][j])
            }
        }
        this.validateSudoku()
        this.solveSudokuAndFillCells()
    }

    static column(sudoku, col) {
        let column = []
        for (let i = 0; i < this.sudokuSize; ++i) {
            column.push(sudoku.matrix[i][col])
        }
        return column
    }

    static blockNumber(row, col) {
        return this.sudokuN * Math.floor(row / this.sudokuN) + Math.floor(col / this.sudokuN)
    }

    static block(sudoku, blockNumber) {
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

    static blockIndices(blockNumber) {
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

    static setCellNoRecompute(row, col, value) {
        let div = document.getElementById(Ids.cell(row, col))
        let valueDiv = document.getElementById(Ids.cellValue(row, col))
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

    static setCell(row, col, value) {
        this.setCellNoRecompute(row, col, value)
        this.validateSudoku()
        this.solveSudokuAndFillCells()
    }

    static setCellComputed(row, col, value) {
        let valueDiv = document.getElementById(Ids.cellValue(row, col))
        if (value !== 0) {
            valueDiv.innerText = value.toString()
            this.setCellCandidates(row, col, [])
            this.hideCellCandidates(row, col)
        } else {
            valueDiv.innerText = ""
            this.showCellCandidates(row, col)
        }
    }

    static showCellCandidates(row, col) {
        for (let i = 0; i < this.sudokuN; ++i) {
            for (let j = 0; j < this.sudokuN; ++j) {
                let candidateDiv = document.getElementById(Ids.cellCandidate(row, col, i, j))
                candidateDiv.classList.remove("display-none")
            }
        }
    }

    static hideCellCandidates(row, col) {
        for (let i = 0; i < this.sudokuN; ++i) {
            for (let j = 0; j < this.sudokuN; ++j) {
                let candidateDiv = document.getElementById(Ids.cellCandidate(row, col, i, j))
                candidateDiv.classList.add("display-none")
            }
        }
    }

    static setCellCandidates(row, col, candidates) {
        for (let i = 0; i < this.sudokuN; ++i) {
            for (let j = 0; j < this.sudokuN; ++j) {
                let candidateDiv = document.getElementById(Ids.cellCandidate(row, col, i, j))
                if (candidates.includes(i * this.sudokuN + j + 1)) {
                    candidateDiv.classList.remove("hidden")
                } else {
                    candidateDiv.classList.add("hidden")
                }
            }
        }
    }

    static validateRow(row) {
        const argDuplicates = ArrayUtils.argDuplicates(this.sudokuInput.matrix[row])
        for (let i = 0; i < argDuplicates.length; ++i) {
            document.getElementById(Ids.cell(row, argDuplicates[i])).classList.add("sudoku-cell-invalid")
        }
    }

    static validateColumn(col) {
        const column = this.column(this.sudokuInput, col)
        const argDuplicates = ArrayUtils.argDuplicates(column)
        for (let i = 0; i < argDuplicates.length; ++i) {
            document.getElementById(Ids.cell(argDuplicates[i], col)).classList.add("sudoku-cell-invalid")
        }
    }

    static validateBlock(blockNumber) {
        const block = this.block(this.sudokuInput, blockNumber)
        const blockIndices = this.blockIndices(blockNumber)
        const argDuplicates = ArrayUtils.argDuplicates(block)
        for (let i = 0; i < argDuplicates.length; ++i) {
            let row = blockIndices[argDuplicates[i]][0]
            let col = blockIndices[argDuplicates[i]][1]
            document.getElementById(Ids.cell(row, col)).classList.add("sudoku-cell-invalid")
        }
    }

    static clearInvalid() {
        for (let i = 0; i < this.sudokuSize; ++i) {
            for (let j = 0; j < this.sudokuSize; ++j) {
                document.getElementById(Ids.cell(i, j)).classList.remove("sudoku-cell-invalid")
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

    static solveSudoku() {
        let sudoku = this.sudokuInput.clone()
        let possibleValuesForCells = new Matrix(this.sudokuSize, this.sudokuSize, [])
        let changed = true
        let recomputePossibleValuesCells = true
        while (changed) {
            changed = false
            if (recomputePossibleValuesCells) {
                for (let i = 0; i < this.sudokuSize; ++i) {
                    for (let j = 0; j < this.sudokuSize; ++j) {
                        if (sudoku.matrix[i][j] === 0) {
                            let possibleValuesForCell = []
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
                const hashIndices = new Array(this.sudokuSize + 1).fill().map(() => [])
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

    static fromString(str) {
        let matrix = Matrix.fromString(str)
        if (matrix.length != this.sudokuSize) {
            throw new IncorrectSudokuSize(
                "Got incorrect number of rows in sudoku. Expected: ".concat(this.sudokuSize, ". Actual: ", matrix.length)
            )
        }
        this.load(matrix.matrix)
    }
}
