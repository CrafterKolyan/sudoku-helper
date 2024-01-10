"use strict"

class Elements {
    static sudokuN = 3
    static sudokuSize = this.sudokuN * this.sudokuN

    static sudokuTableCellContent() {
        const input = document.createElement("input")
        input.type = "number"
        input.className = "sudoku-cell-content"
        return input
    }

    static sudokuTableCell() {
        const td = document.createElement("td")
        td.className = "sudoku-cell"
        td.appendChild(this.sudokuTableCellContent())
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
        if (this.sudokuSize === 1) {
            width = 27
        } else {
            width = 24 * this.sudokuSize + 2 * (this.sudokuN - 1) + 6
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

    static sudokuTableRow() {
        const tr = document.createElement("tr")
        tr.className = "sudoku-row"
        for (let i = 0; i < this.sudokuSize; ++i) {
            if (i !== 0 && i % this.sudokuN === 0) {
                tr.appendChild(this.sudokuTableVerticalDivider())
            }
            tr.appendChild(this.sudokuTableCell())
        }
        return tr
    }

    static sudokuTableBody() {
        const tbody = document.createElement("tbody")
        for (let i = 0; i < this.sudokuSize; ++i) {
            if (i % this.sudokuN == 0) {
                tbody.appendChild(this.sudokuTableHorizontalDivider())
            }
            tbody.appendChild(this.sudokuTableRow())
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
