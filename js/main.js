"use strict";
(() => {
  // src/errors.ts
  var IncorrectClipboardItemsSize = class extends Error {
    constructor(message) {
      super(message);
    }
  };
  var IncorrectSudokuSize = class extends Error {
    constructor(message) {
      super(message);
    }
  };
  var ElementNotFound = class extends Error {
    constructor(message) {
      super(message);
    }
  };

  // src/array_utils.ts
  var ArrayUtils = class {
    static argDuplicates(arr) {
      const sortedArgArray = arr.map((v, i) => [v, i]).filter((v) => v[0] !== 0).sort((a, b) => a[0] - b[0]);
      if (sortedArgArray.length === 0) {
        return [];
      }
      let prevValue = sortedArgArray[0][0];
      let pushedPrevious = false;
      const duplicates = [];
      for (let i = 1; i < sortedArgArray.length; ++i) {
        if (prevValue == sortedArgArray[i][0]) {
          if (!pushedPrevious) {
            duplicates.push(sortedArgArray[i - 1][1]);
          }
          duplicates.push(sortedArgArray[i][1]);
          pushedPrevious = true;
        } else {
          pushedPrevious = false;
          prevValue = sortedArgArray[i][0];
        }
      }
      return duplicates;
    }
    static uniqueTuples(arr) {
      if (arr.length === 0) {
        return [];
      }
      arr.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
      const unique = [];
      let prev = arr[0];
      unique.push(prev);
      for (let i = 1; i < arr.length; ++i) {
        if (arr[i][0] !== prev[0] || arr[i][1] !== prev[1]) {
          unique.push(arr[i]);
          prev = arr[i];
        }
      }
      return unique;
    }
    static subsets(arr, k) {
      if (k === 0) {
        return [[]];
      } else if (arr.length === 0) {
        return [];
      } else if (arr.length === k) {
        return [arr];
      } else if (arr.length < k) {
        return [];
      }
      const result = [];
      for (let i = 0; i < arr.length; ++i) {
        const first = arr[i];
        const rest = arr.slice(i + 1);
        const restSubsets = this.subsets(rest, k - 1);
        for (let j = 0; j < restSubsets.length; ++j) {
          result.push([first, ...restSubsets[j]]);
        }
      }
      return result;
    }
    static allSubsets(arr, minSize, maxSize) {
      const result = [];
      for (let i = minSize; i <= maxSize; ++i) {
        result.push(...this.subsets(arr, i));
      }
      return result;
    }
  };

  // src/matrix.ts
  var Matrix = class _Matrix {
    #matrix;
    constructor(rows, cols, value) {
      this.#matrix = new Array(rows).fill(void 0).map(() => Array(cols).fill(value));
    }
    get matrix() {
      return this.#matrix;
    }
    get length() {
      return this.#matrix.length;
    }
    clone() {
      if (this.#matrix.length === 0) {
        return new _Matrix(0, 0);
      }
      const clone = new _Matrix(this.#matrix.length, this.#matrix[0].length);
      for (let i = 0; i < this.#matrix.length; ++i) {
        for (let j = 0; j < this.#matrix[0].length; ++j) {
          clone.matrix[i][j] = this.#matrix[i][j];
        }
      }
      return clone;
    }
    toString() {
      return JSON.stringify(this.#matrix);
    }
    static fromString(str) {
      const matrix = new _Matrix(0, 0);
      matrix.#matrix = JSON.parse(str);
      return matrix;
    }
  };

  // src/ids.ts
  var Ids = class {
    static cell(row, col) {
      return "cell-" + row.toString() + "-" + col.toString();
    }
    static cellValue(row, col) {
      return "cell-value-" + row.toString() + "-" + col.toString();
    }
    static cellCandidate(row, col, innerRow, innerCol) {
      return "cell-candidate-" + row.toString() + "-" + col.toString() + "-" + innerRow.toString() + "-" + innerCol.toString();
    }
  };

  // src/element_utils.ts
  var ElementUtils = class {
    static getExistingElementById(id) {
      const element = document.getElementById(id);
      if (element === null) {
        throw new ElementNotFound(id + " element was not found");
      }
      return element;
    }
  };

  // src/sudoku.ts
  var Sudoku = class {
    static {
      this.sudokuN = 3;
    }
    static {
      this.sudokuSize = this.sudokuN * this.sudokuN;
    }
    static {
      this.sudokuInput = new Matrix(this.sudokuSize, this.sudokuSize, 0);
    }
    static load(sudoku) {
      for (let i = 0; i < this.sudokuSize; ++i) {
        for (let j = 0; j < this.sudokuSize; ++j) {
          this.setCellNoRecompute(i, j, sudoku.matrix[i][j]);
        }
      }
      this.validateSudoku();
      this.solveSudokuAndFillCells();
    }
    static column(sudoku, col) {
      let column = [];
      for (let i = 0; i < this.sudokuSize; ++i) {
        column.push(sudoku.matrix[i][col]);
      }
      return column;
    }
    static blockNumber(row, col) {
      return this.sudokuN * Math.floor(row / this.sudokuN) + Math.floor(col / this.sudokuN);
    }
    static block(sudoku, blockNumber) {
      let block = [];
      let startI = Math.floor(blockNumber / this.sudokuN) * this.sudokuN;
      let startJ = blockNumber % this.sudokuN * this.sudokuN;
      for (let i = startI; i < startI + this.sudokuN; ++i) {
        for (let j = startJ; j < startJ + this.sudokuN; ++j) {
          block.push(sudoku.matrix[i][j]);
        }
      }
      return block;
    }
    static blockIndices(blockNumber) {
      let indices = [];
      let startI = Math.floor(blockNumber / this.sudokuN) * this.sudokuN;
      let startJ = blockNumber % this.sudokuN * this.sudokuN;
      for (let i = startI; i < startI + this.sudokuN; ++i) {
        for (let j = startJ; j < startJ + this.sudokuN; ++j) {
          indices.push([i, j]);
        }
      }
      return indices;
    }
    static setCellNoRecompute(row, col, value) {
      const div = ElementUtils.getExistingElementById(Ids.cell(row, col));
      const valueDiv = ElementUtils.getExistingElementById(Ids.cellValue(row, col));
      if (value !== 0) {
        valueDiv.innerText = value.toString();
        div.classList.add("sudoku-cell-input");
        div.classList.remove("sudoku-cell-computed");
        this.hideCellCandidates(row, col);
        this.setCellCandidates(row, col, []);
      } else {
        valueDiv.innerText = "";
        div.classList.add("sudoku-cell-computed");
        div.classList.remove("sudoku-cell-input");
        this.showCellCandidates(row, col);
      }
      this.sudokuInput.matrix[row][col] = value;
    }
    static setCell(row, col, value) {
      this.setCellNoRecompute(row, col, value);
      this.validateSudoku();
      this.solveSudokuAndFillCells();
    }
    static setCellComputed(row, col, value) {
      let valueDiv = ElementUtils.getExistingElementById(Ids.cellValue(row, col));
      if (value !== 0) {
        valueDiv.innerText = value.toString();
        this.setCellCandidates(row, col, []);
        this.hideCellCandidates(row, col);
      } else {
        valueDiv.innerText = "";
        this.showCellCandidates(row, col);
      }
    }
    static showCellCandidates(row, col) {
      for (let i = 0; i < this.sudokuN; ++i) {
        for (let j = 0; j < this.sudokuN; ++j) {
          let candidateDiv = ElementUtils.getExistingElementById(Ids.cellCandidate(row, col, i, j));
          candidateDiv.classList.remove("display-none");
        }
      }
    }
    static hideCellCandidates(row, col) {
      for (let i = 0; i < this.sudokuN; ++i) {
        for (let j = 0; j < this.sudokuN; ++j) {
          let candidateDiv = ElementUtils.getExistingElementById(Ids.cellCandidate(row, col, i, j));
          candidateDiv.classList.add("display-none");
        }
      }
    }
    static setCellCandidates(row, col, candidates) {
      for (let i = 0; i < this.sudokuN; ++i) {
        for (let j = 0; j < this.sudokuN; ++j) {
          let candidateDiv = ElementUtils.getExistingElementById(Ids.cellCandidate(row, col, i, j));
          if (candidates.includes(i * this.sudokuN + j + 1)) {
            candidateDiv.classList.remove("hidden");
          } else {
            candidateDiv.classList.add("hidden");
          }
        }
      }
    }
    static validateRow(row) {
      const argDuplicates = ArrayUtils.argDuplicates(this.sudokuInput.matrix[row]);
      for (let i = 0; i < argDuplicates.length; ++i) {
        const cellDiv = ElementUtils.getExistingElementById(Ids.cell(row, argDuplicates[i]));
        cellDiv.classList.add("sudoku-cell-invalid");
      }
    }
    static validateColumn(col) {
      const column = this.column(this.sudokuInput, col);
      const argDuplicates = ArrayUtils.argDuplicates(column);
      for (let i = 0; i < argDuplicates.length; ++i) {
        const cellDiv = ElementUtils.getExistingElementById(Ids.cell(argDuplicates[i], col));
        cellDiv.classList.add("sudoku-cell-invalid");
      }
    }
    static validateBlock(blockNumber) {
      const block = this.block(this.sudokuInput, blockNumber);
      const blockIndices = this.blockIndices(blockNumber);
      const argDuplicates = ArrayUtils.argDuplicates(block);
      for (let i = 0; i < argDuplicates.length; ++i) {
        let row = blockIndices[argDuplicates[i]][0];
        let col = blockIndices[argDuplicates[i]][1];
        const cellDiv = ElementUtils.getExistingElementById(Ids.cell(row, col));
        cellDiv.classList.add("sudoku-cell-invalid");
      }
    }
    static clearInvalid() {
      for (let i = 0; i < this.sudokuSize; ++i) {
        for (let j = 0; j < this.sudokuSize; ++j) {
          const cellDiv = ElementUtils.getExistingElementById(Ids.cell(i, j));
          cellDiv.classList.remove("sudoku-cell-invalid");
        }
      }
    }
    static validateRows() {
      for (let i = 0; i < this.sudokuSize; ++i) {
        this.validateRow(i);
      }
    }
    static validateColumns() {
      for (let i = 0; i < this.sudokuSize; ++i) {
        this.validateColumn(i);
      }
    }
    static validateBlocks() {
      for (let i = 0; i < this.sudokuSize; ++i) {
        this.validateBlock(i);
      }
    }
    static validateSudoku() {
      this.clearInvalid();
      this.validateRows();
      this.validateColumns();
      this.validateBlocks();
    }
    static solveSudoku() {
      let sudoku = this.sudokuInput.clone();
      let possibleValuesForCells = new Matrix(this.sudokuSize, this.sudokuSize, []);
      let changed = true;
      let recomputePossibleValuesCells = true;
      while (changed) {
        changed = false;
        if (recomputePossibleValuesCells) {
          for (let i = 0; i < this.sudokuSize; ++i) {
            for (let j = 0; j < this.sudokuSize; ++j) {
              if (sudoku.matrix[i][j] === 0) {
                let possibleValuesForCell = [];
                for (let k = 1; k <= this.sudokuSize; ++k) {
                  if (!sudoku.matrix[i].includes(k) && !this.column(sudoku, j).includes(k) && !this.block(sudoku, this.blockNumber(i, j)).includes(k)) {
                    possibleValuesForCell.push(k);
                  }
                }
                possibleValuesForCells.matrix[i][j] = possibleValuesForCell;
              } else {
                possibleValuesForCells.matrix[i][j] = [];
              }
            }
          }
          recomputePossibleValuesCells = false;
        }
        for (let i = 0; i < this.sudokuSize; ++i) {
          for (let j = 0; j < this.sudokuSize; ++j) {
            if (possibleValuesForCells.matrix[i][j].length === 1) {
              sudoku.matrix[i][j] = possibleValuesForCells.matrix[i][j][0];
              possibleValuesForCells.matrix[i][j] = [];
              changed = true;
            }
          }
        }
        if (changed) {
          recomputePossibleValuesCells = true;
          continue;
        }
        for (let blockNumber = 0; blockNumber < this.sudokuSize; ++blockNumber) {
          let blockIndices = this.blockIndices(blockNumber);
          for (let k = 1; k <= this.sudokuSize; ++k) {
            let possibleIndices = [];
            for (let i = 0; i < blockIndices.length; ++i) {
              let row = blockIndices[i][0];
              let col = blockIndices[i][1];
              if (possibleValuesForCells.matrix[row][col].includes(k)) {
                possibleIndices.push([row, col]);
              }
            }
            if (possibleIndices.length === 1) {
              let row = possibleIndices[0][0];
              let col = possibleIndices[0][1];
              sudoku.matrix[row][col] = k;
              possibleValuesForCells.matrix[row][col] = [];
              changed = true;
            }
          }
        }
        if (changed) {
          recomputePossibleValuesCells = true;
          continue;
        }
        for (let i = 0; i < this.sudokuSize; ++i) {
          for (let k = 1; k <= this.sudokuSize; ++k) {
            let possibleIndices = [];
            for (let j = 0; j < this.sudokuSize; ++j) {
              if (possibleValuesForCells.matrix[i][j].includes(k)) {
                possibleIndices.push(j);
              }
            }
            if (possibleIndices.length === 1) {
              let col = possibleIndices[0];
              sudoku.matrix[i][col] = k;
              possibleValuesForCells.matrix[i][col] = [];
              changed = true;
            }
          }
        }
        if (changed) {
          recomputePossibleValuesCells = true;
          continue;
        }
        for (let j = 0; j < this.sudokuSize; ++j) {
          for (let k = 1; k <= this.sudokuSize; ++k) {
            let possibleIndices = [];
            for (let i = 0; i < this.sudokuSize; ++i) {
              if (possibleValuesForCells.matrix[i][j].includes(k)) {
                possibleIndices.push(i);
              }
            }
            if (possibleIndices.length === 1) {
              let row = possibleIndices[0];
              sudoku.matrix[row][j] = k;
              possibleValuesForCells.matrix[row][j] = [];
              changed = true;
            }
          }
        }
        if (changed) {
          recomputePossibleValuesCells = true;
          continue;
        }
        for (let blockNumber = 0; blockNumber < this.sudokuSize; ++blockNumber) {
          const blockIndices = this.blockIndices(blockNumber);
          let emptyValues = [];
          const hashIndices = new Array(this.sudokuSize + 1).fill(void 0).map(() => []);
          for (let i = 0; i < this.sudokuSize; ++i) {
            emptyValues.push(i + 1);
          }
          for (let i = 0; i < blockIndices.length; ++i) {
            const row = blockIndices[i][0];
            const col = blockIndices[i][1];
            if (sudoku.matrix[row][col] !== 0) {
              emptyValues = emptyValues.filter((value) => value !== sudoku.matrix[row][col]);
            } else {
              for (let k = 0; k < possibleValuesForCells.matrix[row][col].length; ++k) {
                hashIndices[possibleValuesForCells.matrix[row][col][k]].push([row, col]);
              }
            }
          }
          const allSubsets = ArrayUtils.allSubsets(emptyValues, 2, 3);
          for (let i = 0; i < allSubsets.length; ++i) {
            const subset = allSubsets[i];
            let subsetIndices = [];
            for (let j = 0; j < subset.length; ++j) {
              subsetIndices.push(...hashIndices[subset[j]]);
            }
            subsetIndices = ArrayUtils.uniqueTuples(subsetIndices);
            if (subset.length === subsetIndices.length) {
              for (let j = 0; j < subsetIndices.length; ++j) {
                const row = subsetIndices[j][0];
                const col = subsetIndices[j][1];
                if (possibleValuesForCells.matrix[row][col].length > subset.length) {
                  possibleValuesForCells.matrix[row][col] = possibleValuesForCells.matrix[row][col].filter(
                    (value) => subset.includes(value)
                  );
                  changed = true;
                }
              }
            }
          }
        }
      }
      return [sudoku, possibleValuesForCells];
    }
    static solveSudokuAndFillCells() {
      let [sudoku, possibleValuesForCells] = this.solveSudoku();
      for (let i = 0; i < this.sudokuSize; ++i) {
        for (let j = 0; j < this.sudokuSize; ++j) {
          if (this.sudokuInput.matrix[i][j] === 0) {
            const candidates = possibleValuesForCells.matrix[i][j];
            this.setCellCandidates(i, j, candidates);
            if (candidates.length === 0) {
              this.setCellComputed(i, j, sudoku.matrix[i][j]);
            } else {
              this.setCellComputed(i, j, 0);
            }
          }
        }
      }
    }
    static toString() {
      return this.sudokuInput.toString();
    }
    static fromString(str) {
      let matrix = Matrix.fromString(str);
      if (matrix.length != this.sudokuSize) {
        throw new IncorrectSudokuSize(
          "Got incorrect number of rows in sudoku. Expected: ".concat(this.sudokuSize.toString(), ". Actual: ", matrix.length.toString())
        );
      }
      this.load(matrix);
    }
  };

  // src/string_utils.ts
  var StringUtils = class {
    static isNumeric(str) {
      return /^\d+$/.test(str);
    }
  };

  // src/elements.ts
  var Elements = class {
    static {
      this._sudokuCellSizePx = 60;
    }
    static {
      this._activeCellRow = void 0;
    }
    static {
      this._activeCellCol = void 0;
    }
    static _sudokuStyleContent(sudokuCellSizePx) {
      let hDividerWidth;
      if (Sudoku.sudokuSize === 1) {
        hDividerWidth = sudokuCellSizePx + 3;
      } else {
        hDividerWidth = sudokuCellSizePx * Sudoku.sudokuSize + 2 * (Sudoku.sudokuN - 1) + 6;
      }
      const fontSize = Math.floor(sudokuCellSizePx * 0.5);
      const candidateFontSize = Math.floor(sudokuCellSizePx * 0.6 / Sudoku.sudokuN);
      const borderSelectedSize = Math.floor(sudokuCellSizePx * 0.05);
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
            height: ${sudokuCellSizePx * 0.9 / Sudoku.sudokuN}px;
            width: ${sudokuCellSizePx * 0.9 / Sudoku.sudokuN}px;
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
        }`;
    }
    static sudokuStyle() {
      if (this._sudokuCellStyle === void 0) {
        const style = document.createElement("style");
        style.innerHTML = this._sudokuStyleContent(this._sudokuCellSizePx);
        this._sudokuCellStyle = style;
      }
      return this._sudokuCellStyle;
    }
    static sudokuCellSizeChange(sudokuCellSizePx) {
      this._sudokuCellSizePx = sudokuCellSizePx;
      this._sudokuCellStyle.innerHTML = this._sudokuStyleContent(sudokuCellSizePx);
    }
    static _setActiveCell(row, col) {
      if (this._activeCellRow !== void 0 && this._activeCellCol !== void 0) {
        const cellDiv = ElementUtils.getExistingElementById(Ids.cell(this._activeCellRow, this._activeCellCol));
        cellDiv.classList.remove("sudoku-cell-selected");
      }
      this._activeCellRow = row;
      this._activeCellCol = col;
      if (row !== void 0 && col !== void 0) {
        const cellDiv = ElementUtils.getExistingElementById(Ids.cell(row, col));
        cellDiv.classList.add("sudoku-cell-selected");
        this._sudokuHiddenInput.value = "0";
        this._sudokuHiddenInput.select();
        this._sudokuHiddenInput.focus();
      } else {
        this._sudokuHiddenInput.blur();
      }
    }
    static sudokuHiddenInput() {
      if (this._sudokuHiddenInput === void 0) {
        const input = document.createElement("input");
        input.id = "sudoku-hidden-input";
        input.className = "sudoku-hidden-input";
        input.type = "number";
        input.addEventListener("input", () => {
          if (input.value === "") {
            if (this._activeCellRow !== void 0 && this._activeCellCol !== void 0) {
              Sudoku.setCell(this._activeCellRow, this._activeCellCol, 0);
            }
          } else if (StringUtils.isNumeric(input.value)) {
            if (parseInt(input.value) > 0 && parseInt(input.value) <= Sudoku.sudokuSize && this._activeCellRow !== void 0 && this._activeCellCol !== void 0) {
              Sudoku.setCell(this._activeCellRow, this._activeCellCol, parseInt(input.value));
            }
          }
          input.value = "0";
          input.select();
        });
        input.addEventListener("blur", () => {
          this._setActiveCell(void 0, void 0);
        });
        input.addEventListener("keydown", (event) => {
          if (event.ctrlKey || event.altKey || event.metaKey || event.shiftKey) {
            return;
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
              event.preventDefault();
          }
          switch (event.key) {
            case "Esc":
            case "Escape":
              this._setActiveCell(void 0, void 0);
              if (this._activeCellRow !== void 0 && this._activeCellCol !== void 0) {
                Sudoku.setCell(this._activeCellRow, this._activeCellCol, 0);
              }
              break;
            case "Backspace":
              if (this._activeCellRow !== void 0 && this._activeCellCol !== void 0) {
                Sudoku.setCell(this._activeCellRow, this._activeCellCol, 0);
              }
              break;
            case "Delete":
              if (this._activeCellRow !== void 0 && this._activeCellCol !== void 0) {
                Sudoku.setCell(this._activeCellRow, this._activeCellCol, 0);
              }
              break;
            case "ArrowUp":
              if (this._activeCellRow !== void 0 && this._activeCellRow > 0) {
                this._setActiveCell(this._activeCellRow - 1, this._activeCellCol);
              }
              break;
            case "ArrowDown":
              if (this._activeCellRow !== void 0 && this._activeCellRow < Sudoku.sudokuSize - 1) {
                this._setActiveCell(this._activeCellRow + 1, this._activeCellCol);
              }
              break;
            case "ArrowLeft":
              if (this._activeCellCol !== void 0 && this._activeCellCol > 0) {
                this._setActiveCell(this._activeCellRow, this._activeCellCol - 1);
              }
              break;
            case "ArrowRight":
              if (this._activeCellCol !== void 0 && this._activeCellCol < Sudoku.sudokuSize - 1) {
                this._setActiveCell(this._activeCellRow, this._activeCellCol + 1);
              }
              break;
          }
          if (event.key >= "1" && event.key <= "9" && this._activeCellRow !== void 0 && this._activeCellCol !== void 0) {
            Sudoku.setCell(this._activeCellRow, this._activeCellCol, parseInt(event.key));
          }
        });
        this._sudokuHiddenInput = input;
      }
      return this._sudokuHiddenInput;
    }
    static sudokuTableCellValue(row, col) {
      const div = document.createElement("div");
      div.className = "sudoku-cell-value";
      div.id = Ids.cellValue(row, col);
      return div;
    }
    static sudokuTableCellCandidate(row, col, innerRow, innerCol) {
      const div = document.createElement("div");
      div.id = Ids.cellCandidate(row, col, innerRow, innerCol);
      div.className = "sudoku-cell-candidate";
      div.style.setProperty("grid-row", (innerRow + 1).toString());
      div.style.setProperty("grid-column", (innerCol + 1).toString());
      div.innerText = (innerRow * Sudoku.sudokuN + innerCol + 1).toString();
      return div;
    }
    static sudokuTableCellContent(row, col) {
      const div = document.createElement("div");
      div.className = "sudoku-cell-content sudoku-cell-computed";
      div.id = Ids.cell(row, col);
      div.appendChild(this.sudokuTableCellValue(row, col));
      for (let i = 0; i < Sudoku.sudokuN; ++i) {
        for (let j = 0; j < Sudoku.sudokuN; ++j) {
          div.appendChild(this.sudokuTableCellCandidate(row, col, i, j));
        }
      }
      div.addEventListener("click", () => {
        this._setActiveCell(row, col);
      });
      return div;
    }
    static sudokuTableCell(row, col) {
      const td = document.createElement("td");
      td.className = "sudoku-cell";
      td.appendChild(this.sudokuTableCellContent(row, col));
      return td;
    }
    static sudokuTableVerticalDivider() {
      const td = document.createElement("td");
      td.className = "sudoku-v-divider";
      return td;
    }
    static sudokuTableHorizontalDividerCell() {
      const td = document.createElement("td");
      td.className = "sudoku-h-divider";
      return td;
    }
    static sudokuTableHorizontalDivider() {
      const tr = document.createElement("tr");
      tr.className = "sudoku-row";
      tr.appendChild(this.sudokuTableHorizontalDividerCell());
      return tr;
    }
    static sudokuTableRow(row) {
      const tr = document.createElement("tr");
      tr.className = "sudoku-row";
      for (let i = 0; i < Sudoku.sudokuSize; ++i) {
        if (i !== 0 && i % Sudoku.sudokuN === 0) {
          tr.appendChild(this.sudokuTableVerticalDivider());
        }
        tr.appendChild(this.sudokuTableCell(row, i));
      }
      return tr;
    }
    static sudokuTableBody() {
      const tbody = document.createElement("tbody");
      for (let i = 0; i < Sudoku.sudokuSize; ++i) {
        if (i % Sudoku.sudokuN == 0) {
          tbody.appendChild(this.sudokuTableHorizontalDivider());
        }
        tbody.appendChild(this.sudokuTableRow(i));
      }
      tbody.appendChild(this.sudokuTableHorizontalDivider());
      return tbody;
    }
    static sudokuTable() {
      const table = document.createElement("table");
      table.appendChild(this.sudokuHiddenInput());
      table.appendChild(this.sudokuTableBody());
      return table;
    }
  };

  // src/main.ts
  function addSudokuTable() {
    const main = ElementUtils.getExistingElementById("main");
    const sudokuTable = Elements.sudokuTable();
    const sudokuCellStyle = Elements.sudokuStyle();
    main.appendChild(sudokuCellStyle);
    main.appendChild(sudokuTable);
    function recalculateSudokuCellSize() {
      const sudokuCellSize = Math.max(
        Math.floor(Math.min(window.innerWidth, window.innerHeight) / Sudoku.sudokuSize / Math.sqrt(2)),
        16
      );
      Elements.sudokuCellSizeChange(sudokuCellSize);
    }
    window.addEventListener("resize", recalculateSudokuCellSize);
    recalculateSudokuCellSize();
  }
  function addServiceWorkerIfSupported() {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sudoku-helper/service_worker.js").then((registration) => {
        registration.update();
      });
    }
  }
  async function pasteSudokuTable() {
    if ("clipboard" in navigator) {
      const clipboardItems = await navigator.clipboard.read();
      if (clipboardItems.length != 1) {
        throw new IncorrectClipboardItemsSize("Not supporting pasting more than 1 clipboard items");
      }
      const clipboardItem = clipboardItems[0];
      const onlySupportedType = "text/plain";
      if (clipboardItem.types.includes(onlySupportedType)) {
        const blob = await clipboardItem.getType(onlySupportedType);
        const text = await blob.text();
        Sudoku.fromString(text);
      }
    }
  }
  function copySudokuTable() {
    if ("clipboard" in navigator) {
      navigator.clipboard.writeText(Sudoku.toString());
    }
  }
  function addKeybindings() {
    document.addEventListener("keydown", (event) => {
      switch (event.key) {
        case "v":
          if ((event.ctrlKey || event.metaKey) && !event.altKey && !event.shiftKey) {
            pasteSudokuTable();
          }
          break;
        case "c":
          if ((event.ctrlKey || event.metaKey) && !event.altKey && !event.shiftKey) {
            copySudokuTable();
          }
          break;
      }
    });
  }
  function initialize() {
    addSudokuTable();
    addKeybindings();
    addServiceWorkerIfSupported();
  }
  window.addEventListener("load", initialize);
})();
