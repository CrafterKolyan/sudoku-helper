"use strict"

class StringUtils {
    static isNumeric(str) {
        return /^\d+$/.test(str)
    }
}

class ArrayUtils {
    static argDuplicates(arr) {
        const sortedArgArray = arr
            .map((v, i) => [v, i])
            .filter((v) => v[0] !== 0)
            .sort((a, b) => a[0] - b[0])
        if (sortedArgArray.length === 0) {
            return []
        }
        let prevValue = sortedArgArray[0][0]
        let pushedPrevious = false
        const duplicates = []
        for (let i = 1; i < sortedArgArray.length; ++i) {
            if (prevValue == sortedArgArray[i][0]) {
                if (!pushedPrevious) {
                    duplicates.push(sortedArgArray[i - 1][1])
                }
                duplicates.push(sortedArgArray[i][1])
                pushedPrevious = true
            } else {
                pushedPrevious = false
                prevValue = sortedArgArray[i][0]
            }
        }
        return duplicates
    }
}

class Matrix {
    #matrix
    
    constructor(rows, cols, value) {
        this.#matrix = Array(rows)
            .fill()
            .map(() => Array(cols).fill(value))
    }

    get matrix() {
        return this.#matrix
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
}

class Ids {
    static cell(row, col) {
        return "cell-" + row.toString() + "-" + col.toString()
    }
}

class Sudoku {
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
        let startJ = blockNumber % this.sudokuN * this.sudokuN
        for (let i = startI; i < startI + this.sudokuN; ++i) {
            for (let j = startJ; j < startJ + this.sudokuN; ++j) {
                indices.push([i, j])
            }
        }
        return indices
    }

    static setCellNoRecompute(row, col, value) {
        let input = document.getElementById(Ids.cell(row, col))
        if (value !== 0) {
            input.value = value.toString()
            input.classList.add("sudoku-cell-input")
            input.classList.remove("sudoku-cell-computed")
        } else {
            input.value = ""
            input.classList.add("sudoku-cell-computed")
            input.classList.remove("sudoku-cell-input")
        }
        this.sudokuInput.matrix[row][col] = value
    }

    static setCell(row, col, value) {
        this.setCellNoRecompute(row, col, value)
        this.validateSudoku()
        this.solveSudokuAndFillCells()
    }

    static setCellComputed(row, col, value) {
        let input = document.getElementById(Ids.cell(row, col))
        if (value !== 0) {
            input.value = value.toString()
        } else {
            input.value = ""
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
        while (changed) {
            changed = false
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
                        if (possibleValuesForCell.length === 1) {
                            sudoku.matrix[i][j] = possibleValuesForCell[0]
                            changed = true
                        }
                        possibleValuesForCells.matrix[i][j] = possibleValuesForCell
                    } else {
                        possibleValuesForCells.matrix[i][j] = []
                    }
                }
            }
            if (changed) {
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
                        changed = true
                    }
                }
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
                        changed = true
                    }
                }
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
                        changed = true
                    }
                }
            }
        }
        return sudoku
    }

    static solveSudokuAndFillCells() {
        let sudoku = this.solveSudoku()
        for (let i = 0; i < this.sudokuSize; ++i) {
            for (let j = 0; j < this.sudokuSize; ++j) {
                if (this.sudokuInput.matrix[i][j] === 0) {
                    this.setCellComputed(i, j, sudoku.matrix[i][j])
                }
            }
        }
    }
}

class Elements {
    static _sudokuCellStyle
    static _sudokuCellSizePx = 60

    static _sudokuStyleContent(sudokuCellSizePx) {
        let hDividerWidth
        if (Sudoku.sudokuSize === 1) {
            hDividerWidth = sudokuCellSizePx + 3
        } else {
            hDividerWidth = sudokuCellSizePx * Sudoku.sudokuSize + 2 * (Sudoku.sudokuN - 1) + 6
        }
        const fontSize = Math.floor(sudokuCellSizePx * 0.5)
        return `
        .sudoku-cell {
            border-top: 1px solid black;
            border-right: 1px solid black;
            height: ${sudokuCellSizePx}px;
            width: ${sudokuCellSizePx}px;
        }

        .sudoku-cell > input {
            font-size: ${fontSize}px;
        }

        .sudoku-row > .sudoku-cell:first-child {
            width: ${sudokuCellSizePx + 3}px;
            border-left: 3px solid black;
        }

        .sudoku-row > .sudoku-cell:last-child {
            width: ${sudokuCellSizePx + 3}px;
            border-right: 3px solid black;
        }
        
        .sudoku-v-divider {
            background-color: black;
            height: ${sudokuCellSizePx}px;
            width: 2px
        }
        
        .sudoku-h-divider {
            background-color: black;
            height: 2px;
            width: ${hDividerWidth}px;
        }`
    }

