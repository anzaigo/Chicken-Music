// 1、拿到每个子元素的title
// 2、拿到每个子元素的索引和每个子元素的dom节点，并用scrollToElement方法实现滚动到该节点上
// 3、滑动时滚动偏移的title数量
import { computed, ref } from 'vue'

export default function useShortcut(props, groupRef) {
    const ANCHOR_HEIGHT = 18 // title每一项子元素到高度
    const scrollRef = ref(null) // 拿到Scroll节点（主要是为了拿到new BScroll实例化对象）
    const shortcutList = computed(() => { // 拿到每个子元素的title
        return props.data.map((group) => {
            return group.title
        })
    })

    const touch = {} // 用来保存点击时的y轴的坐标和索引

    function onShortcutTouchStart(e) { // 拿到每个子元素的索引
        const anchorIndex = parseInt(e.target.dataset.index) // 可以使用e.target.dataset.xxx获取data-xxx的值,这里得到的anchorIndex是每个子元素的索引
        touch.y1 = e.touches[0].pageY // 保存被点击时y轴的坐标给touch
        touch.anchorIndex = anchorIndex // 保存索引值给touch
        scrollTo(anchorIndex)
    }

    function onShortcutTouchMove(e) {
        touch.y2 = e.touches[0].pageY // 保存滚动时的y轴的坐标值
        const delta = (touch.y2 - touch.y1) / ANCHOR_HEIGHT | 0 // | 0（按位或 (OR)）是向下取整的意思, delta拿到给滚动偏移的title数量
        console.log(touch.anchorIndex)
        const anchorIndex = touch.anchorIndex + delta // 点击时的索引加上滚动偏移的title的数量，就是新的滚动后的title子元素位置
        scrollTo(anchorIndex)
    }

    function scrollTo(index) {
        if (isNaN(index)) { // 当index的值为NaN时，跳出函数
            return
        }
        index = Math.max(0, Math.min(shortcutList.value.length - 1, index))
        const targetEl = groupRef.value.children[index] // targetEl获取每个子元素的dom节点
        const scroll = scrollRef.value.scroll // 拿到new BScroll实例化对象
        scroll.scrollToElement(targetEl, 500) // 滚动到目标元素
    }
    return {
        shortcutList,
        scrollRef,
        onShortcutTouchStart,
        onShortcutTouchMove
    }
}
