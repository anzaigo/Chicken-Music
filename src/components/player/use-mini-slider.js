import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useStore } from 'vuex'
import BScroll from '@better-scroll/core'
import Slide from '@better-scroll/slide'

BScroll.use(Slide)

export default function useMiniSlider() {
    const sliderWrapperRef = ref(null)
    const slider = ref(null)

    const store = useStore()
    const fullScreen = computed(() => store.state.fullScreen)
    const playlist = computed(() => store.state.playlist)
    const currentIndex = computed(() => store.state.currentIndex)

    const sliderShow = computed(() => {
        return !fullScreen.value && !!playlist.value
    })

    onMounted(() => {
        let sliderVal
        watch(sliderShow, async (newSliderShow) => {
            if (newSliderShow) {
                await nextTick()
                if (!sliderVal) {
                    sliderVal = slider.value = new BScroll(sliderWrapperRef.value, {
                        click: true,
                        scrollX: true,
                        scrollY: false,
                        momentum: false,
                        bounce: false,
                        probeType: 2,
                        slide: {
                            autoplay: false,
                            loop: true
                        }
                    })
                    sliderVal.on('slidePageChanged', ({ pageX }) => {
                        store.commit('setcurrentIndex', pageX)
                    })
                } else {
                    sliderVal.refresh() // 重新计算 BetterScroll，当 DOM 结构发生变化的时候务必要调用确保滚动的效果正常。
                }
                sliderVal.goToPage(currentIndex.value, 0, 0)
            }
        })

        watch(currentIndex, (newIndex) => {
            if (sliderVal && sliderShow.value) {
                sliderVal.goToPage(newIndex, 0, 0)
            }
        })

        watch(playlist, async (newList) => { // 当歌曲被删除时，更新播放列表；数据变化后dom的渲染在nextTick之后
            if (sliderVal && sliderShow.value && newList.length) { // newList判断歌曲删除后是否还存在播放歌曲（清空）否则BS的refresh会报错
                await nextTick()
                sliderVal.refresh()
            }
        })
    })

    onUnmounted(() => {
        if (slider.value) {
            slider.value.destroy()
        }
    })
    return {
        slider,
        sliderWrapperRef
    }
}
