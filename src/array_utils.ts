export class ArrayUtils {
    static argDuplicates(arr: any[]) {
        const sortedArgArray = arr
            .map((v, i) => [v, i])
            .filter((v) => v[0] !== 0)
            .sort((a, b) => a[0] - b[0])
        if (sortedArgArray.length === 0) {
            return []
        }
        let prevValue = sortedArgArray[0][0]
        let pushedPrevious = false
        const duplicates: any[] = []
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

    static uniqueTuples(arr: [number, number][]) {
        if (arr.length === 0) {
            return []
        }
        arr.sort((a, b) => a[0] - b[0] || a[1] - b[1])
        const unique: any[] = []
        let prev = arr[0]
        unique.push(prev)
        for (let i = 1; i < arr.length; ++i) {
            if (arr[i][0] !== prev[0] || arr[i][1] !== prev[1]) {
                unique.push(arr[i])
                prev = arr[i]
            }
        }
        return unique
    }

    static subsets(arr: any[], k: number) {
        if (k === 0) {
            return [[]]
        } else if (arr.length === 0) {
            return []
        } else if (arr.length === k) {
            return [arr]
        } else if (arr.length < k) {
            return []
        }
        const result: any[][] = []
        for (let i = 0; i < arr.length; ++i) {
            const first = arr[i]
            const rest = arr.slice(i + 1)
            const restSubsets = this.subsets(rest, k - 1)
            for (let j = 0; j < restSubsets.length; ++j) {
                result.push([first, ...restSubsets[j]])
            }
        }
        return result
    }

    static allSubsets(arr: any[], minSize: number, maxSize: number) {
        const result: any[][] = []
        for (let i = minSize; i <= maxSize; ++i) {
            result.push(...this.subsets(arr, i))
        }
        return result
    }
}
