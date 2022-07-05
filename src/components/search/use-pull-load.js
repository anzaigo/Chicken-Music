import BScroll from '@better-scroll/core'
import PullUp from '@better-scroll/pull-up'
import ObserveDOM from '@better-scroll/slide'
import { ref, onMounted, onUnmounted, onActivated, onDeactivated } from 'vue'

BScroll.use(PullUp)
BScroll.use(ObserveDOM)

export default function usePullUpLoad(requestData, preventPullUpLoad) {
    // data
    const scroll = ref(null) // PullUp实例,在这里定义方便在onUnmounted注销
    const rootRef = ref(null) // suggest的Dom实例
    const isPullUpLoad = ref(false) // 标杆：判断是否正在拉取，或拉取结束（loading图案用的）

    // mounted
    onMounted(() => {
        const scrollVal = scroll.value = new BScroll(rootRef.value, {
            pullUpLoad: true, // PullUp的默认的插件选项对象。
            observeDOM: true, // slide的默认的插件选项对象。
            click: true
        })

        scrollVal.on('pullingUp', pullingUpHandler)

        async function pullingUpHandler() {
            if (preventPullUpLoad.value) { // 刚进入时立马上拉加载出现两个加载图标。watch监听props.query时执行searchFirst()会重置数据，那loading(等待提示图标)就会显示；而新版的Bscroll当不满足条件的时候即使去尝试滚动也去会触发PullUp，此时pullUpLoading也满足（显示加载提示图标）。解决方案：在makeItScrollable时，用户不能手动上拉加载，以及loadling为true时，阻止BScroll触发上拉加载
                scrollVal.finishPullUp()
                return
            }
            isPullUpLoad.value = true

            await requestData() // 加载数据
            scrollVal.finishPullUp() // 结束上拉加载行为。
            scrollVal.refresh() // 重新计算 BetterScroll，当 DOM 结构发生变化的时候务必要调用确保滚动的效果正常。
            isPullUpLoad.value = false
        }
    })

    onUnmounted(() => {
        scroll.value.destroy()
    })

    // keep-alive
    onActivated(() => {
        scroll.value.enable() // 启用 BetterScroll
        scroll.value.refresh()
    })
    onDeactivated(() => {
        scroll.value.disable() // 禁用 BetterScroll，DOM 事件（如 touchstart、touchmove、touchend）的回调函数不再响应
    })
    return {
        scroll,
        rootRef,
        isPullUpLoad
    }
}
