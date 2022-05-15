// 1、获取dom节点元素
// 2、获取子元素的区间高度
// 3、监听滚动事件，拿到实时滚动的位置
// 4、判断实时滚动的位置落在那个区间（子元素||列表）内，取得索引
// 5、根据索引显示当前区间（子元素||列表）的标题，拿到当前组（子元素）的底部的值减去滚动的y值
// 6、根据distance滚动偏移量是否用transform属性
import { computed, nextTick, ref, watch } from 'vue'
export default function useFixed(props) {
    const TITLE_HEIGHT = 30 // 这个常量就是想要被定位偏移的标题
    const groupRef = ref(null) // 1、获取dom节点元素
    const listHeights = ref([]) // 用来保存所有子元素（列表）的高度区间
    const scrollY = ref(0) // 用来保存当前滚动的距离
    const currentIndex = ref(0) // 用来定义当前子元素（列表）渲染的索引
    const distance = ref(0) // 用来保存当前组（子元素）的底部的值减去滚动的y值，得到的值就是滚动时这个子元素的剩余高度

    // 5、根据索引显示当前区间（子元素||列表）的标题
    const fixedTitle = computed(() => {
        if (scrollY.value < 0) { // 当滚动高度小于0时，不显示标题
            return ''
        }
        const currentGroup = props.data[currentIndex.value]
        return currentGroup ? currentGroup.title : ''
    })

    // 6、根据distance滚动偏移量是否用transform属性
    const fixedStyle = computed(() => {
        const distanceVal = distance.value
        const diff = (distanceVal > 0 && distanceVal < TITLE_HEIGHT) ? distanceVal - TITLE_HEIGHT : 0
        return {
            transform: `translate3d(0,${diff}px,0)`
        }
    })

    // 3、监听滚动事件，拿到实时滚动的位置
    watch(() => props.data, async () => {
        await nextTick() // 数据获取到后，dom还没出来，无法正确计算高度，nextTick在更改了一些数据以等待 DOM 更新后立即使用它
        calculate()
    })

    // 4、判断实时滚动的位置落在那个区间（子元素||列表）内，取得索引
    watch(scrollY, (newY) => { // 监听滚动距离，拿到滚动时当前应该展示的子元素（列表）的索引
        const listHeightsVal = listHeights.value
        for (let i = 0; i < listHeightsVal.length - 1; i++) { // 为什么要减一？因为刚开始height赋值了初始化值0，长度多了一个
            const heightTop = listHeightsVal[i] // 每个子元素的顶部
            const heightBottom = listHeightsVal[i + 1] // 每个子元素的底部
            if (newY >= heightTop && newY <= heightBottom) { // 当处于某个子元素时
                currentIndex.value = i // 保存对应子元素的索引
                distance.value = heightBottom - newY // 拿到当前组（子元素）的底部的值减去滚动的y值
            }
        }
    })

    // 2、获取子元素的区间高度
    function calculate() {
        const list = groupRef.value.children // children这个方法是获取一个DOM所有子元素（列表）的集合
        const listHeightsVal = listHeights.value
        let height = 0 // 初始化第一个子元素（列表）的高度为0

        listHeightsVal.length = 0 // 初始化数组长度为0（清空）
        listHeightsVal.push(height) // 初始化第一个子元素的高度为0
        for (let i = 0; i < list.length; i++) {
            height += list[i].clientHeight
            // 累加计算出每一个子元素（列表）的高度
            listHeightsVal.push(height)
        }
    }

    function onScroll(pos) {
        scrollY.value = -pos.y // 因为向下滚动是负值，而listHeightsVal的高度是正值，所以这里要加个-值
    }

    return {
        groupRef,
        onScroll,
        fixedTitle,
        fixedStyle,
        currentIndex
    }
}
