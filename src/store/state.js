import { PLAY_MODE, FAVORITE_KEY, SEARCH_KEY } from '@/assets/js/constant'
import { load } from '@/assets/js/array-store'

const state = {
    squenceList: [], // 该歌手是歌曲列表, 顺序播放列表
    playlist: [], // 播放列表
    playing: false, // 播放状态：是否正在播放
    playMode: PLAY_MODE.sequence, // 播放方式？默认顺序播放
    currentIndex: 0, // 当前播放的歌曲
    fullScreen: false, // 全屏 or 收缩
    favoriteList: load(FAVORITE_KEY), // 用来保存收藏歌曲；初始化数据时应该从本地读取，否则一刷新就又变成空了
    searchHistory: load(SEARCH_KEY) // 搜索历史
}

export default state
