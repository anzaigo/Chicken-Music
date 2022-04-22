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
        }
    },
    setup(props) {
        const rootRef = ref(null)
        useScroll(rootRef, props)
        return {
            rootRef
        }
    }
}
</script>
