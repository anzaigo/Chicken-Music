import { ref } from 'vue'
import animations from 'create-keyframe-animation'

export default function useAnimation() {
    const cdWrapperRef = ref(null)
    // 当enter或leave动画没结束时，用户就快速点击了leave或enter动画，就会使得afterEnter或afterLeave没能触发，出现再次点击动画不生效的bug。可以用entering，leaving来控制触发afterEnter或afterLeave
    let entering = false
    let leaving = false

    function enter(el, done) {
        if (leaving) {
            afterLeave()
        }
        entering = true

        const { x, y, scale } = getPosAndScale()

        const animation = {
            0: {
                transform: `translate3d(${x}px, ${y}px, 0) scale(${scale})`
            },
            100: {
                transform: 'translate3d(0, 0, 0) scale(1)'
            }
        }

        // 注册动画
        animations.registerAnimation({
            name: 'move',
            animation,
            presets: {
                duration: 600,
                easing: 'cubic-bezier(0.45, 0, 0.55, 1)'
            }
        })
        // 运行动画
        animations.runAnimation(cdWrapperRef.value, 'move', done)
    }
    function afterEnter() {
        entering = false
        // 注销动画
        animations.unregisterAnimation('move')
        cdWrapperRef.value.style.animation = ''
    }
    function leave(el, done) {
        if (entering) {
            afterEnter()
        }
        leaving = true

        const { x, y, scale } = getPosAndScale()
        const cdWrapperEl = cdWrapperRef.value

        cdWrapperEl.style.transition = 'all .6s cubic-bezier(0.45, 0, 0.55, 1)'
        cdWrapperEl.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`
        cdWrapperEl.addEventListener('transitionend', next)

        function next() {
            cdWrapperEl.removeEventListener('transitionend', next)
            done()
        }
    }
    function afterLeave() {
        leaving = false

        const cdWrapperEl = cdWrapperRef.value

        cdWrapperEl.style.transition = ''
        cdWrapperEl.style.transform = ''
    }

    function getPosAndScale() {
        const targetWidth = 40 // minicd的宽度
        const paddingLeft = 40 // minicd的中心点距离屏幕左边的距离
        const paddingBottom = 30 // minicd的中心点距离屏幕下方的距离
        const paddingTop = 80 // cd到顶部屏幕的距离
        const width = window.innerWidth * 0.8 // cd的宽度
        const x = -(window.innerWidth / 2 - paddingLeft) // cd偏移到minicd中心点的x轴位置（偏移量）
        const y = window.innerHeight - paddingTop - width / 2 - paddingBottom // cd偏移到minicd中心点的y轴位置（偏移量）
        const scale = targetWidth / width // 缩小比例

        return {
            x, y, scale
        }
    }

    return {
        cdWrapperRef,
        enter,
        afterEnter,
        leave,
        afterLeave
    }
}
