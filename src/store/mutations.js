const mutations = {
    setPlayingState(state, playing) { // 修改当前的播放状态
        state.playing = playing
    },
    setSequanceList(state, list) { // 修改顺序播放列表
        state.squenceList = list
    },
    setPlaylist(state, list) { // 设置播放列表
        state.playlist = list
    },
    setPlayMode(state, mode) { // 设置播放方式
        state.playMode = mode
    },
    setcurrentIndex(state, index) { // 设置当前播放歌曲的索引
        state.currentIndex = index
    },
    setFullScreen(state, fullScreen) { // 设置是否全屏
        state.fullScreen = fullScreen
    }
}

export default mutations
