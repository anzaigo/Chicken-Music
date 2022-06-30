import { save, remove, clear } from '@/assets/js/array-store'
import { SEARCH_KEY } from '@/assets/js/constant'
import { useStore } from 'vuex'

export default function useSearchHistory() {
    const maxLen = 200 // 最大长度

    const store = useStore()

    function saveSearch(query) { // 添加搜索历史
        const searches = save(query, SEARCH_KEY, (item) => {
            return item === query
        }, maxLen)

        store.commit('setSearchHistory', searches)
    }
    function deleteSearch(query) { // 删除某条历史记录
        const searches = remove(SEARCH_KEY, (item) => {
            return item === query
        })
        store.commit('setSearchHistory', searches)
    }
    function clearSearch() { // 清空历史记录
        const searches = clear(SEARCH_KEY)
        store.commit('setSearchHistory', searches)
    }

    return {
        saveSearch,
        deleteSearch,
        clearSearch
    }
}
