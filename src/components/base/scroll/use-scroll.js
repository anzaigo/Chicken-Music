import { ref, onMounted, onUnmounted } from 'vue'
import BScroll from '@better-scroll/core'
import ObserveDOM from '@better-scroll/observe-dom'
BScroll.use(ObserveDOM)

export default function useScroll(wrapperRef, options, emit) {
    const scroll = ref(null)
    onMounted(() => {
        const scrollVal = scroll.value = new BScroll(wrapperRef.value, {
            observeDOM: true,
            ...options
        })

        if (options.probeType > 0) { // 监听决定是否派发 scroll 事件，probeType大于0触发监听
            scrollVal.on('scroll', (pos) => {
                emit('scroll', pos)
            })
        }
    })
    onUnmounted(() => {
        scroll.value.destroy()
    })

    return scroll
}
