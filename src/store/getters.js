export const currentSong = (state) => { // 返回一个正在播放的歌曲给playlist
    return state.playlist[state.currentIndex] || {} // 取不到值的时候赋值{}，避免undefined报错
}
