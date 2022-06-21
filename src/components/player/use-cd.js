import { useStore } from 'vuex'
import { computed, ref, watch } from 'vue'

export default function useCd() {
    // dom
    const cdRef = ref(null)
    const cdImageRef = ref(null)

    // vuex
    const store = useStore()
    const playing = computed(() => store.state.playing)

    const cdCls = computed(() => { // 判断是否播放
        return playing.value ? 'playing' : '' // 播放返回playing
    })

    watch(playing, (newPlaying) => {
        if (!newPlaying) {
            syncTransform(cdRef.value, cdImageRef.value)
        }
    })

    // cd旋转逻辑---旋转后要加上父元素的旋转角度
    function syncTransform(wrapper, inner) {
        const wrapperTransform = getComputedStyle(wrapper).transform
        const innerTransform = getComputedStyle(inner).transform
        console.log(innerTransform.concat('', wrapperTransform))
        wrapper.style.transform = wrapperTransform === 'none' ? innerTransform : innerTransform.concat('', wrapperTransform)
    }
    return {
        cdCls,
        cdRef,
        cdImageRef
    }
}
