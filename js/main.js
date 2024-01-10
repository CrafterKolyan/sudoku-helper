"use strict"

class StringUtils {
    static isNumeric(str) {
        return /^\d+$/.test(str)
    }
}

class Sudoku {
    static sudokuN = 3
    static sudokuSize = this.sudokuN * this.sudokuN
    static sudokuInput = Array(this.sudokuSize)
        .fill(0)
        .map(() => Array(this.sudokuSize).fill(0))

    static setCell(row, col, value) {
        this.sudokuInput[row][col] = value
    }
}

class Elements {
    static sudokuTableCellContent(row, col) {
        const input = document.createElement("input")
        input.id = "cell-" + row.toString() + "-" + col.toString()
        input.type = "number"
        input.classList.add("sudoku-cell-content")
        input.classList.add("sudoku-cell-computed")
        input.addEventListener("keypress", (event) => {
            event.preventDefault()
            const key = event.key
            if (StringUtils.isNumeric(key) && key !== "0") {
                input.value = key
                Sudoku.setCell(row, col, parseInt(key))
                input.classList.add("sudoku-cell-input")
                input.classList.remove("sudoku-cell-computed")
            }
        })
        input.addEventListener("keydown", (event) => {
            const key = event.key
            if (key === "Backspace" || key === "Delete") {
                event.preventDefault()
                input.value = ""
                Sudoku.setCell(row, col, 0)
                input.classList.add("sudoku-cell-computed")
                input.classList.remove("sudoku-cell-input")
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

function onChangeCell(row, col) {
    console.log(row, col)
}

function addSudokuTable() {
    const main = document.getElementById("main")
    const sudokuTable = Elements.sudokuTable()
    main.appendChild(sudokuTable)
}

function initialize() {
    addSudokuTable()
}

window.addEventListener("load", initialize)
