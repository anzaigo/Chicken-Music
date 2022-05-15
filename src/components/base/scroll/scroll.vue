<template>
    <div class="scroll" ref="rootRef">
        <slot></slot>
    </div>
</template>

<script>
import { ref } from 'vue'
import useScroll from './use-scroll'
export default {
    name: 'scroll',
    props: { // 这里传递的是better-scroll的配置项参数
        click: {
            type: Boolean,
            default: true
        },
        probeType: {
            type: Number,
            default: 0
        }
    },
    emits: ['scroll'], // 自定义一个scroll事件，向外派发scroll事件
    setup(props, { emit }) {
        const rootRef = ref(null)
        const scroll = useScroll(rootRef, props, emit)
        return {
            rootRef,
            scroll
        }
    }
}
</script>
