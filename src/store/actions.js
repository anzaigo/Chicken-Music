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
    commit('setPlayMode', PLAY_MODE.random)
    commit('setSequanceList', list)
    commit('setPlayingState', true)
    commit('setFullScreen', true)
    commit('setPlaylist', shuffle(list)) // 随机播放
    commit('setcurrentIndex', 0)
}

export function changeMode({ commit, state, getters }, mode) {
    const currentId = getters.currentSong.id // 当前播放歌曲的id
    if (mode === PLAY_MODE.random) {
        commit('setPlaylist', shuffle(state.squenceList)) // 随机播放
    } else {
        commit('setPlaylist', state.squenceList) // 顺序播放
    }
    const index = state.playlist.findIndex((song) => { // 正在播放的歌曲在新的播放列表中的索引位置----也就是将 当前播放的歌曲仍然是切换后播放的歌曲（防止每次点击切换播放顺序方式按钮都会重新播放新的歌曲，而不是之前正在播放的歌曲）
        return song.id === currentId
    })
    commit('setcurrentIndex', index) // 提交当前歌曲在新的播放列表中索引
    commit('setPlayMode', mode) // 提交播放顺序方式
}

export function removeSong({ commit, state }, song) {
    const sequenceList = state.squenceList.slice() // 在actions修改state数据会报错，所有加slice
    const playlist = state.playlist.slice()

    const sequenceIndex = findIndex(sequenceList, song) // 匹配被点击删除的歌曲
    const playIndex = findIndex(playlist, song) // 匹配被点击删除的歌曲

    if (sequenceIndex < 0 || playIndex < 0) { // (保护4) 当歌曲已被删除时（findIndex返回（-1）不存在）
        return
    }

    sequenceList.splice(sequenceIndex, 1) // 删除歌曲
    playlist.splice(playIndex, 1) // 删除歌曲

    let currentIndex = state.currentIndex
    if (playIndex < currentIndex || currentIndex === playlist.length) { // 当删除的歌曲在播放歌曲之前或是删除的是最后一首歌，会出现歌曲索引错误的bug
        currentIndex--
    }

    commit('setSequanceList', sequenceList)
    commit('setPlaylist', playlist)
    commit('setcurrentIndex', currentIndex)
    if (!playIndex.length) { // 当删除最后一首歌曲时，暂停播放(如果是播放状态)
        commit('setPlayingState', false)
    }
}
export function clearSongList({ commit }) {
    commit('setSequanceList', [])
    commit('setPlaylist', [])
    commit('setcurrentIndex', 0)
    commit('setPlayingState', false)
}

export function addSong({ commit, state }, song) {
    const playlist = state.playlist.slice()
    const sequenceList = state.squenceList.slice()
    let currentIndex = state.currentIndex

    const playIndex = findIndex(playlist, song)
    if (playIndex > -1) { // 判断是被点击的歌曲否存在播放列表。
        currentIndex = playIndex // 存在-改变索引
    } else { // 不存在，添加
        playlist.push(song)
        currentIndex = playlist.length - 1
    }

    const sequenceIndex = findIndex(sequenceList, song)
    if (sequenceIndex === -1) {
        sequenceList.push(song) // 添加到歌曲列表
    }

    commit('setSequanceList', sequenceList)
    commit('setPlaylist', playlist)
    commit('setcurrentIndex', currentIndex)
    commit('setPlayingState', true)
    commit('setFullScreen', true)
}

function findIndex(list, song) {
    return list.findIndex((item) => {
        return item.id === song.id
    })
}
