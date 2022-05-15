export function shuffle(source) { // 重新洗牌函数，（随机数）
    const arr = source.slice() // slice截取方法会生成一个新的数组，目的为了不影响原数组(数据)
    for (let i = 0; i < arr.length; i++) {
        const j = getRandomInt(i)
        swap(arr, i, j)
    }
    return arr
}

function getRandomInt(max) {
    return Math.floor(Math.random() * (max + 1)) // 随机选择0~max的数
}

function swap(arr, i, j) {
    const t = arr[i]
    arr[i] = arr[j]
    arr[j] = t
}
