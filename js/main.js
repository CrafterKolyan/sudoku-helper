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

class Ids {
    static cell(row, col) {
        return "cell-" + row.toString() + "-" + col.toString()
    }
}

class Sudoku {
    static sudokuN = 3
    static sudokuSize = this.sudokuN * this.sudokuN
    static sudokuInput = Array(this.sudokuSize)
        .fill(0)
        .map(() => Array(this.sudokuSize).fill(0))

    static load(sudoku) {
        for (let i = 0; i < this.sudokuSize; ++i) {
            for (let j = 0; j < this.sudokuSize; ++j) {
                this.setCell(i, j, sudoku[i][j])
            }
        }
        this.validateSudoku()
        this.solveSudokuAndFillCells()
    }

    static column(col) {
        let column = []
        for (let i = 0; i < this.sudokuSize; ++i) {
            column.push(this.sudokuInput[i][col])
        }
        return column
    }

    static blockNumber(row, col) {
        return this.sudokuN * Math.floor(row / this.sudokuN) + Math.floor(col / this.sudokuN)
    }

    static block(blockNumber) {
        let block = []
        let startI = Math.floor(blockNumber / this.sudokuN) * this.sudokuN
        let startJ = (blockNumber % this.sudokuN) * this.sudokuN
        for (let i = startI; i < startI + this.sudokuN; ++i) {
            for (let j = startJ; j < startJ + this.sudokuN; ++j) {
                block.push(this.sudokuInput[i][j])
            }
        }
        return block
    }

    static blockIndices(blockNumber) {
        let indices = []
        let startI = Math.floor(blockNumber / this.sudokuN) * this.sudokuN
        let startJ = blockNumber % this.sudokuN
        for (let i = startI; i < startI + this.sudokuN; ++i) {
            for (let j = startJ; j < startJ + this.sudokuN; ++j) {
                indices.push([i, j])
            }
        }
        return indices
    }

    static setCell(row, col, value) {
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
        this.sudokuInput[row][col] = value
        this.validateSudoku()
        this.solveSudokuAndFillCells()
    }

    static validateRow(row) {
        const argDuplicates = ArrayUtils.argDuplicates(this.sudokuInput[row])
        for (let i = 0; i < argDuplicates.length; ++i) {
            document.getElementById(Ids.cell(row, argDuplicates[i])).classList.add("sudoku-cell-invalid")
        }
    }

    static validateColumn(col) {
        const column = this.column(col)
        const argDuplicates = ArrayUtils.argDuplicates(column)
        for (let i = 0; i < argDuplicates.length; ++i) {
            document.getElementById(Ids.cell(argDuplicates[i], col)).classList.add("sudoku-cell-invalid")
        }
    }

    static validateBlock(blockNumber) {
        const block = this.block(blockNumber)
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

    static solveSudokuAndFillCells() {
        let sudoku = this.sudokuInput
    }
}

class Elements {
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
        let width
        if (Sudoku.sudokuSize === 1) {
            width = 27
        } else {
            width = 24 * Sudoku.sudokuSize + 2 * (Sudoku.sudokuN - 1) + 6
        }
        td.style.width = width.toString() + "px"
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
    main.appendChild(sudokuTable)
}

function initialize() {
    addSudokuTable()
    Sudoku.load([
        [6, 1, 0, 0, 0, 0, 0, 5, 4],
        [3, 0, 8, 0, 0, 4, 0, 0, 7],
        [0, 0, 0, 0, 2, 0, 0, 1, 0],
        [0, 8, 0, 0, 0, 0, 0, 0, 3],
        [5, 0, 0, 2, 7, 0, 0, 0, 0],
        [0, 0, 0, 8, 0, 1, 0, 7, 0],
        [0, 0, 0, 0, 5, 0, 6, 3, 0],
        [9, 5, 0, 1, 0, 6, 7, 4, 0],
        [1, 7, 0, 4, 3, 2, 8, 9, 0]
    ])
}

window.addEventListener("load", initialize)
