import {  IncorrectClipboardItemsSize } from "./errors"
import { Sudoku } from "./sudoku"
import { Elements } from "./elements"
import { ElementUtils } from "./element_utils"

function addSudokuTable() {
    const main = ElementUtils.getExistingElementById("main")
    const sudokuTable = Elements.sudokuTable()
    const sudokuCellStyle = Elements.sudokuStyle()
    main.appendChild(sudokuCellStyle)
    main.appendChild(sudokuTable)

    function recalculateSudokuCellSize() {
        const sudokuCellSize = Math.max(
            Math.floor(Math.min(window.innerWidth, window.innerHeight) / Sudoku.sudokuSize / Math.sqrt(2)),
            16
        )
        Elements.sudokuCellSizeChange(sudokuCellSize)
    }

    window.addEventListener("resize", recalculateSudokuCellSize)
    recalculateSudokuCellSize()
}

function addServiceWorkerIfSupported() {
    if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("/sudoku-helper/service_worker.js").then((registration) => {
            registration.update()
        })
    }
}

async function pasteSudokuTable() {
    if ("clipboard" in navigator) {
        const clipboardItems = await navigator.clipboard.read()
        if (clipboardItems.length != 1) {
            throw new IncorrectClipboardItemsSize("Not supporting pasting more than 1 clipboard items")
        }
        const clipboardItem = clipboardItems[0]
        const onlySupportedType = "text/plain"
        if (clipboardItem.types.includes(onlySupportedType)) {
            const blob = await clipboardItem.getType(onlySupportedType)
            const text = await blob.text()
            Sudoku.fromString(text)
        }
    }
}

function copySudokuTable() {
    if ("clipboard" in navigator) {
        navigator.clipboard.writeText(Sudoku.toString())
    }
}

function addKeybindings() {
    document.addEventListener("keydown", (event) => {
        switch (event.key) {
            case "v":
                if ((event.ctrlKey || event.metaKey) && !event.altKey && !event.shiftKey) {
                    pasteSudokuTable()
                }
                break
            case "c":
                if ((event.ctrlKey || event.metaKey) && !event.altKey && !event.shiftKey) {
                    copySudokuTable()
                }
                break
        }
    })
}

function initialize() {
    addSudokuTable()
    addKeybindings()
    addServiceWorkerIfSupported()
}

window.addEventListener("load", initialize)
