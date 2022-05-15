export const currentIndex = (state) => { // 返回一个正在播放的歌曲给playlist
    return state.playlist[state.currentIndex] || {}
}
