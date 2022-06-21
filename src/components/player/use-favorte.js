// 点击收藏歌单逻辑
import { computed } from 'vue'
import { useStore } from 'vuex'
import { save, remove } from '@/assets/js/array-store'
import { FAVORITE_KEY } from '../../assets/js/constant'
export default function useFavorite() {
    // vuex
    const store = useStore()
    const favoriteList = computed(() => store.state.favoriteList)
    const maxLen = 100 // 最多收藏100条歌曲

    function getFavoriteIcon(song) { // 存在：点亮图标；不存在：默认图标
        return isFavorite(song) ? 'icon-favorite' : 'icon-not-favorite'
    }
    function toggleFavorite(song) {
        let list
        // 删除或添加收藏歌曲
        if (isFavorite(song)) { // 存在：移除该歌曲
            list = remove(FAVORITE_KEY, compare)
        } else { // 不存在：添加收藏列表
            list = save(song, FAVORITE_KEY, compare, maxLen)
        }
        store.commit('setFavorteList', list)

        function compare(item) { // 判断歌曲是否存在
            return item.id === song.id
        }
    }
    function isFavorite(song) { // 判断是否已经收藏（存在favoriteList列表里）
        return favoriteList.value.findIndex((item) => {
            return item.id === song.id
        }) > -1
    }
    return {
        getFavoriteIcon,
        toggleFavorite
    }
}
