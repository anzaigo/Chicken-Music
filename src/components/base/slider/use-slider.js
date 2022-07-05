import BScroll from '@better-scroll/core'
import Slide from '@better-scroll/slide'

import { ref, onMounted, onUnmounted, onActivated, onDeactivated } from 'vue'
BScroll.use(Slide)

export default function useSlider(wrapperRef) {
    const slider = ref(null)
    const currentPageIndex = ref(0)

    onMounted(() => {
        const sliderVal = slider.value = new BScroll(wrapperRef.value, {
            click: true,
            scrollX: true,
            scrollY: false,
            momentum: false, // 滚动动画
            bounce: false, // 当滚动超过边缘的时候会有一小段回弹动画
            probeType: 2,
            slide: true
        })
        sliderVal.on('slideWillChange', (page) => { // 轮播圆点跟着切换（dot）
            currentPageIndex.value = page.pageX
        })
    })
    onUnmounted(() => {
        slider.value.destroy()
    })

    // keep-alive
    onActivated(() => {
        slider.value.enable() // 启用 BetterScroll
        slider.value.refresh()
    })
    onDeactivated(() => {
        slider.value.disable() // 禁用 BetterScroll，DOM 事件（如 touchstart、touchmove、touchend）的回调函数不再响应
    })
    return { slider, currentPageIndex }
}