    static sudokuStyle() {
        if (this._sudokuCellStyle === undefined) {
            const style = document.createElement("style")
            style.innerHTML = this._sudokuStyleContent(this._sudokuCellSizePx)
            this._sudokuCellStyle = style
        }
        return this._sudokuCellStyle
    }

    static sudokuCellSizeChange(sudokuCellSizePx) {
        this._sudokuCellSizePx = sudokuCellSizePx
        this._sudokuCellStyle.innerHTML = this._sudokuStyleContent(sudokuCellSizePx)
        console.log(this._sudokuCellStyle)
    }

    static sudokuTableCellContent(row, col) {
        const input = document.createElement("input")
        input.id = Ids.cell(row, col)
        input.type = "number"
        input.classList.add("sudoku-cell-content")
        input.classList.add("sudoku-cell-computed")
        input.addEventListener("keypress", (event) => {
            event.preventDefault()
            const key = event.key
            if (StringUtils.isNumeric(key) && key !== "0") {
                Sudoku.setCell(row, col, parseInt(key))
            }
        })
        input.addEventListener("keydown", (event) => {
            const key = event.key
            switch (key) {
                case "ArrowUp":
                    event.preventDefault()
                    if (row > 0) {
                        document.getElementById(Ids.cell(row - 1, col)).focus()
                    }
                    break
                case "ArrowDown":
                    event.preventDefault()
                    if (row < Sudoku.sudokuSize - 1) {
                        document.getElementById(Ids.cell(row + 1, col)).focus()
                    }
                    break
                case "ArrowLeft":
                    event.preventDefault()
                    if (col > 0) {
                        document.getElementById(Ids.cell(row, col - 1)).focus()
                    }
                    break
                case "ArrowRight":
                    event.preventDefault()
                    if (col < Sudoku.sudokuSize - 1) {
                        document.getElementById(Ids.cell(row, col + 1)).focus()
                    }
                    break
                case "Backspace":
                case "Delete":
                    event.preventDefault()
                    Sudoku.setCell(row, col, 0)
                    break
                
            }
        })
        input.addEventListener("paste", (event) => {
            event.preventDefault()
        })
        input.addEventListener("input", (event) => {
            const value = event.target.value
            if (value === "") {
                Sudoku.setCell(row, col, 0)
            } else if(value.length === 1 && StringUtils.isNumeric(value) && value !== "0") {
                Sudoku.setCell(row, col, parseInt(value))
            } else {
                event.target.value = ""
                Sudoku.setCell(row, col, 0)
            }
        })
        return input
    }

    static sudokuTableCell(row, col) {
        const td = document.createElement("td")
        td.className = "sudoku-cell"
        td.appendChild(this.sudokuTableCellContent(row, col))
        return td
    }

    static sudokuTableVerticalDivider() {
        const td = document.createElement("td")
        td.className = "sudoku-v-divider"
        return td
    }

    static sudokuTableHorizontalDividerCell() {
        const td = document.createElement("td")
        td.className = "sudoku-h-divider"
        return td
    }

    static sudokuTableHorizontalDivider() {
        const tr = document.createElement("tr")
        tr.className = "sudoku-row"
        tr.appendChild(this.sudokuTableHorizontalDividerCell())
        return tr
    }

    static sudokuTableRow(row) {
        const tr = document.createElement("tr")
        tr.className = "sudoku-row"
        for (let i = 0; i < Sudoku.sudokuSize; ++i) {
            if (i !== 0 && i % Sudoku.sudokuN === 0) {
                tr.appendChild(this.sudokuTableVerticalDivider())
            }
            tr.appendChild(this.sudokuTableCell(row, i))
        }
        return tr
    }

    static sudokuTableBody() {
        const tbody = document.createElement("tbody")
        for (let i = 0; i < Sudoku.sudokuSize; ++i) {
            if (i % Sudoku.sudokuN == 0) {
                tbody.appendChild(this.sudokuTableHorizontalDivider())
            }
            tbody.appendChild(this.sudokuTableRow(i))
        }
        tbody.appendChild(this.sudokuTableHorizontalDivider())
        return tbody
    }

    static sudokuTable() {
        const table = document.createElement("table")
        table.appendChild(this.sudokuTableBody())
        return table
    }
}

function addSudokuTable() {
    const main = document.getElementById("main")
    const sudokuTable = Elements.sudokuTable()
    const sudokuCellStyle = Elements.sudokuStyle()
    main.appendChild(sudokuCellStyle)
    main.appendChild(sudokuTable)

    function recalculateSudokuCellSize() {
        const sudokuCellSize = Math.max(Math.floor(Math.min(window.innerWidth, window.innerHeight) / Sudoku.sudokuSize / Math.sqrt(2)), 24)
        Elements.sudokuCellSizeChange(sudokuCellSize)
    }

    window.addEventListener("resize", recalculateSudokuCellSize)
    recalculateSudokuCellSize()
}

function initialize() {
    addSudokuTable()
}

window.addEventListener("load", initialize)
