import { PLAY_MODE } from '@/assets/js/constant'
import { shuffle } from '@/assets/js/util'

export function selectPlay({ commit }, { list, index }) {
    commit('setPlayMode', PLAY_MODE.sequence)
    commit('setSequanceList', list)
    commit('setPlayingState', true)
    commit('setFullScreen', true)
    commit('setPlaylist', list)
    commit('setcurrentIndex', index)
}
export function randomPlay({ commit }, list) {
    commit('setPlayMode', PLAY_MODE.sequence)
    commit('setSequanceList', list)
    commit('setPlayingState', true)
    commit('setFullScreen', true)
    commit('setPlaylist', shuffle(list)) // 随机播放
    commit('setcurrentIndex', 0)
}
