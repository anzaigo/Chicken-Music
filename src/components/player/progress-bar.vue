<!-- 进度条 -->
<template>
    <div class="progress-bar" @click="onClick">
        <!-- 外部进度条 -->
        <div class="bar-inner">
            <!-- 内部进度条 -->
            <div class="progress" ref="progress" :style="progressStyle"></div>
            <!-- 按钮 -->
            <div class="progress-btn-wrapper"
              :style="btnStyle"
              @touchstart.prevent="onTouchStart"
              @touchmove.prevent="onTouchMove"
              @touchend.prevent="onTouchEnd"
            >
                <div class="progress-btn"></div>
            </div>
        </div>
    </div>
</template>

<script>
const progressBtnWidth = 16 // 按钮的宽度
export default {
    name: 'progress-bar',
    emits: ['progress-changing', 'progress-changed'],
    props: {
        progress: {
            type: Number,
            default: 0
        }
    },
    data() {
        return {
            offset: 0 // 偏移量（进度）
        }
    },
    computed: {
        progressStyle() { // 动态计算内部进度条的宽度
            return `width:${this.offset}px`
        },
        btnStyle() { // 动态计算按钮的偏移量
            return `transform:translate3d(${this.offset}px, 0, 0)`
        }
    },
    watch: {
        progress(newProgress) {
            this.setOffset(newProgress)
        }
    },
    created() {
        this.touch = {} // 用来保存进度条相关信息（为什么不在data中定义？data中定义是一个响应式的数据，这里并不需要响应式的，可以节约性能）
    },
    methods: {
        onTouchStart(e) {
            this.touch.x1 = e.touches[0].pageX // 拿到当前btn的x轴坐标
            this.touch.beginWidth = this.$refs.progress.clientWidth // 拿到内部进度条的宽度（一开始为0）
        },
        onTouchMove(e) {
            const delta = e.touches[0].pageX - this.touch.x1 // 滑动偏移了多少位置
            const tempWidth = this.touch.beginWidth + delta // 偏移后btn所在的x轴坐标
            const barWidth = this.$el.clientWidth - progressBtnWidth // 减去按钮后的进度条宽度
            const progress = Math.min(1, Math.max(tempWidth / barWidth, 0)) // 滑动偏移位置转成0~1的范围
            this.offset = barWidth * progress // 偏移量（进度）
            this.$emit('progress-changing', progress)
        },
        onTouchEnd() {
            const barWidth = this.$el.clientWidth - progressBtnWidth // 减去按钮后的进度条宽度
            const progress = this.$refs.progress.clientWidth / barWidth // 当前内部进度条的位置（0~1）
            this.$emit('progress-changed', progress)
        },
        onClick(e) {
            const rect = this.$el.getBoundingClientRect() // 获取进度条的位置
            const offseWidth = e.pageX - rect.left // 点击后的距离左边的宽度的距离
            const barWidth = this.$el.clientWidth - progressBtnWidth // 减去按钮后的进度条宽度
            const progress = offseWidth / barWidth // 被点击的进度条位置（0~1）
            this.$emit('progress-changed', progress)
        },
        setOffset(progress) {
            const barWidth = this.$el.clientWidth - progressBtnWidth // 减去按钮后的进度条宽度
            this.offset = barWidth * progress // 减去按钮宽度后的新的播放进度（0~1）
        }
    }
}
</script>

<style lang="scss" scoped>
.progress-bar{
    height: 30px;
    .bar-inner{
        position: relative;
        top: 13px;
        height: 4px;
        background: rgba(0, 0, 0, 0.3);
        .progress{
            position: absolute;
            height: 100%;
            background: $color-theme;
        }
        .progress-btn-wrapper{
            position: absolute;
            left: -8px;
            top: -13px;
            width: 30px;
            height: 30px;
            .progress-btn{
                position: relative;
                top: 7px;
                left: 7px;
                box-sizing: border-box;
                width: 16px;
                height: 16px;
                border: 3px solid $color-text;
                border-radius: 50%;
                background: $color-theme;
            }
        }
    }
}
</style>
