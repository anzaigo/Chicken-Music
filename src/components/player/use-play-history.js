import { useStore } from 'vuex'
import { PLAT_KEY } from '../../assets/js/constant'
import { save } from '../../assets/js/array-store'

export default function usePlayHistory() {
    const store = useStore()
    const maxLen = 200 // 最大保存数

    function savePlay(song) { // 添加播放记录到本地
        const songs = save(song, PLAT_KEY, (item) => {
            return item.id === song.id
        }, maxLen)

        store.commit('setPlayHistory', songs)
    }

    return {
        savePlay
    }
}
