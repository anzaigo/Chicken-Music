// 根据用户滑动的偏移量来切换页面
// a）：设置方向锁
import { ref } from 'vue'

export default function useMiddleInteractive() {
    const currentShow = ref('cd') // 滑动切换cd or lyric
    const middleLStyle = ref(null) // middle-l---dom实例
    const middleRStyle = ref(null) // middle-r---dom实例

    const touch = {} // 用来保存x轴坐标和滑动时的偏移量
    let currentView = 'cd' // 根据滑动的偏移量判断是否切换cd or lyric

    function onMiddleTouchStart(e) {
        touch.startX = e.touches[0].pageX // 按下时的x坐标

        touch.startY = e.touches[0].pageY// a）按下时的x坐标
        touch.directionLocked = '' // a）
    }
    function onMiddleTouchMove(e) {
        const deltaX = e.touches[0].pageX - touch.startX // 偏移量（滑动后 - 滑动前）
        const deltaY = e.touches[0].pageY - touch.startY // a）

        const absDeltaX = Math.abs(deltaX)
        const absDeltaY = Math.abs(deltaY) // a）

        if (!touch.directionLocked) { // 当水平方向上的滑动偏移量大于垂直方向上滑动偏移量时
            touch.directionLocked = absDeltaX >= absDeltaY ? 'h' : 'v'
        }

        if (touch.directionLocked === 'v') { // 锁住垂直滑动
            return
        }

        const left = currentView === 'cd' ? 0 : -window.innerWidth // 初始位移
        const offsetWidth = Math.min(0, Math.max(-window.innerWidth, left + deltaX)) // 偏移量(相对于初始位移)
        touch.percent = Math.abs(offsetWidth / window.innerWidth) // 偏移比例

        // 根据偏移量去切换cd or lyric视图
        if (currentView === 'cd') {
            if (touch.percent > 0.2) {
                currentShow.value = 'lyric'
            } else {
                currentShow.value = 'cd'
            }
        } else {
            if (touch.percent < 0.8) {
                currentShow.value = 'cd'
            } else {
                currentShow.value = 'lyric'
            }
        }

        middleLStyle.value = { // 滑动切换时cd视图透明度发生变化
            opacity: 1 - touch.percent
        }
        middleRStyle.value = { // 滑动切换时lyric视图位移发生变化
            transform: `translate3d(${offsetWidth}px, 0, 0)`
        }
    }
    function onMiddleTouchEnd() {
        let offsetWidth
        let opacity

        if (currentShow.value === 'cd') {
            currentView = 'cd'
            offsetWidth = 0
            opacity = 1
        } else {
            currentView = 'lyric'
            offsetWidth = -window.innerWidth
            opacity = 0
        }

        const duration = 300 // 动画时间3秒
        middleLStyle.value = {
            opacity,
            transitionDuration: `${duration}ms` // 过渡时间
        }
        middleRStyle.value = {
            transform: `translate3d(${offsetWidth}px, 0, 0)`,
            transitionDuration: `${duration}ms`
        }
    }
    return {
        currentShow,
        middleLStyle,
        middleRStyle,
        onMiddleTouchStart,
        onMiddleTouchMove,
        onMiddleTouchEnd
    }
}
