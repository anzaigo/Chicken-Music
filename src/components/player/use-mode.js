import { computed } from 'vue'
import { useStore } from 'vuex'
import { PLAY_MODE } from '@/assets/js/constant'
export default function useMode() {
    // 判断是顺序、循环、随机播放，切换对应按钮
    const store = useStore()
    const playMode = computed(() => store.state.playMode)

    const modeIcon = computed(() => {
        const playModeVal = playMode.value
        return playModeVal === PLAY_MODE.sequence ? 'icon-sequence' : playModeVal === PLAY_MODE.random ? 'icon-random' : 'icon-loop'
    })

    // 判断是顺序、循环、随机播放，显示对应的文字
    const modeText = computed(() => {
        const playModeVal = playMode.value
        return playModeVal === PLAY_MODE.sequence ? '顺序播放' : playModeVal === PLAY_MODE.random ? '随机播放' : '单曲循环'
    })
    function changeMode() {
        const mode = (playMode.value + 1) % 3
        store.dispatch('changeMode', mode)
    }
    return {
        modeIcon,
        modeText,
        changeMode
    }
}
