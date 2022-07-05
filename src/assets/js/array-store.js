// 添加，移除 收藏歌曲
import storage from 'good-storage' // 本地存储操作文件

function inertArray(arr, val, compare, maxLen) { // arr: 被操作的数组；val：唯一的key值；compare：一个执行比较的规则；maxLen: 最大收藏数100
    const index = arr.findIndex(compare) // 判断是否已经存在收藏列表
    if (index === 0) { // 存在并且在首位时，跳出函数
        return
    }
    if (index > 0) { // 不在首位（对首），则删除，后面的unshift会自动添加到对首
        arr.splice(index, 1)
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
export function load(key) { // 读取本地存储；有就添加，没有就默认[]
    return storage.get(key, [])
}
export function clear(key) { // 清空该本地存储
    storage.remove(key)
    return []
}
export function saveAll(items, key) { // 将重新获取到的歌曲url保存到本地
    storage.set(key, items)
}
