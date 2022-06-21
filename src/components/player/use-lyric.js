// 歌词逻辑
import { useStore } from 'vuex'
import { computed, watch, ref } from 'vue'
import { getLyric } from '../../service/song'
import Lyric from 'lyric-parser' // 第三方库（解析歌词插件）

export default function useLyric({ songReady, currentTime }) {
    const currentLyric = ref(null) // 歌词
    const currentLineNum = ref(0) // 当前显示歌词的行号
    const pureMusicLyric = ref('') // 没有歌词时的提示（如纯音乐）
    const playingLyric = ref('') // cd（middle-l）中正在播放的歌词
    const lyricScrollRef = ref(null) // Scroll组件实例
    const lyricListRef = ref(null) // 每一项歌词的dom实例

    // vuex
    const store = useStore()
    const currentSong = computed(() => store.getters.currentSong)

    watch(currentSong, async (newSong) => { // 获取歌的歌词
        if (!newSong.url || !newSong.id) { // 不合法的歌曲剔除
            return
        }
        // 当来回切换歌曲时，歌词仍在跳转，这时就要在切换歌曲时暂停、清空歌词并初始化被切换之前的歌词
        stopLyric() // 切换歌曲之前暂停跳转歌词（但是getLyric没加载完就已经可以播放了（songReady），还是有问题）
        currentLyric.value = null // 把上一首歌词变成null，这样songReady调用playLyric时也就不符合条件了
        // 切换歌曲时初始化歌词及行号
        currentLineNum.value = 0
        playingLyric.value = ''
        pureMusicLyric.value = ''

        const lyric = await getLyric(newSong) // 获取歌词
        store.commit('addSongLyric', { // 提交添加歌词
            song: newSong,
            lyric
        })
        if (currentSong.value.lyric !== lyric) { // 当getLyric获取期间时，用户可能会快速切换歌曲，导致获取的歌词不一致（用户切换歌曲后才加载完getLyric）
            return
        }

        currentLyric.value = new Lyric(lyric, handleLyric)
        const hasLyric = currentLyric.value.lines.length
        if (hasLyric) { // 判断是否有歌词存在
            if (songReady.value) { // 判断歌曲是否可以播放了
                playLyric()
            }
        } else {
            playingLyric.value = pureMusicLyric.value = lyric.replace(/\[(\d{2}):(\d{2}):(\d{2})\]/g, '') // 没有歌词时提示没有歌词相关语句（如纯音乐）
        }
    })

    function handleLyric({ lineNum, txt }) {
        currentLineNum.value = lineNum // 赋值行号给currentLineNum
        playingLyric.value = txt // 赋值歌词给playingLyric
        const scrollComp = lyricScrollRef.value // Comp代表组件
        const listEl = lyricListRef.value // El代表的是DOM实例

        if (!listEl) { // 因为用到了v-if, 当这个dom不存在时，也就没有了操作的必要
            return
        }
        if (lineNum > 5) { // 歌词大于5行时，让其保持在在第6行进行滚动
            const lineEl = listEl.children[lineNum - 5]
            scrollComp.scroll.scrollToElement(lineEl, 1000)
        } else {
            scrollComp.scroll.scrollTo(0, 0, 1000)
        }
    }
    function playLyric() { // 歌词跳转
        const currentLyricVal = currentLyric.value
        if (currentLyricVal) {
            currentLyricVal.seek(currentTime.value * 1000) // 歌词的当前播放时间
        }
    }
    function stopLyric() { // 暂停歌词
        const currentLyricVal = currentLyric.value
        if (currentLyricVal) {
            currentLyricVal.stop()
        }
    }
    return {
        currentLyric,
        currentLineNum,
        pureMusicLyric,
        playingLyric,
        playLyric,
        lyricScrollRef,
        lyricListRef,
        stopLyric
    }
}
