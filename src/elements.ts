import { StringUtils } from "./string_utils"
import { Ids } from "./ids"
import { Sudoku } from "./sudoku"
import { ElementUtils } from "./element_utils"

export class Elements {
  static _sudokuCellStyle: HTMLStyleElement
  static _sudokuCellSizePx = 60
  static _sudokuHiddenInput: HTMLInputElement
  static _activeCellRow: number | undefined = undefined
  static _activeCellCol: number | undefined = undefined

  static _sudokuStyleContent(sudokuCellSizePx: number) {
    let hDividerWidth
    if (Sudoku.sudokuSize === 1) {
      hDividerWidth = sudokuCellSizePx + 3
    } else {
      hDividerWidth = sudokuCellSizePx * Sudoku.sudokuSize + 2 * (Sudoku.sudokuN - 1) + 6
    }
    const fontSize = Math.floor(sudokuCellSizePx * 0.5)
    const candidateFontSize = Math.floor((sudokuCellSizePx * 0.6) / Sudoku.sudokuN)
    const borderSelectedSize = Math.floor(sudokuCellSizePx * 0.05)
    return `
        .sudoku-cell {
            border-top: 1px solid black;
            border-right: 1px solid black;
            height: ${sudokuCellSizePx}px;
            width: ${sudokuCellSizePx}px;
            font-size: ${fontSize}px;
            display: grid;
            align-items: center;
            background-color: #ccc;
            text-align: center;
        }

        .sudoku-cell-candidate {
            height: ${(sudokuCellSizePx * 0.9) / Sudoku.sudokuN}px;
            width: ${(sudokuCellSizePx * 0.9) / Sudoku.sudokuN}px;
            font-size: ${candidateFontSize}px;
        }

        .sudoku-cell-selected {
            border: ${borderSelectedSize}px ridge #5897fc;
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

  static sudokuCellSizeChange(sudokuCellSizePx: number) {
    this._sudokuCellSizePx = sudokuCellSizePx
    this._sudokuCellStyle.innerHTML = this._sudokuStyleContent(sudokuCellSizePx)
  }

  static _setActiveCell(row: number | undefined, col: number | undefined) {
    if (this._activeCellRow !== undefined && this._activeCellCol !== undefined) {
      const cellDiv = ElementUtils.getExistingElementById(Ids.cell(this._activeCellRow, this._activeCellCol))
      cellDiv.classList.remove("sudoku-cell-selected")
    }
    this._activeCellRow = row
    this._activeCellCol = col
    if (row !== undefined && col !== undefined) {
      const cellDiv = ElementUtils.getExistingElementById(Ids.cell(row, col))
      cellDiv.classList.add("sudoku-cell-selected")
      this._sudokuHiddenInput.value = "0"
      this._sudokuHiddenInput.select()
      this._sudokuHiddenInput.focus()
    } else {
      this._sudokuHiddenInput.blur()
    }
  }

  static sudokuHiddenInput() {
    if (this._sudokuHiddenInput === undefined) {
      const input = document.createElement("input")
      input.id = "sudoku-hidden-input"
      input.className = "sudoku-hidden-input"
      input.type = "number"
      input.addEventListener("input", () => {
        if (input.value === "") {
          if (this._activeCellRow !== undefined && this._activeCellCol !== undefined) {
            Sudoku.setCell(this._activeCellRow, this._activeCellCol, 0)
          }
        } else if (StringUtils.isNumeric(input.value)) {
          if (
            parseInt(input.value) > 0 &&
            parseInt(input.value) <= Sudoku.sudokuSize &&
            this._activeCellRow !== undefined &&
            this._activeCellCol !== undefined
          ) {
            Sudoku.setCell(this._activeCellRow, this._activeCellCol, parseInt(input.value))
          }
        }
        input.value = "0"
        input.select()
      })
      input.addEventListener("blur", () => {
        this._setActiveCell(undefined, undefined)
      })
      input.addEventListener("keydown", (event) => {
        if (event.ctrlKey || event.altKey || event.metaKey || event.shiftKey) {
          return
        }
        switch (event.key) {
          case "Backspace":
          case "Delete":
          case "ArrowUp":
          case "ArrowDown":
          case "ArrowLeft":
          case "ArrowRight":
          case "0":
          case "1":
          case "2":
          case "3":
          case "4":
          case "5":
          case "6":
          case "7":
          case "8":
          case "9":
            event.preventDefault()
        }
        switch (event.key) {
          case "Esc":
          case "Escape":
            this._setActiveCell(undefined, undefined)
            if (this._activeCellRow !== undefined && this._activeCellCol !== undefined) {
              Sudoku.setCell(this._activeCellRow, this._activeCellCol, 0)
            }
            break
          case "Backspace":
            if (this._activeCellRow !== undefined && this._activeCellCol !== undefined) {
              Sudoku.setCell(this._activeCellRow, this._activeCellCol, 0)
            }
            break
          case "Delete":
            if (this._activeCellRow !== undefined && this._activeCellCol !== undefined) {
              Sudoku.setCell(this._activeCellRow, this._activeCellCol, 0)
            }
            break
          case "ArrowUp":
            if (this._activeCellRow !== undefined && this._activeCellRow > 0) {
              this._setActiveCell(this._activeCellRow - 1, this._activeCellCol)
            }
            break
          case "ArrowDown":
            if (this._activeCellRow !== undefined && this._activeCellRow < Sudoku.sudokuSize - 1) {
              this._setActiveCell(this._activeCellRow + 1, this._activeCellCol)
            }
            break
          case "ArrowLeft":
            if (this._activeCellCol !== undefined && this._activeCellCol > 0) {
              this._setActiveCell(this._activeCellRow, this._activeCellCol - 1)
            }
            break
          case "ArrowRight":
            if (this._activeCellCol !== undefined && this._activeCellCol < Sudoku.sudokuSize - 1) {
              this._setActiveCell(this._activeCellRow, this._activeCellCol + 1)
            }
            break
        }
        if (event.key >= "1" && event.key <= "9" && this._activeCellRow !== undefined && this._activeCellCol !== undefined) {
          Sudoku.setCell(this._activeCellRow, this._activeCellCol, parseInt(event.key))
        }
      })
      this._sudokuHiddenInput = input
    }

    return this._sudokuHiddenInput
  }

  static sudokuTableCellValue(row: number, col: number) {
    const div = document.createElement("div")
    div.className = "sudoku-cell-value"
    div.id = Ids.cellValue(row, col)
    return div
  }

  static sudokuTableCellCandidate(row: number, col: number, innerRow: number, innerCol: number) {
    const div = document.createElement("div")
    div.id = Ids.cellCandidate(row, col, innerRow, innerCol)
    div.className = "sudoku-cell-candidate"
    div.style.setProperty("grid-row", (innerRow + 1).toString())
    div.style.setProperty("grid-column", (innerCol + 1).toString())
    div.innerText = (innerRow * Sudoku.sudokuN + innerCol + 1).toString()
    return div
  }

  static sudokuTableCellContent(row: number, col: number) {
    const div = document.createElement("div")
    div.className = "sudoku-cell-content sudoku-cell-computed"
    div.id = Ids.cell(row, col)
    div.appendChild(this.sudokuTableCellValue(row, col))
    for (let i = 0; i < Sudoku.sudokuN; ++i) {
      for (let j = 0; j < Sudoku.sudokuN; ++j) {
        div.appendChild(this.sudokuTableCellCandidate(row, col, i, j))
      }
    }
    div.addEventListener("click", () => {
      this._setActiveCell(row, col)
    })
    return div
  }

  static sudokuTableCell(row: number, col: number) {
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

  static sudokuTableRow(row: number) {
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
    table.appendChild(this.sudokuHiddenInput())
    table.appendChild(this.sudokuTableBody())
    return table
  }
}
