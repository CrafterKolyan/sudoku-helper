export class Ids {
    static cell(row: number, col: number) {
        return "cell-" + row.toString() + "-" + col.toString()
    }

    static cellValue(row: number, col: number) {
        return "cell-value-" + row.toString() + "-" + col.toString()
    }

    static cellCandidate(row: number, col: number, innerRow: number, innerCol: number) {
        return "cell-candidate-" + row.toString() + "-" + col.toString() + "-" + innerRow.toString() + "-" + innerCol.toString()
    }
}
