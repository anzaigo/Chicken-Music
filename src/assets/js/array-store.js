// 添加，移除 收藏歌曲
import storage from 'good-storage' // 本地存储操作文件

function inertArray(arr, val, compare, maxLen) { // arr: 被操作的数组；val：唯一的key值；compare：一个执行比较的规则；maxLen: 最大收藏数100
    const index = arr.findIndex(compare) // 判断是否已经存在收藏列表
    if (index > -1) { // 存在跳出函数
        return
    }
    arr.unshift(val) // 不存在则添加
    if (maxLen && arr.length > maxLen) { // 当收藏歌曲大于maxLen（100）首时，删除最先添加的歌曲
        arr.pop()
    }
}
function deleteFromArray(arr, compare) {
    const index = arr.findIndex(compare) // 判断是否已经存在收藏列表
    if (index > -1) { // 存在
        arr.splice(index, 1) // 删除该歌曲
    }
}
export function save(item, key, compare, maxLen) { // 添加收藏
    const items = storage.get(key, []) // 获取不到则返回一个空数组
    inertArray(items, item, compare, maxLen)
    storage.set(key, items) // 保存到本地
    return items
}
export function remove(key, compare) { // 删除收藏
    const items = storage.get(key, [])
    deleteFromArray(items, compare)
    storage.set(key, items)
    return items
}
